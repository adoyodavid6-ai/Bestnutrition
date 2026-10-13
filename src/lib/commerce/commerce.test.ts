import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collections } from "@/content/collections";
import { signToken, verifyToken } from "../billing/entitlement";
import { billingConfig } from "../billing/config";
import { monthlyAmount, summariseBalance, summariseCheckouts, summariseInvoices, summariseSubscriptions, type Sub } from "../billing/revenue";
import { EXPERIMENTS, assignVariant, cleanAssignments, compareVariants } from "../experiments";
import { AFFILIATE_PRODUCTS, affiliateProblems, sponsorProblems } from "./disclosure";
import { signDownload, verifyDownload } from "./delivery";
import { LISTING_PACKAGES, orderListings } from "./listings";
import { PRODUCTS, productSellable } from "./products";
import { REVENUE_MATRIX, matrixToCsv } from "./revenue-matrix";
import { STREAMS, streamStatus } from "./streams";

const SECRET = "s".repeat(40);
const c = billingConfig({ STRIPE_SECRET_KEY: "sk_test_x", ENTITLEMENT_SECRET: SECRET, STRIPE_PRICE_PREMIUM_MONTHLY: "pm", STRIPE_PRICE_PREMIUM_YEARLY: "py", STRIPE_PRICE_LISTING_FEATURED: "pl" });

describe("signed tokens", () => {
  it("bind the purpose and expire", () => {
    const t = signToken("restore", { cus: "c", sub: "s", exp: 2_000 }, SECRET);
    expect(verifyToken("restore", t, SECRET, 1_000)).toMatchObject({ cus: "c" });
    expect(verifyToken("download", t, SECRET, 1_000)).toBeNull();
    expect(verifyToken("restore", t, SECRET, 2_001)).toBeNull();
    expect(verifyToken("restore", t + "x", SECRET, 1_000)).toBeNull();
  });

  it("issue download grants per product and session", () => {
    const t = signDownload({ slug: "meal-planning-workbook", session: "cs_1", exp: 5_000 }, SECRET);
    expect(verifyDownload(t, SECRET, 4_000)?.slug).toBe("meal-planning-workbook");
    expect(verifyDownload(t, "x".repeat(40), 4_000)).toBeNull();
  });
});

describe("experiments", () => {
  it("assigns deterministically and roughly by weight", () => {
    const e = EXPERIMENTS[0];
    expect(assignVariant(e, "visitor-1")).toBe(assignVariant(e, "visitor-1"));
    const counts: Record<string, number> = {};
    for (let i = 0; i < 4000; i++) counts[assignVariant(e, `v${i}`)] = (counts[assignVariant(e, `v${i}`)] ?? 0) + 1;
    for (const v of e.variants) expect(counts[v.id] / 4000).toBeGreaterThan(0.45);
  });

  it("uses control when not running and rejects unknown assignments", () => {
    expect(assignVariant({ ...EXPERIMENTS[0], status: "paused" }, "anyone")).toBe(EXPERIMENTS[0].control);
    expect(cleanAssignments({ "pricing-default-interval": "yearly-first", bogus: "x", "upgrade-prompt-copy": "free-money" })).toEqual({ "pricing-default-interval": "yearly-first" });
  });

  it("won't call a winner on small samples", () => {
    expect(compareVariants({ n: 20, conversions: 2 }, { n: 20, conversions: 10 }).verdict).toBe("Not enough data yet");
    expect(compareVariants({ n: 1000, conversions: 100 }, { n: 1000, conversions: 150 }).verdict).toBe("B ahead (significant)");
    expect(compareVariants({ n: 1000, conversions: 100 }, { n: 1000, conversions: 105 }).verdict).toBe("No significant difference");
  });
});

