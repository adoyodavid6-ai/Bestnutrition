"use client";

import { KEYS, readStored } from "./storage";

/**
 * Privacy-conscious product analytics.
 *
 * - Only aggregate product events are tracked (never health-condition interests, never form contents).
 * - Nothing is sent unless the visitor has granted consent AND a provider is configured.
 * - Provider: any script exposing `window.plausible` (Plausible/compatible). Add the script tag
 *   in layout.tsx once a provider is chosen.
 */
export type ProductEvent =
  | "recipe_view"
  | "search"
  | "recipe_saved"
  | "meal_plan_created"
  | "shopping_list_created"
  | "newsletter_signup"
  | "pricing_view";

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string | number> }) => void;
  }
}

export function track(event: ProductEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (readStored<string | null>(KEYS.consent, null) !== "granted") return;
  window.plausible?.(event, props ? { props } : undefined);
}
