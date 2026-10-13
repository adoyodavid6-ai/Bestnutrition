import { billingConfig, listingSellable, premiumSellable, type BillingConfig } from "../billing/config";

/**
 * Every way NourishWell can earn money, with its launch phase and real status.
 * Status is derived from configuration where possible, so the admin view never
 * claims a stream is live when it isn't.
 */
export type StreamStatus =
  | "live" // built, configured and accepting money
  | "needs-config" // built and tested; switches on when credentials/prices are set
  | "boundary" // data model, disclosure and integration point built; no partners or content yet
  | "planned" // designed, not built
  | "deferred"; // deliberately not pursued yet

export interface RevenueStream {
  id: string;
  name: string;
  phase: 1 | 2 | 3 | 4;
  model: string;
  /** Environment variables or decisions needed before it can earn. */
  requires: string[];
  notes: string;
}

export const STREAMS: RevenueStream[] = [
  { id: "premium", name: "Premium subscription", phase: 2, model: "US$37.99/month (PREMIUM_MONTHLY_PRICE_USD), payable in local currency via Adaptive Pricing; optional yearly Stripe Price", requires: ["STRIPE_SECRET_KEY", "ENTITLEMENT_SECRET", "STRIPE_WEBHOOK_SECRET"], notes: "Sells only features that exist today (see plans.ts FEATURE_STATUS)." },
  { id: "pro-signup", name: "Professional sign-up fee", phase: 3, model: "One-time US$100 after verification (PRO_SIGNUP_FEE_USD), via a signed payment link", requires: ["STRIPE_SECRET_KEY", "ENTITLEMENT_SECRET", "Verified professionals"], notes: "Professionals set their own hourly rate; clients pay them directly (no commission)." },
  { id: "featured-listing", name: "Featured directory listing", phase: 3, model: "Monthly subscription, offered only after verification via a signed link", requires: ["STRIPE_PRICE_LISTING_FEATURED", "ENTITLEMENT_SECRET", "Verified listings"], notes: "Directory is empty until listings are verified." },
  { id: "business-plus", name: "Business Plus listing", phase: 3, model: "Higher-tier listing subscription", requires: ["Accounts + database (Supabase)", "Lead inbox", "Reporting"], notes: "Needs business accounts and stored enquiries before it can be sold honestly." },
  { id: "digital-products", name: "Digital products", phase: 4, model: "One-time purchases with secure download", requires: ["STRIPE_PRICE_PRODUCT_* per product", "ENTITLEMENT_SECRET", "Owner: prices, refund policy"], notes: "Starts with the original Meal-Planning Workbook." },
  { id: "sponsored-content", name: "Sponsored collections & newsletter sponsorship", phase: 4, model: "Flat-fee sponsorship, labelled", requires: ["Signed sponsor agreement", "Editorial sign-off"], notes: "Sponsor fields and disclosure labels are built; no sponsors yet." },
  { id: "affiliate", name: "Affiliate links (kitchen & meal-prep equipment)", phase: 4, model: "Commission on referred purchases", requires: ["Affiliate programme approval per market", "Reviewed product data"], notes: "Link component, disclosure and click tracking built; never used in health-condition or supplement guidance." },
  { id: "workplace", name: "Workplace & organisation programmes", phase: 4, model: "Quoted packages (workshops, group Premium)", requires: ["Package definitions", "Delivery capacity"], notes: "Enquiry route only; no outcomes promised." },
  { id: "bookings", name: "Booking commissions & lead fees", phase: 4, model: "Commission or lead fee on consultations", requires: ["Sufficient verified professionals", "Healthcare advertising/referral rules review per market", "Stripe Connect payouts"], notes: "Not pursued: booking requests are free and clients pay professionals directly." },
  { id: "display-ads", name: "Display advertising", phase: 4, model: "CPM display ads", requires: ["Meaningful traffic", "Performance budget review", "Contextual-only ad network"], notes: "Deferred: would hurt page speed and trust at current scale." },
];

export function streamStatus(id: string, c: BillingConfig = billingConfig(), env: Record<string, string | undefined> = process.env): StreamStatus {
  switch (id) {
    case "premium":
      return premiumSellable(c) ? "live" : "needs-config";
    case "pro-signup":
      return c.secretKey && c.entitlementSecret ? "live" : "needs-config";
    case "featured-listing":
      return listingSellable(c) ? "live" : "needs-config";
    case "digital-products":
      return c.secretKey && c.entitlementSecret && Object.keys(env).some((k) => k.startsWith("STRIPE_PRICE_PRODUCT_") && env[k]) ? "live" : "needs-config";
    case "sponsored-content":
    case "affiliate":
    case "workplace":
      return "boundary";
    case "business-plus":
    case "bookings":
      return "planned";
    default:
      return "deferred";
  }
}

export const STATUS_LABELS: Record<StreamStatus, string> = {
  live: "Live",
  "needs-config": "Built — needs configuration",
  boundary: "Boundary built — no partners yet",
  planned: "Planned",
  deferred: "Deferred",
};
