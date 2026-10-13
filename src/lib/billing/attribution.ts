import { z } from "zod";

/**
 * First-touch marketing attribution, captured in the browser (see lib/attribution-client.ts)
 * and attached to sign-ups, applications and checkouts. It records how someone found us,
 * never what they read about their health.
 */
const short = z.string().trim().max(120).optional();
export const attributionSchema = z
  .object({
    utm_source: short,
    utm_medium: short,
    utm_campaign: short,
    utm_term: short,
    utm_content: short,
    ref: short,
    landing: z.string().trim().max(200).optional(),
    referrer: short,
    firstSeen: z.string().trim().max(40).optional(),
  })
  .strip();

export type Attribution = z.infer<typeof attributionSchema>;

/** Parse untrusted input; anything malformed is dropped rather than rejected. */
export function cleanAttribution(input: unknown): Attribution | undefined {
  const parsed = attributionSchema.safeParse(input);
  if (!parsed.success) return undefined;
  const entries = Object.entries(parsed.data).filter(([, v]) => v);
  return entries.length ? (Object.fromEntries(entries) as Attribution) : undefined;
}

/** Stripe metadata values are limited to 500 chars and 50 keys; keep keys prefixed. */
export function attributionMetadata(a: Attribution | undefined): Record<string, string> {
  if (!a) return {};
  return Object.fromEntries(Object.entries(a).map(([k, v]) => [`attr_${k}`, String(v).slice(0, 200)]));
}
