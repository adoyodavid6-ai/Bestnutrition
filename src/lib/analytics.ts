"use client";

import { KEYS, readStored } from "./storage";

/**
 * Privacy-conscious product analytics.
 *
 * - Only aggregate product events are tracked (never health-condition interests, never form contents).
 * - Nothing is sent unless the visitor has granted consent AND a provider is configured
 *   (NEXT_PUBLIC_PLAUSIBLE_DOMAIN; the script is loaded by <Analytics /> only after consent).
 * - No advertising pixels are used.
 */
export type ProductEvent =
  | "recipe_view"
  | "search"
  | "recipe_saved"
  | "meal_plan_created"
  | "shopping_list_created"
  | "newsletter_signup"
  | "pricing_view"
  | "checkout_started"
  | "subscription_started"
  | "lead_magnet_view"
  | "upgrade_prompt_click"
  | "premium_export"
  | "upgrade_prompt_view"
  | "experiment_exposure"
  | "restore_requested"
  | "affiliate_click"
  | "product_view"
  | "product_purchased"
  | "listing_application"
  | "share";

declare global {
  interface Window {
    plausible?: ((event: string, opts?: { props?: Record<string, string | number> }) => void) & { q?: unknown[] };
  }
}

export function track(event: ProductEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (readStored<string | null>(KEYS.consent, null) !== "granted") return;
  window.plausible?.(event, props ? { props } : undefined);
}
