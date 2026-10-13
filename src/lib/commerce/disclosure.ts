/**
 * Sponsorship and affiliate data models. These exist so commercial content can only be
 * published with its disclosure attached; content tests enforce the rules below.
 */

export interface Sponsor {
  name: string;
  url?: string;
  /** Internal reference to the signed agreement. */
  agreementRef: string;
  /** Editors sign off independently of the sponsor; nutrition is calculated as usual. */
  editorialSignOff: { by: string; date: string };
  kind: "sponsored" | "partner";
}

export type AffiliateCategory = "kitchen-equipment" | "meal-prep" | "food-storage" | "cookbook" | "appliance" | "exercise-equipment";

export interface AffiliateProduct {
  id: string;
  name: string;
  merchant: string;
  /** The tracked link supplied by the affiliate programme. */
  url: string;
  /** ISO country codes where the link and merchant actually serve customers. */
  markets: string[];
  category: AffiliateCategory;
  intendedUse: string;
  features: string[];
  limitations: string[];
  /** Only shown with the date it was checked; never invented or estimated. */
  price?: { amount: number; currency: string; checkedAt: string };
  reviewedAt: string;
  reviewer: string;
}

/** No affiliate products are published until a programme has approved NourishWell and items are reviewed. */
export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [];

/** Where affiliate links may appear. Health-condition and supplement guidance is excluded by design. */
export type AffiliatePlacement = "fitness-guide" | "meal-prep-guide" | "buying-guide" | "recipe-equipment";

export function sponsorProblems(s: Sponsor): string[] {
  const out: string[] = [];
  if (!s.agreementRef) out.push("missing agreement reference");
  if (!s.editorialSignOff?.by || !/^\d{4}-\d{2}-\d{2}$/.test(s.editorialSignOff?.date ?? "")) out.push("missing editorial sign-off");
  return out;
}

export function affiliateProblems(p: AffiliateProduct): string[] {
  const out: string[] = [];
  if (!/^https:\/\//.test(p.url)) out.push("link must be https");
  if (!p.markets.length) out.push("no markets");
  if (!p.limitations.length) out.push("no limitations listed");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.reviewedAt) || !p.reviewer) out.push("missing review");
  if (p.price && !/^\d{4}-\d{2}-\d{2}$/.test(p.price.checkedAt)) out.push("price without check date");
  return out;
}
