/**
 * Billing configuration, read from environment variables on the server only.
 *
 * The owner's list prices are set here in US dollars (the settlement currency) and can be changed
 * with env vars without touching code. A Stripe Price ID, when configured, takes precedence. The
 * same value is used for display and for the charge, so what visitors see is what they pay.
 * When a variable is missing, the matching feature reports itself as "not configured".
 */

/** Owner-set list prices in US dollars. */
export const DEFAULT_USD_PRICES = { premiumMonthly: "14.99", proSignup: "100.00" };

/** "14.99" → 1499 cents; invalid or non-positive values fall back to the default. */
export function usdToCents(value: string | undefined, fallback: string): number {
  const n = Number.parseFloat((value ?? "").trim());
  const cents = Math.round((Number.isFinite(n) && n > 0 && n < 100_000 ? n : Number.parseFloat(fallback)) * 100);
  return cents;
}

export interface BillingConfig {
  secretKey?: string;
  webhookSecret?: string;
  apiBase: string;
  prices: { premiumMonthly?: string; premiumYearly?: string; listingFeatured?: string };
  /** List prices in US cents, used when no Stripe Price ID is configured. */
  usd: { premiumMonthly: number; proSignup: number };
  /** Let buyers pay in their local currency at Checkout (Stripe Adaptive Pricing); funds settle in USD. */
  adaptivePricing: boolean;
  trialDays: number;
  entitlementSecret?: string;
  eventsWebhook?: string;
}

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function billingConfig(env: Record<string, string | undefined> = process.env): BillingConfig {
  const trial = Number.parseInt(env.PREMIUM_TRIAL_DAYS ?? "", 10);
  return {
    secretKey: clean(env.STRIPE_SECRET_KEY),
    webhookSecret: clean(env.STRIPE_WEBHOOK_SECRET),
    apiBase: clean(env.STRIPE_API_BASE) ?? "https://api.stripe.com",
    prices: {
      premiumMonthly: clean(env.STRIPE_PRICE_PREMIUM_MONTHLY),
      premiumYearly: clean(env.STRIPE_PRICE_PREMIUM_YEARLY),
      listingFeatured: clean(env.STRIPE_PRICE_LISTING_FEATURED),
    },
    usd: { premiumMonthly: usdToCents(env.PREMIUM_MONTHLY_PRICE_USD, DEFAULT_USD_PRICES.premiumMonthly), proSignup: usdToCents(env.PRO_SIGNUP_FEE_USD, DEFAULT_USD_PRICES.proSignup) },
    adaptivePricing: (env.STRIPE_ADAPTIVE_PRICING ?? "").trim().toLowerCase() !== "off",
    trialDays: Number.isFinite(trial) && trial > 0 && trial <= 90 ? trial : 0,
    entitlementSecret: clean(env.ENTITLEMENT_SECRET) && clean(env.ENTITLEMENT_SECRET)!.length >= 32 ? clean(env.ENTITLEMENT_SECRET) : undefined,
    eventsWebhook: clean(env.BILLING_EVENTS_WEBHOOK_URL),
  };
}

/** Premium can be sold once Stripe and the signing secret are set (the monthly list price always exists). */
export function premiumSellable(c: BillingConfig = billingConfig()) {
  return Boolean(c.secretKey && c.entitlementSecret);
}

/** The professional sign-up fee needs the same two settings. */
export function proSignupSellable(c: BillingConfig = billingConfig()) {
  return Boolean(c.secretKey && c.entitlementSecret);
}

export function listingSellable(c: BillingConfig = billingConfig()) {
  return Boolean(c.secretKey && c.entitlementSecret && c.prices.listingFeatured);
}

/** A status summary for the admin panel. Never includes secret values. */
export function billingStatus(c: BillingConfig = billingConfig()) {
  return [
    { label: "Stripe secret key", ok: Boolean(c.secretKey), env: "STRIPE_SECRET_KEY", note: c.secretKey ? (c.secretKey.startsWith("sk_live_") || c.secretKey.startsWith("rk_live_") ? "Live mode" : "Test mode") : undefined },
    { label: "Premium monthly price", ok: true, env: "PREMIUM_MONTHLY_PRICE_USD or STRIPE_PRICE_PREMIUM_MONTHLY", note: c.prices.premiumMonthly ? "Stripe Price" : `US$${(c.usd.premiumMonthly / 100).toFixed(2)} (list price)` },
    { label: "Professional sign-up fee", ok: true, env: "PRO_SIGNUP_FEE_USD", note: `US$${(c.usd.proSignup / 100).toFixed(2)} one-time` },
    { label: "Pay in local currency (Adaptive Pricing)", ok: c.adaptivePricing, env: "STRIPE_ADAPTIVE_PRICING", note: c.adaptivePricing ? "On — settles in USD" : "Off" },
    { label: "Premium yearly price", ok: Boolean(c.prices.premiumYearly), env: "STRIPE_PRICE_PREMIUM_YEARLY" },
    { label: "Featured listing price", ok: Boolean(c.prices.listingFeatured), env: "STRIPE_PRICE_LISTING_FEATURED" },
    { label: "Entitlement signing secret (32+ chars)", ok: Boolean(c.entitlementSecret), env: "ENTITLEMENT_SECRET" },
    { label: "Webhook signing secret", ok: Boolean(c.webhookSecret), env: "STRIPE_WEBHOOK_SECRET" },
    { label: "Billing events forwarding (optional)", ok: Boolean(c.eventsWebhook), env: "BILLING_EVENTS_WEBHOOK_URL" },
    { label: "Free trial (optional)", ok: c.trialDays > 0, env: "PREMIUM_TRIAL_DAYS", note: c.trialDays ? `${c.trialDays} days` : undefined },
  ];
}
