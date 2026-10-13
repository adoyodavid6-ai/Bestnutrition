import { EXPERIMENTS, compareVariants } from "../experiments";
import { billingConfig, type BillingConfig } from "./config";
import { listAll } from "./stripe";

/**
 * Revenue reporting, computed from Stripe objects (the source of truth). Pure aggregation
 * functions are separated from the loader so they can be unit-tested.
 *
 * Vocabulary used on the dashboard:
 * - Gross sales: money charged to customers, before refunds and fees (includes any tax collected).
 * - Net receipts: what Stripe settles to you after refunds and Stripe fees (still includes tax you
 *   may owe). Neither figure is profit.
 */

export interface BalanceTxn {
  id: string;
  type: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  created: number;
}

export interface Invoice {
  id: string;
  status: string;
  currency: string;
  amount_paid: number;
  customer: string | null;
  created: number;
  tax?: number | null;
  total_taxes?: { amount: number }[];
  customer_address?: { country?: string | null } | null;
  metadata?: Record<string, string>;
  lines?: { data: { price?: { id: string } | null; pricing?: { price_details?: { price?: string } } }[] };
  subscription_details?: { metadata?: Record<string, string> } | null;
  parent?: { subscription_details?: { metadata?: Record<string, string> } | null } | null;
}

export interface Sub {
  id: string;
  customer: string;
  status: string;
  created: number;
  canceled_at?: number | null;
  ended_at?: number | null;
  metadata?: Record<string, string>;
  items: { data: { quantity?: number; price: { id: string; unit_amount: number | null; currency: string; recurring: { interval: string; interval_count: number } | null } }[] };
}

export interface Session {
  id: string;
  status: string;
  mode: string;
  created: number;
  amount_total: number | null;
  currency: string | null;
  metadata?: Record<string, string>;
}

type ByCurrency = Record<string, number>;
const add = (m: ByCurrency, cur: string, v: number) => ((m[cur] = (m[cur] ?? 0) + v), m);

const SALE_TYPES = new Set(["charge", "payment"]);
const REFUND_TYPES = new Set(["refund", "payment_refund", "payment_failure_refund"]);
const EXCLUDED = new Set(["payout", "payout_cancel", "payout_failure", "transfer", "transfer_cancel", "transfer_failure", "topup", "topup_reversal"]);

/** Gross, refunds, Stripe fees and net per currency, from balance transactions. */
export function summariseBalance(txns: BalanceTxn[]) {
  const gross: ByCurrency = {};
  const refunds: ByCurrency = {};
  const fees: ByCurrency = {};
  const net: ByCurrency = {};
  for (const t of txns) {
    if (EXCLUDED.has(t.type)) continue;
    if (SALE_TYPES.has(t.type)) add(gross, t.currency, t.amount);
    if (REFUND_TYPES.has(t.type)) add(refunds, t.currency, -t.amount);
    add(fees, t.currency, t.fee);
    add(net, t.currency, t.net);
  }
  return { gross, refunds, fees, net };
}

const invoiceTax = (i: Invoice) => i.tax ?? (i.total_taxes ?? []).reduce((s, t) => s + t.amount, 0);
const invoicePriceIds = (i: Invoice) => (i.lines?.data ?? []).map((l) => l.price?.id ?? l.pricing?.price_details?.price).filter(Boolean) as string[];
const invoiceMeta = (i: Invoice) => i.subscription_details?.metadata ?? i.parent?.subscription_details?.metadata ?? {};

const ONE_TIME = new Set(["digital-product", "pro-signup"]);

export function productOfPrice(priceId: string | undefined, c: BillingConfig): string {
  if (!priceId) return "Other";
  if (priceId === c.prices.premiumMonthly) return "Premium (monthly)";
  if (priceId === c.prices.premiumYearly) return "Premium (yearly)";
  if (priceId === c.prices.listingFeatured) return "Featured listing";
  return "Other";
}

