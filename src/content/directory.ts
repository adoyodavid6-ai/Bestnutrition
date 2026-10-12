/**
 * Professional and business directory.
 *
 * Listings are published only after verification (see docs/OPERATIONS.md). These arrays are
 * intentionally empty at launch: NourishWell never invents profiles, credentials, ratings,
 * testimonials or availability. Verified listings will be loaded from the database
 * (tables `professionals`, `businesses`, `listings` in supabase/schema.sql).
 */

export type VerificationStatus = "unverified" | "pending" | "verified" | "suspended";
export type ListingTier = "basic" | "premium";

export interface Professional {
  slug: string;
  name: string;
  profession: string; // e.g. "Registered Dietitian"
  credentials: { body: string; registrationNumber: string; verifiedAt: string }[];
  specialties: string[];
  languages: string[];
  locations: { city: string; country: string }[];
  remote: boolean;
  bio: string;
  website?: string;
  bookingUrl?: string;
  verification: VerificationStatus;
  tier: ListingTier;
  /** Premium placements must be labelled as promoted wherever they appear. */
  promoted: boolean;
}

export interface Business {
  slug: string;
  name: string;
  category: "Healthy meal provider" | "Gym or studio" | "Clinic" | "Wellness brand" | "Grocery" | "Other";
  description: string;
  services: string[];
  serviceAreas: string[];
  languages: string[];
  priceInfo?: string;
  website?: string;
  social?: { label: string; url: string }[];
  contactEmail?: string;
  verification: VerificationStatus;
  tier: ListingTier;
  promoted: boolean;
}

export const professionals: Professional[] = [];
export const businesses: Business[] = [];

export const publishedProfessionals = () => professionals.filter((p) => p.verification === "verified");
export const publishedBusinesses = () => businesses.filter((b) => b.verification === "verified");
