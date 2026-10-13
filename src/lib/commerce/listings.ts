/**
 * Directory listing packages. Benefits marked "planned" are shown as planned and are never
 * part of what a business pays for until they exist.
 */
export type PackageId = "basic" | "featured" | "business-plus";

export interface ListingBenefit {
  text: string;
  status: "live" | "planned";
}

export interface ListingPackage {
  id: PackageId;
  name: string;
  summary: string;
  /** Env var holding the Stripe Price, or null for free. */
  priceEnv: string | null;
  available: boolean;
  benefits: ListingBenefit[];
}

export const LISTING_PACKAGES: ListingPackage[] = [
  {
    id: "basic",
    name: "Basic",
    summary: "A verified public profile, free.",
    priceEnv: null,
    available: true,
    benefits: [
      { text: "Name, profession or category, description and services", status: "live" },
      { text: "Service areas, languages, website and contact link", status: "live" },
      { text: "Verification status with the date it was checked", status: "live" },
      { text: "A “report a correction” link so readers can flag inaccuracies", status: "live" },
    ],
  },
  {
    id: "featured",
    name: "Featured",
    summary: "More visibility and a richer profile, after verification.",
    priceEnv: "STRIPE_PRICE_LISTING_FEATURED",
    available: true,
    benefits: [
      { text: "Everything in Basic", status: "live" },
      { text: "Shown first in the directory, always labelled “Promoted”", status: "live" },
      { text: "Photo gallery (up to 8 images) and an extended description", status: "live" },
      { text: "Prominent booking or enquiry button on your profile", status: "live" },
    ],
  },
  {
    id: "business-plus",
    name: "Business Plus",
    summary: "For multi-location businesses — in development.",
    priceEnv: null,
    available: false,
    benefits: [
      { text: "Everything in Featured", status: "planned" },
      { text: "Multiple locations, each with its own page", status: "planned" },
      { text: "Enquiry inbox and lead management", status: "planned" },
      { text: "Monthly report of profile views and enquiries", status: "planned" },
    ],
  },
];

/** Directory ordering: promoted (paid) listings first, then alphabetical. Labelling is done by the caller. */
export function orderListings<T extends { promoted: boolean; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(b.promoted) - Number(a.promoted) || a.name.localeCompare(b.name));
}