/** Paid subscription invoices grouped by product, currency and billing country. */
export function summariseInvoices(invoices: Invoice[], c: BillingConfig) {
  const byProduct: Record<string, ByCurrency> = {};
  const byCountry: Record<string, ByCurrency> = {};
  const tax: ByCurrency = {};
  const payingCustomers = new Set<string>();
  const customersByCurrency: Record<string, Set<string>> = {};
  for (const i of invoices) {
    if (i.status !== "paid" || i.amount_paid <= 0) continue;
    // One-time purchases (products, sign-up fees) are counted from Checkout Sessions, not here.
    if (ONE_TIME.has(i.metadata?.product ?? "")) continue;
    let product = productOfPrice(invoicePriceIds(i)[0], c);
    if (product === "Other" && invoiceMeta(i).product === "listing-featured") product = "Featured listing";
    if (product === "Other" && invoiceMeta(i).product === "premium") product = "Premium";
    add((byProduct[product] ??= {}), i.currency, i.amount_paid);
    add((byCountry[i.customer_address?.country || "Unknown"] ??= {}), i.currency, i.amount_paid);
    add(tax, i.currency, invoiceTax(i));
    if (i.customer) {
      payingCustomers.add(i.customer);
      (customersByCurrency[i.currency] ??= new Set()).add(i.customer);
    }
  }
  const revenue: ByCurrency = {};
  for (const m of Object.values(byProduct)) for (const [cur, v] of Object.entries(m)) add(revenue, cur, v);
  /** Average subscription revenue per paying customer, per currency, for the period. */
  const arppu: ByCurrency = Object.fromEntries(Object.entries(revenue).map(([cur, v]) => [cur, v / (customersByCurrency[cur]?.size || 1)]));
  return { byProduct, byCountry, tax, revenue, arppu, payingCustomers: payingCustomers.size };
}

const ACTIVE = new Set(["active", "trialing", "past_due"]);

/** Monthly amount of one subscription item, normalised from its billing interval. */
export function monthlyAmount(p: Sub["items"]["data"][number]["price"], quantity = 1) {
  if (!p.recurring || p.unit_amount == null) return 0;
  const perInterval = (p.unit_amount * quantity) / Math.max(p.recurring.interval_count, 1);
  const factor: Record<string, number> = { day: 365 / 12, week: 52 / 12, month: 1, year: 1 / 12 };
  return perInterval * (factor[p.recurring.interval] ?? 0);
}

export function kindOfSub(s: Sub, c: BillingConfig) {
  const ids = s.items.data.map((i) => i.price.id);
  if (s.metadata?.product === "listing-featured" || ids.includes(c.prices.listingFeatured ?? "\u0000")) return "listing";
  return "premium";
}

/** Subscription health over a period [start, end). Trials are excluded from MRR. */
export function summariseSubscriptions(subs: Sub[], start: number, c: BillingConfig) {
  const result = {
    premium: { active: 0, trialing: 0, pastDue: 0, newInPeriod: 0, canceledInPeriod: 0, activeAtStart: 0, mrr: {} as ByCurrency },
    listing: { active: 0, trialing: 0, pastDue: 0, newInPeriod: 0, canceledInPeriod: 0, activeAtStart: 0, mrr: {} as ByCurrency },
  };
  for (const s of subs) {
    const r = result[kindOfSub(s, c)];
    const endedAt = s.ended_at ?? (s.status === "canceled" ? s.canceled_at : null) ?? null;
    if (ACTIVE.has(s.status)) {
      r.active++;
      if (s.status === "trialing") r.trialing++;
      if (s.status === "past_due") r.pastDue++;
      if (s.status !== "trialing") for (const it of s.items.data) add(r.mrr, it.price.currency, monthlyAmount(it.price, it.quantity ?? 1));
    }
    if (s.created >= start) r.newInPeriod++;
    if (s.created < start && (!endedAt || endedAt >= start)) r.activeAtStart++;
    if (endedAt && endedAt >= start && s.status === "canceled") r.canceledInPeriod++;
  }
  const churn = (r: typeof result.premium) => (r.activeAtStart ? r.canceledInPeriod / r.activeAtStart : null);
  return { ...result, premiumChurn: churn(result.premium), listingChurn: churn(result.listing) };
}

