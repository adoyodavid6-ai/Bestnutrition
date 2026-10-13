import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { cleanAttribution, attributionMetadata } from "./attribution";
import { billingConfig, billingStatus, premiumSellable } from "./config";
import { signEntitlement, signListing, verifyEntitlement, verifyListing, type Entitlement } from "./entitlement";
import { yearlySaving, type Offer } from "./offers";
import { entitlementFromSubscription } from "./server";
import { formEncode, formatMoney, verifyWebhookSignature, type StripeSubscription } from "./stripe";
import { FEATURE_STATUS, NEVER_PREMIUM, planById, premiumLiveExtras } from "../plans";

const SECRET = "x".repeat(40);

describe("billing config", () => {
  it("is not sellable without a key, a price and a long signing secret", () => {
    expect(premiumSellable(billingConfig({}))).toBe(false);
    expect(premiumSellable(billingConfig({ STRIPE_SECRET_KEY: "sk_test_1", STRIPE_PRICE_PREMIUM_MONTHLY: "price_1", ENTITLEMENT_SECRET: "short" }))).toBe(false);
    expect(premiumSellable(billingConfig({ STRIPE_SECRET_KEY: "sk_test_1", STRIPE_PRICE_PREMIUM_MONTHLY: "price_1", ENTITLEMENT_SECRET: SECRET }))).toBe(true);
  });

  it("bounds the trial and never exposes secret values", () => {
    expect(billingConfig({ PREMIUM_TRIAL_DAYS: "14" }).trialDays).toBe(14);
    expect(billingConfig({ PREMIUM_TRIAL_DAYS: "500" }).trialDays).toBe(0);
    const status = JSON.stringify(billingStatus(billingConfig({ STRIPE_SECRET_KEY: "sk_test_secretvalue", ENTITLEMENT_SECRET: SECRET })));
    expect(status).not.toContain("secretvalue");
    expect(status).not.toContain(SECRET);
    expect(status).toContain("Test mode");
  });
});

describe("Stripe helpers", () => {
  it("form-encodes nested params the way Stripe expects", () => {
    const s = formEncode({ mode: "subscription", line_items: [{ price: "price_1", quantity: 1 }], subscription_data: { metadata: { product: "premium" } }, skip: undefined });
    expect(decodeURIComponent(s)).toBe("mode=subscription&line_items[0][price]=price_1&line_items[0][quantity]=1&subscription_data[metadata][product]=premium");
  });

  it("verifies webhook signatures and rejects tampering and replays", () => {
    const payload = '{"id":"evt_1"}';
    const t = 1_760_000_000;
    const sig = createHmac("sha256", "whsec_test").update(`${t}.${payload}`).digest("hex");
    const now = t * 1000;
    expect(verifyWebhookSignature(payload, `t=${t},v1=${sig}`, "whsec_test", 300, now)).toBe(true);
    expect(verifyWebhookSignature(payload + " ", `t=${t},v1=${sig}`, "whsec_test", 300, now)).toBe(false);
    expect(verifyWebhookSignature(payload, `t=${t},v1=${sig}`, "whsec_other", 300, now)).toBe(false);
    expect(verifyWebhookSignature(payload, `t=${t},v1=${sig}`, "whsec_test", 300, now + 301_000)).toBe(false);
    expect(verifyWebhookSignature(payload, null, "whsec_test")).toBe(false);
  });

  it("formats money for two-decimal and zero-decimal currencies", () => {
    expect(formatMoney(499, "usd")).toBe("$4.99");
    expect(formatMoney(4000, "gbp")).toBe("£40");
    expect(formatMoney(500, "jpy")).toBe("¥500");
  });

  it("works out the yearly saving only when currencies match", () => {
    const o = (interval: "month" | "year", amount: number, currency = "usd"): Offer => ({ interval, amount, currency, display: "", otherCurrencies: [] });
    expect(yearlySaving(o("month", 500), o("year", 4800))).toBe(20);
    expect(yearlySaving(o("month", 500), o("year", 4800, "gbp"))).toBe(0);
    expect(yearlySaving(null, o("year", 4800))).toBe(0);
  });
});

