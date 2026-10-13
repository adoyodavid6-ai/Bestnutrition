import { billingConfig, premiumSellable, listingSellable, type BillingConfig } from "./config";
import { formatMoney, getPrice, type StripePrice } from "./stripe";

export interface Offer {
  interval: "month" | "year";
  amount: number;
  currency: string;
  display: string;
  /** Other currencies configured on the same Stripe price (shown as "also available in"). */
  otherCurrencies: string[];
}

function toOffer(p: StripePrice): Offer | null {
  if (!p.active || p.unit_amount == null || !p.recurring || (p.recurring.interval !== "month" && p.recurring.interval !== "year") || p.recurring.interval_count !== 1) return null;
  return {
    interval: p.recurring.interval,
    amount: p.unit_amount,
    currency: p.currency,
    display: formatMoney(p.unit_amount, p.currency),
    otherCurrencies: Object.keys(p.currency_options ?? {})
      .filter((c) => c !== p.currency)
      .map((c) => c.toUpperCase()),
  };
}

async function safePrice(id: string | undefined, config: BillingConfig) {
  if (!id) return null;
  try {
    return toOffer(await getPrice(id, config));
  } catch (e) {
    console.error("price lookup failed", id, e);
    return null;
  }
}

/** Live Premium offers read from Stripe. Empty when billing isn't configured or prices can't be read. */
export async function premiumOffers(config: BillingConfig = billingConfig()) {
  if (!premiumSellable(config)) return { sellable: false as const, month: null, year: null, trialDays: 0 };
  const [month, year] = await Promise.all([safePrice(config.prices.premiumMonthly, config), safePrice(config.prices.premiumYearly, config)]);
  return { sellable: Boolean(month || year), month, year, trialDays: config.trialDays };
}

export async function featuredListingOffer(config: BillingConfig = billingConfig()) {
  if (!listingSellable(config)) return null;
  return safePrice(config.prices.listingFeatured, config);
}

/** Percentage saved by paying yearly, when both prices share a currency. */
export function yearlySaving(month: Offer | null, year: Offer | null) {
  if (!month || !year || month.currency !== year.currency || month.amount <= 0) return 0;
  return Math.max(0, Math.round((1 - year.amount / (month.amount * 12)) * 100));
}

/** A one-time price (digital products), read from Stripe. */
export async function oneTimeOffer(id: string | undefined, config: BillingConfig = billingConfig()): Promise<{ amount: number; currency: string; display: string } | null> {
  if (!id || !config.secretKey) return null;
  try {
    const p = await getPrice(id, config);
    if (!p.active || p.unit_amount == null || p.recurring) return null;
    return { amount: p.unit_amount, currency: p.currency, display: formatMoney(p.unit_amount, p.currency) };
  } catch (e) {
    console.error("price lookup failed", id, e);
    return null;
  }
}
