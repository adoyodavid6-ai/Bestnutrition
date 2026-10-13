/**
 * Professional and business directory.
 *
 * Listings are published only after verification (see docs/OPERATIONS.md). These arrays are
 * intentionally empty at launch: NourishWell never invents profiles, credentials, ratings,
 * testimonials or availability. Verified listings will be loaded from the database
 * (tables `professionals`, `businesses`, `listings` in supabase/schema.sql).
 */

import { orderListings } from "@/lib/commerce/listings";
import type { Availability, ConsultMode, HourlyRate } from "@/lib/booking";

export type VerificationStatus = "unverified" | "pending" | "verified" | "suspended";
/** "premium" is the paid Featured package (see lib/commerce/listings.ts); the name matches the database enum. */
export type ListingTier = "basic" | "premium";

/** Extras shown only on Featured (tier "premium") listings. */
export interface FeaturedExtras {
  gallery?: { src: string; alt: string }[];
  extendedDescription?: string;
}

export interface Professional extends FeaturedExtras {
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
  /** The professional's own hourly rate; clients pay the professional directly. */
  hourlyRate: HourlyRate;
  /** Weekly availability for booking requests through NourishWell. */
  availability?: Availability;
  modes: ConsultMode[];
  /** Where booking requests are emailed. Private: never rendered on the site. */
  bookingEmail?: string;
  verification: VerificationStatus;
  tier: ListingTier;
  /** Premium placements must be labelled as promoted wherever they appear. */
  promoted: boolean;
}

export interface Business extends FeaturedExtras {
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

/** Verified listings only; paid (promoted) listings first, always labelled by the page. */
export const publishedProfessionals = () => orderListings(professionals.filter((p) => p.verification === "verified"));
export const publishedBusinesses = () => orderListings(businesses.filter((b) => b.verification === "verified"));

/** Featured extras render only for paid, verified listings. */
export const isFeatured = (l: { tier: ListingTier; verification: VerificationStatus }) => l.tier === "premium" && l.verification === "verified";
