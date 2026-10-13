/**
 * Billing configuration, read from environment variables on the server only.
 *
 * Nothing here is hardcoded: prices live in Stripe and are read from the Price objects, so the
 * price a visitor sees is always the price they are charged. When a variable is missing, the
 * matching feature reports itself as "not configured" instead of pretending to work.
 */

export interface BillingConfig {
  secretKey?: string;
  webhookSecret?: string;
  apiBase: string;
  prices: { premiumMonthly?: string; premiumYearly?: string; listingFeatured?: string };
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
    trialDays: Number.isFinite(trial) && trial > 0 && trial <= 90 ? trial : 0,
    entitlementSecret: clean(env.ENTITLEMENT_SECRET) && clean(env.ENTITLEMENT_SECRET)!.length >= 32 ? clean(env.ENTITLEMENT_SECRET) : undefined,
    eventsWebhook: clean(env.BILLING_EVENTS_WEBHOOK_URL),
  };
}

/** Premium can be sold only when Stripe, at least one Premium price and the signing secret are all set. */
export function premiumSellable(c: BillingConfig = billingConfig()) {
  return Boolean(c.secretKey && c.entitlementSecret && (c.prices.premiumMonthly || c.prices.premiumYearly));
}

export function listingSellable(c: BillingConfig = billingConfig()) {
  return Boolean(c.secretKey && c.entitlementSecret && c.prices.listingFeatured);
}

/** A status summary for the admin panel. Never includes secret values. */
export function billingStatus(c: BillingConfig = billingConfig()) {
  return [
    { label: "Stripe secret key", ok: Boolean(c.secretKey), env: "STRIPE_SECRET_KEY", note: c.secretKey ? (c.secretKey.startsWith("sk_live_") || c.secretKey.startsWith("rk_live_") ? "Live mode" : "Test mode") : undefined },
    { label: "Premium monthly price", ok: Boolean(c.prices.premiumMonthly), env: "STRIPE_PRICE_PREMIUM_MONTHLY" },
    { label: "Premium yearly price", ok: Boolean(c.prices.premiumYearly), env: "STRIPE_PRICE_PREMIUM_YEARLY" },
    { label: "Featured listing price", ok: Boolean(c.prices.listingFeatured), env: "STRIPE_PRICE_LISTING_FEATURED" },
    { label: "Entitlement signing secret (32+ chars)", ok: Boolean(c.entitlementSecret), env: "ENTITLEMENT_SECRET" },
    { label: "Webhook signing secret", ok: Boolean(c.webhookSecret), env: "STRIPE_WEBHOOK_SECRET" },
    { label: "Billing events forwarding (optional)", ok: Boolean(c.eventsWebhook), env: "BILLING_EVENTS_WEBHOOK_URL" },
    { label: "Free trial (optional)", ok: c.trialDays > 0, env: "PREMIUM_TRIAL_DAYS", note: c.trialDays ? `${c.trialDays} days` : undefined },
  ];
}