describe("revenue reporting", () => {
  it("separates gross, refunds, fees and net, and ignores payouts", () => {
    const s = summariseBalance([
      { id: "1", type: "charge", amount: 499, fee: 45, net: 454, currency: "usd", created: 0 },
      { id: "2", type: "refund", amount: -499, fee: 0, net: -499, currency: "usd", created: 0 },
      { id: "3", type: "charge", amount: 399, fee: 30, net: 369, currency: "gbp", created: 0 },
      { id: "4", type: "payout", amount: -1000, fee: 0, net: -1000, currency: "usd", created: 0 },
    ]);
    expect(s.gross).toEqual({ usd: 499, gbp: 399 });
    expect(s.refunds).toEqual({ usd: 499 });
    expect(s.fees).toEqual({ usd: 45, gbp: 30 });
    expect(s.net).toEqual({ usd: -45, gbp: 369 });
  });

  it("normalises MRR, excludes trials and computes churn", () => {
    const price = (id: string, unit: number, interval: string) => ({ id, unit_amount: unit, currency: "usd", recurring: { interval, interval_count: 1 } });
    expect(monthlyAmount(price("py", 4800, "year"))).toBe(400);
    const subs: Sub[] = [
      { id: "a", customer: "c1", status: "active", created: 50, items: { data: [{ price: price("pm", 499, "month") }] } },
      { id: "b", customer: "c2", status: "active", created: 150, items: { data: [{ price: price("py", 4800, "year") }] } },
      { id: "t", customer: "c3", status: "trialing", created: 160, items: { data: [{ price: price("pm", 499, "month") }] } },
      { id: "x", customer: "c4", status: "canceled", created: 10, canceled_at: 120, ended_at: 120, items: { data: [{ price: price("pm", 499, "month") }] } },
      { id: "l", customer: "c5", status: "active", created: 10, metadata: { product: "listing-featured" }, items: { data: [{ price: price("pl", 2900, "month") }] } },
    ];
    const r = summariseSubscriptions(subs, 100, c);
    expect(r.premium.active).toBe(3);
    expect(r.premium.trialing).toBe(1);
    expect(r.premium.mrr).toEqual({ usd: 899 });
    expect(r.premium.newInPeriod).toBe(2);
    expect(r.premium.canceledInPeriod).toBe(1);
    expect(r.premiumChurn).toBe(0.5);
    expect(r.listing.mrr).toEqual({ usd: 2900 });
  });

  it("groups invoices by product and market without mixing currencies", () => {
    const r = summariseInvoices(
      [
        { id: "i1", status: "paid", currency: "usd", amount_paid: 499, customer: "c1", created: 0, tax: 0, customer_address: { country: "US" }, lines: { data: [{ price: { id: "pm" } }] } },
        { id: "i2", status: "paid", currency: "gbp", amount_paid: 480, customer: "c2", created: 0, tax: 80, customer_address: { country: "GB" }, lines: { data: [{ price: { id: "pl" } }] } },
      ],
      c,
    );
    expect(r.byProduct).toEqual({ "Premium (monthly)": { usd: 499 }, "Featured listing": { gbp: 480 } });
    expect(r.byCountry).toEqual({ US: { usd: 499 }, GB: { gbp: 480 } });
    expect(r.tax).toEqual({ usd: 0, gbp: 80 });
    expect(r.payingCustomers).toBe(2);
  });

  it("measures checkout abandonment, sources and experiment arms", () => {
    const r = summariseCheckouts([
      { id: "1", status: "complete", mode: "subscription", created: 0, amount_total: 499, currency: "usd", metadata: { product: "premium", attr_utm_source: "instagram", "exp_pricing-default-interval": "yearly-first" } },
      { id: "2", status: "expired", mode: "subscription", created: 0, amount_total: 499, currency: "usd", metadata: { product: "premium", "exp_pricing-default-interval": "monthly-first" } },
      { id: "3", status: "complete", mode: "payment", created: 0, amount_total: 900, currency: "usd", metadata: { product: "digital-product", product_slug: "meal-planning-workbook" } },
    ]);
    expect(r.funnel.premium).toEqual({ started: 2, completed: 1 });
    expect(r.sources.instagram.completed).toBe(1);
    expect(r.products["meal-planning-workbook"]).toEqual({ sold: 1, amount: { usd: 900 } });
    const exp = r.experiments.find((e) => e.id === "pricing-default-interval")!;
    expect(exp.arms).toEqual([
      { variant: "monthly-first", n: 1, conversions: 0 },
      { variant: "yearly-first", n: 1, conversions: 1 },
    ]);
    expect(exp.verdict).toBe("Not enough data yet");
  });
});

describe("commercial configuration", () => {
  it("never reports a stream live without configuration", () => {
    const none = billingConfig({});
    for (const s of STREAMS) expect(streamStatus(s.id, none, {})).not.toBe("live");
    expect(streamStatus("premium", c)).toBe("live");
  });

  it("only sells products with a Stripe price", () => {
    const p = PRODUCTS[0];
    expect(productSellable(p, c, {})).toBe(false);
    expect(productSellable(p, c, { [p.priceEnv]: "price_x" })).toBe(true);
    for (const prod of PRODUCTS) for (const f of prod.files) expect(statSync(path.join(process.cwd(), "src/products/files", f.file)).size).toBeGreaterThan(10_000);
  });

  it("promises only live listing benefits in sellable packages", () => {
    for (const pkg of LISTING_PACKAGES.filter((p) => p.available)) expect(pkg.benefits.every((b) => b.status === "live")).toBe(true);
    expect(orderListings([{ name: "B", promoted: false }, { name: "A", promoted: false }, { name: "Z", promoted: true }]).map((x) => x.name)).toEqual(["Z", "A", "B"]);
  });

  it("exports the full feature-to-revenue matrix", () => {
    const csv = matrixToCsv();
    expect(csv.trim().split("\r\n")).toHaveLength(REVENUE_MATRIX.length + 1);
    for (const r of REVENUE_MATRIX) for (const v of Object.values(r)) expect(String(v).length).toBeGreaterThan(0);
  });
});

describe("disclosure rules", () => {
  it("requires agreements and sign-off for sponsored collections", () => {
    for (const col of collections) if (col.sponsor) expect(sponsorProblems(col.sponsor)).toEqual([]);
    expect(sponsorProblems({ name: "X", agreementRef: "", editorialSignOff: { by: "", date: "" }, kind: "sponsored" })).toHaveLength(2);
  });

  it("requires reviewed, honest affiliate data", () => {
    for (const p of AFFILIATE_PRODUCTS) expect(affiliateProblems(p)).toEqual([]);
    expect(affiliateProblems({ id: "x", name: "x", merchant: "m", url: "http://x", markets: [], category: "meal-prep", intendedUse: "", features: [], limitations: [], price: { amount: 1, currency: "usd", checkedAt: "" }, reviewedAt: "", reviewer: "" })).toHaveLength(5);
  });

  it("keeps affiliate links and ads out of health-condition and supplement pages", () => {
    const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(path.join(dir, f)).isDirectory() ? files(path.join(dir, f)) : [path.join(dir, f)]));
    for (const f of [...files("src/app/health-conditions"), ...files("src/app/supplements"), "src/content/conditions.ts", "src/content/supplements.ts"]) {
      expect(readFileSync(f, "utf8"), f).not.toMatch(/AffiliateLink|SponsorLabel|rel="sponsored/);
    }
  });
});
