import { createHmac, timingSafeEqual } from "node:crypto";
import { billingConfig, type BillingConfig } from "./config";

/**
 * A deliberately small Stripe REST client (fetch + form encoding), so the app needs no SDK.
 * Only the handful of endpoints NourishWell uses are wrapped.
 */

export class StripeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Params = Record<string, unknown>;

/** Encode nested objects/arrays the way Stripe expects: a[b][0][c]=v. */
export function formEncode(params: Params, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") parts.push(formEncode(item as Params, `${key}[${i}]`));
        else parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") {
      parts.push(formEncode(v as Params, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

async function call<T>(method: "GET" | "POST", path: string, params?: Params, opts: { config?: BillingConfig; revalidate?: number } = {}): Promise<T> {
  const c = opts.config ?? billingConfig();
  if (!c.secretKey) throw new StripeError("Stripe is not configured", 503);
  const query = method === "GET" && params ? `?${formEncode(params)}` : "";
  const res = await fetch(`${c.apiBase}/v1/${path}${query}`, {
    method,
    headers: {
      authorization: `Bearer ${c.secretKey}`,
      ...(method === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" && params ? formEncode(params) : undefined,
    signal: AbortSignal.timeout(10_000),
    ...(opts.revalidate ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" as const }),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new StripeError(json.error?.message ?? `Stripe responded ${res.status}`, res.status);
  return json;
}

export interface StripePrice {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  recurring: { interval: "day" | "week" | "month" | "year"; interval_count: number } | null;
  currency_options?: Record<string, { unit_amount: number | null }>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  metadata?: Record<string, string>;
  created?: number;
  canceled_at?: number | null;
  ended_at?: number | null;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "incomplete" | "incomplete_expired" | "paused";
  cancel_at_period_end: boolean;
  current_period_end?: number;
  trial_end?: number | null;
  items?: { data: { current_period_end?: number; price: { id: string } }[] };
}

export interface StripeCheckoutSession {
  id: string;
  url?: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  mode: "payment" | "setup" | "subscription";
  customer: string | null;
  subscription: string | null;
  metadata?: Record<string, string>;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null } | null;
}

/** Prices change rarely; cache them for an hour so the pricing page stays fast. */
export function getPrice(id: string, config?: BillingConfig) {
  return call<StripePrice>("GET", `prices/${encodeURIComponent(id)}`, { "expand[]": "currency_options" }, { config, revalidate: 3600 });
}

export function createCheckoutSession(params: Params, config?: BillingConfig) {
  return call<StripeCheckoutSession>("POST", "checkout/sessions", params, { config });
}

export function getCheckoutSession(id: string, config?: BillingConfig) {
  return call<StripeCheckoutSession>("GET", `checkout/sessions/${encodeURIComponent(id)}`, undefined, { config });
}

export function getSubscription(id: string, config?: BillingConfig) {
  return call<StripeSubscription>("GET", `subscriptions/${encodeURIComponent(id)}`, undefined, { config });
}

export interface StripeList<T> {
  data: T[];
  has_more: boolean;
}

export function listCustomersByEmail(email: string, config?: BillingConfig) {
  return call<StripeList<{ id: string; email: string | null }>>("GET", "customers", { email, limit: 10 }, { config });
}

export function listSubscriptions(params: Params, config?: BillingConfig) {
  return call<StripeList<StripeSubscription & { metadata?: Record<string, string> }>>("GET", "subscriptions", params, { config });
}

/** Generic paginated list for the revenue dashboard (stops at `max` objects). */
export async function listAll<T extends { id: string }>(path: string, params: Params, max = 1000, config?: BillingConfig): Promise<{ data: T[]; truncated: boolean }> {
  const out: T[] = [];
  let starting_after: string | undefined;
  for (;;) {
    const page = await call<StripeList<T>>("GET", path, { ...params, limit: 100, starting_after }, { config });
    out.push(...page.data);
    if (!page.has_more || page.data.length === 0) return { data: out, truncated: false };
    if (out.length >= max) return { data: out.slice(0, max), truncated: true };
    starting_after = page.data[page.data.length - 1].id;
  }
}

export function createPortalSession(customer: string, returnUrl: string, config?: BillingConfig) {
  return call<{ url: string }>("POST", "billing_portal/sessions", { customer, return_url: returnUrl }, { config });
}

/** The subscription's period end (newer API versions report it per item). */
export function periodEnd(sub: StripeSubscription): number | undefined {
  return sub.current_period_end ?? sub.items?.data[0]?.current_period_end;
}

export const ACTIVE_STATUSES: StripeSubscription["status"][] = ["active", "trialing", "past_due"];

/**
 * Verify a Stripe-Signature header (t=timestamp,v1=hex HMAC-SHA256 of "t.payload").
 * Rejects stale timestamps to stop replays.
 */
export function verifyWebhookSignature(payload: string, header: string | null, secret: string, toleranceSec = 300, now = Date.now()): boolean {
  if (!header) return false;
  const parts = header.split(",").map((p) => p.split("=", 2) as [string, string]);
  const t = Number(parts.find(([k]) => k === "t")?.[1]);
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(t) || sigs.length === 0) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex"));
  return sigs.some((s) => {
    const got = Buffer.from(s);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

/** Format a Stripe amount (smallest currency unit) for display, respecting zero-decimal currencies. */
export function formatMoney(amount: number, currency: string, locale = "en") {
  const fmt = new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase() });
  const digits = fmt.resolvedOptions().maximumFractionDigits ?? 2;
  const value = amount / 10 ** digits;
  return new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: Number.isInteger(value) ? 0 : digits }).format(value);
}