/** Checkout funnel, acquisition sources and experiment results, from Checkout Sessions. */
export function summariseCheckouts(sessions: Session[]) {
  const funnel: Record<string, { started: number; completed: number }> = {};
  const sources: Record<string, { completed: number; amount: ByCurrency }> = {};
  const products: Record<string, { sold: number; amount: ByCurrency }> = {};
  for (const s of sessions) {
    const product = s.metadata?.product ?? "unknown";
    const f = (funnel[product] ??= { started: 0, completed: 0 });
    f.started++;
    if (s.status !== "complete") continue;
    f.completed++;
    const src = [s.metadata?.attr_utm_source, s.metadata?.attr_utm_campaign].filter(Boolean).join(" / ") || (s.metadata?.attr_referrer ? `referral: ${s.metadata.attr_referrer}` : "direct or unknown");
    const so = (sources[src] ??= { completed: 0, amount: {} });
    so.completed++;
    if (s.amount_total && s.currency) add(so.amount, s.currency, s.amount_total);
    const oneTime = s.mode === "payment" ? (s.metadata?.product === "pro-signup" ? "Professional sign-up fee" : s.metadata?.product_slug) : undefined;
    if (oneTime) {
      const p = (products[oneTime] ??= { sold: 0, amount: {} });
      p.sold++;
      if (s.amount_total && s.currency) add(p.amount, s.currency, s.amount_total);
    }
  }
  const experiments = EXPERIMENTS.map((e) => {
    const arms = e.variants.map((v) => {
      const inArm = sessions.filter((s) => s.metadata?.[`exp_${e.id}`] === v.id);
      return { variant: v.id, n: inArm.length, conversions: inArm.filter((s) => s.status === "complete").length };
    });
    const cmp = arms.length === 2 ? compareVariants(arms[0], arms[1]) : null;
    return { id: e.id, metric: "Checkout completion", arms, verdict: cmp?.verdict ?? "—" };
  });
  return { funnel, sources, products, experiments };
}

export interface RevenueReport {
  configured: boolean;
  days: number;
  generatedAt: string;
  truncated: string[];
  error?: string;
  balance?: ReturnType<typeof summariseBalance>;
  invoices?: ReturnType<typeof summariseInvoices>;
  subscriptions?: ReturnType<typeof summariseSubscriptions>;
  checkouts?: ReturnType<typeof summariseCheckouts>;
}

export async function loadRevenue(days: number, c: BillingConfig = billingConfig()): Promise<RevenueReport> {
  const base = { days, generatedAt: new Date().toISOString(), truncated: [] as string[] };
  if (!c.secretKey) return { configured: false, ...base };
  const start = Math.floor(Date.now() / 1000) - days * 86400;
  const since = { "created[gte]": start };
  try {
    const [bt, inv, subs, sess] = await Promise.all([
      listAll<BalanceTxn>("balance_transactions", since, 5000, c),
      listAll<Invoice>("invoices", { ...since, status: "paid" }, 2000, c),
      listAll<Sub>("subscriptions", { status: "all" }, 5000, c),
      listAll<Session>("checkout/sessions", since, 5000, c),
    ]);
    const truncated = [bt.truncated && "balance transactions", inv.truncated && "invoices", subs.truncated && "subscriptions", sess.truncated && "checkout sessions"].filter(Boolean) as string[];
    return {
      configured: true,
      ...base,
      truncated,
      balance: summariseBalance(bt.data),
      invoices: summariseInvoices(inv.data, c),
      subscriptions: summariseSubscriptions(subs.data, start, c),
      checkouts: summariseCheckouts(sess.data),
    };
  } catch (e) {
    return { configured: true, ...base, error: e instanceof Error ? e.message : "Stripe request failed" };
  }
}
