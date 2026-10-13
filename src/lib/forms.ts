import { z } from "zod";
import { attributionSchema } from "./billing/attribution";
import { CONSULT_MODES, availabilitySchema, hourlyRateSchema } from "./booking";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);
const consent = z.literal(true, { message: "Please confirm to continue" });
/** How the visitor found us (first-party, optional; malformed values are dropped). */
const attribution = attributionSchema.optional().catch(undefined);
/** Where on the site the sign-up happened, e.g. "footer", "free-meal-plan", "premium-waitlist". */
const source = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]{1,40}$/)
  .optional()
  .catch(undefined);

export const formSchemas = {
  newsletter: z.object({
    email,
    consent,
    source,
    attribution,
  }),
  contact: z.object({
    name: z.string().trim().min(1, "Enter your name").max(120),
    email,
    topic: z.enum(["general", "correction", "privacy", "partnership", "workplace", "accessibility", "other"]),
    message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
    consent,
    attribution,
  }),
  listing: z.object({
    listingType: z.enum(["professional", "business"]),
    name: z.string().trim().min(1, "Enter a name").max(160),
    organisation: z.string().trim().max(160).optional().default(""),
    email,
    country: z.string().trim().min(2, "Enter your country").max(80),
    profession: z.string().trim().min(2, "Describe your profession or business type").max(160),
    registration: z.string().trim().max(200).optional().default(""),
    website: z
      .string()
      .trim()
      .max(300)
      .optional()
      .default("")
      .refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+/.test(v), "Enter a full URL starting with http:// or https://"),
    services: z.string().trim().min(10, "Describe your services (at least 10 characters)").max(3000),
    tier: z.enum(["basic", "featured"]).optional().catch(undefined),
    // Professionals only: their own rate (paid to them directly) and bookable availability.
    hourlyRate: hourlyRateSchema.optional(),
    modes: z.array(z.enum(CONSULT_MODES)).optional(),
    availability: availabilitySchema.optional(),
    consent,
    attribution,
  }).superRefine((v, ctx) => {
    if (v.listingType !== "professional") return;
    if (!v.hourlyRate) ctx.addIssue({ code: "custom", path: ["hourlyRate"], message: "Enter your hourly rate" });
    if (!v.modes?.length) ctx.addIssue({ code: "custom", path: ["modes"], message: "Choose how you see clients" });
    if (!v.availability) ctx.addIssue({ code: "custom", path: ["availability"], message: "Add your availability" });
  }),
} as const;

export type FormType = keyof typeof formSchemas;

export const WEBHOOK_ENV: Record<FormType, string> = {
  newsletter: "NEWSLETTER_WEBHOOK_URL",
  contact: "CONTACT_WEBHOOK_URL",
  listing: "LISTINGS_WEBHOOK_URL",
};

export function isFormType(v: string): v is FormType {
  return v in formSchemas;
}
