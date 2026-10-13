/**
 * Subscription plans and entitlements.
 *
 * Prices are never set in code: they are read from Stripe Price objects (see lib/billing), so
 * what visitors see is what they pay. Entitlements are enforced on the server from a signed
 * cookie (lib/billing/server.ts) — never by hiding UI alone.
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
  | "shopping.calendar"
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
  "planner.export": "Export meal plans and shopping lists (spreadsheet CSV and calendar)",
  "shopping.basic": "Consolidated, editable shopping list with print and share",
  "shopping.enhanced": "Multiple lists, aisle ordering and price history",
  "shopping.calendar": "Recurring shopping calendar with homepage reminders",
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
  "shopping.calendar",
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

/**
 * Whether each feature exists today. Premium is only ever sold on what is "live";
 * "planned" features are shown as roadmap, clearly marked as not yet included.
 */
export const FEATURE_STATUS: Record<Feature, "live" | "planned"> = {
  "recipes.browse": "live",
  "recipes.filters.basic": "live",
  "recipes.filters.advanced": "planned",
  favorites: "live",
  "planner.basic": "live",
  "planner.saved-plans.multiple": "live",
  "planner.household": "planned",
  "planner.batch-schedule": "planned",
  "planner.pantry-suggestions": "live",
  "planner.export": "live",
  "shopping.basic": "live",
  "shopping.enhanced": "planned",
  "shopping.calendar": "live",
  "collections.advanced": "planned",
  education: "live",
  "directory.view": "live",
};

/** Premium features that work today (what a subscriber actually gets now). */
export const premiumLiveExtras = () => planById("premium").features.filter((f) => !planById("free").features.includes(f) && FEATURE_STATUS[f] === "live");
/** Premium features on the roadmap, shown as "planned". */
export const premiumPlannedExtras = () => planById("premium").features.filter((f) => !planById("free").features.includes(f) && FEATURE_STATUS[f] === "planned");

export function planById(id: Plan["id"]) {
  return plans.find((p) => p.id === id)!;
}

/** Server-side entitlement check. `planId` must come from a trusted session, never the client. */
export function hasEntitlement(planId: Plan["id"], feature: Feature): boolean {
  return planById(planId).features.includes(feature);
}

/** Health-related personalisation is never a premium upsell. */
export const NEVER_PREMIUM: Feature[] = ["education", "recipes.filters.basic", "planner.basic"];