describe("entitlements", () => {
  const ent: Entitlement = { plan: "premium", cus: "cus_1", sub: "sub_1", exp: 2_000_000_000 };

  it("round-trips a signed token and rejects forgeries", () => {
    const token = signEntitlement(ent, SECRET);
    expect(verifyEntitlement(token, SECRET, 1_900_000_000)).toEqual({ valid: true, entitlement: ent, expired: false });
    const [body] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...ent, exp: 4_000_000_000 })).toString("base64url");
    expect(verifyEntitlement(`${forged}.${token.split(".")[1]}`, SECRET).valid).toBe(false);
    expect(verifyEntitlement(`${body}.bad`, SECRET).valid).toBe(false);
    expect(verifyEntitlement(token, "y".repeat(40)).valid).toBe(false);
    expect(verifyEntitlement(undefined, SECRET).valid).toBe(false);
  });

  it("flags expiry so the server re-checks Stripe", () => {
    const token = signEntitlement(ent, SECRET);
    expect(verifyEntitlement(token, SECRET, 2_000_000_001)).toMatchObject({ valid: true, expired: true });
  });

  it("grants Premium only for active, trialing or past-due subscriptions", () => {
    const sub = (status: StripeSubscription["status"]): StripeSubscription => ({ id: "sub_1", customer: "cus_1", status, cancel_at_period_end: false, items: { data: [{ current_period_end: 1_000_100_000, price: { id: "p" } }] } });
    const now = 1_000_000_000;
    expect(entitlementFromSubscription(sub("active"), now)).toMatchObject({ plan: "premium", cus: "cus_1", exp: now + 24 * 3600 });
    expect(entitlementFromSubscription(sub("trialing"), now)?.trial).toBe(true);
    expect(entitlementFromSubscription(sub("canceled"), now)).toBeNull();
    expect(entitlementFromSubscription(sub("unpaid"), now)).toBeNull();
    // Period ends before the daily re-check: expire at period end plus a short grace.
    const ending = { ...sub("active"), items: { data: [{ current_period_end: now + 3600, price: { id: "p" } }] } };
    expect(entitlementFromSubscription(ending, now)!.exp).toBe(Math.min(now + 3600 + 3 * 24 * 3600, now + 24 * 3600));
  });

  it("signs featured-listing payment links per listing", () => {
    const sig = signListing("green-table", SECRET);
    expect(verifyListing("green-table", sig, SECRET)).toBe(true);
    expect(verifyListing("other-listing", sig, SECRET)).toBe(false);
    expect(verifyListing("Bad Slug!", signListing("Bad Slug!", SECRET), SECRET)).toBe(false);
    expect(verifyListing("green-table", null, SECRET)).toBe(false);
  });
});

describe("attribution", () => {
  it("keeps known UTM fields, drops junk and prefixes Stripe metadata", () => {
    const a = cleanAttribution({ utm_source: "instagram", utm_campaign: "launch", evil: "x", landing: "/free-meal-plan" });
    expect(a).toEqual({ utm_source: "instagram", utm_campaign: "launch", landing: "/free-meal-plan" });
    expect(attributionMetadata(a)).toEqual({ attr_utm_source: "instagram", attr_utm_campaign: "launch", attr_landing: "/free-meal-plan" });
    expect(cleanAttribution({ utm_source: "x".repeat(500) })).toBeUndefined();
    expect(cleanAttribution("nope")).toBeUndefined();
  });
});

describe("plans", () => {
  it("only sells Premium features that exist today", () => {
    const live = premiumLiveExtras();
    expect(live).toContain("planner.export");
    expect(live.every((f) => FEATURE_STATUS[f] === "live")).toBe(true);
  });

  it("keeps health information and basic planning free", () => {
    for (const f of NEVER_PREMIUM) expect(planById("free").features).toContain(f);
    expect(planById("free").features).toContain("shopping.calendar");
  });
});
