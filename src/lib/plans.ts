/**
 * Subscription plans and entitlements.
 *
 * Prices are intentionally `null` until the business sets them and a payment provider is
 * configured. Entitlements are checked with `hasEntitlement`, which must be called on the
 * server (route handlers / server actions) once accounts exist — never rely on hiding UI.
 */

export type Feature =
  | "recipes.browse"
  | "recipes.filters.basic"
  | "recipes.filters.advanced"
  | "favorites"
  | "planner.basic"
  | "planner.saved-plans.multiple"
  | "planner.household"
  | "planner.batch-schedule"
  | "planner.pantry-suggestions"
  | "planner.export"
  | "shopping.basic"
  | "shopping.enhanced"
  | "collections.advanced"
  | "education"
  | "directory.view";

export interface Plan {
  id: "free" | "premium";
  name: string;
  tagline: string;
  /** Monthly price in the smallest unit of the configured currency, or null if not yet set. */
  priceMonthly: number | null;
  currency: string | null;
  features: Feature[];
  limits: { savedPlans: number };
  available: boolean;
}

export const FEATURE_LABELS: Record<Feature, string> = {
  "recipes.browse": "Full recipe library and recipe pages",
  "recipes.filters.basic": "Search and core filters (meal, cuisine, time, diet, allergens)",
  "recipes.filters.advanced": "Advanced filters and saved filter sets",
  favorites: "Save recipes and articles",
  "planner.basic": "Seven-day meal planner with editing, moving and servings",
  "planner.saved-plans.multiple": "Multiple saved weekly plans",
  "planner.household": "Household planning with individual preferences",
  "planner.batch-schedule": "Step-by-step batch-cooking schedules",
  "planner.pantry-suggestions": "Pantry-based recipe suggestions",
  "planner.export": "Export plans and lists (PDF, calendar, CSV)",
  "shopping.basic": "Consolidated, editable shopping list with print and share",
  "shopping.enhanced": "Multiple lists, aisle ordering and price history",
  "collections.advanced": "Personal recipe collections",
  education: "All nutrition, health-condition, supplement and fitness guides",
  "directory.view": "Public professional and business listings",
};

const FREE_FEATURES: Feature[] = [
  "recipes.browse",
  "recipes.filters.basic",
  "favorites",
  "planner.basic",
  "planner.pantry-suggestions",
  "shopping.basic",
  "education",
  "directory.view",
];

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Everything you need to eat well, free for everyone.",
    priceMonthly: 0,
    currency: null,
    features: FREE_FEATURES,
    limits: { savedPlans: 3 },
    available: true,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "More planning power for busy households.",
    priceMonthly: null,
    currency: null,
    features: [
      ...FREE_FEATURES,
      "recipes.filters.advanced",
      "planner.saved-plans.multiple",
      "planner.household",
      "planner.batch-schedule",
      "planner.export",
      "shopping.enhanced",
      "collections.advanced",
    ],
    limits: { savedPlans: 50 },
    available: false,
  },
];

export const ALL_FEATURES = Object.keys(FEATURE_LABELS) as Feature[];

export function planById(id: Plan["id"]) {
  return plans.find((p) => p.id === id)!;
}

/** Server-side entitlement check. `planId` must come from a trusted session, never the client. */
export function hasEntitlement(planId: Plan["id"], feature: Feature): boolean {
  return planById(planId).features.includes(feature);
}

/** Health-related personalisation is never a premium upsell. */
export const NEVER_PREMIUM: Feature[] = ["education", "recipes.filters.basic", "planner.basic"];
