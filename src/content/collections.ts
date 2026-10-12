import { recipes } from "./recipes";
import { deriveRecipeMeta } from "@/lib/recipe-meta";
import type { Recipe } from "@/lib/types";

export interface Collection {
  slug: string;
  title: string;
  description: string;
  kind: "cultural" | "budget" | "seasonal" | "goal" | "time";
  filter: (r: Recipe) => boolean;
}

const meta = (r: Recipe) => deriveRecipeMeta(r);

export const collections: Collection[] = [
  {
    slug: "east-african-kitchen",
    title: "The East African Kitchen",
    description: "Kenyan, Somali, Swahili, Ugandan and Ethiopian everyday dishes built on maize, beans, greens and warm spices.",
    kind: "cultural",
    filter: (r) => r.region === "East Africa",
  },
  {
    slug: "budget-friendly",
    title: "Eat Well on a Budget",
    description: "Recipes built mostly from low-cost staples — beans, lentils, maize, cabbage and seasonal vegetables.",
    kind: "budget",
    filter: (r) => meta(r).cost === 1,
  },
  {
    slug: "under-30-minutes",
    title: "Ready in 30 Minutes",
    description: "Weeknight-friendly dishes from start to finish in half an hour or less.",
    kind: "time",
    filter: (r) => meta(r).totalMin <= 30,
  },
  {
    slug: "plant-forward",
    title: "Plant-Forward Plates",
    description: "Vegan and vegetarian meals where legumes, grains and vegetables take centre stage.",
    kind: "goal",
    filter: (r) => meta(r).diets.includes("vegetarian"),
  },
  {
    slug: "around-the-mediterranean",
    title: "Around the Mediterranean & Middle East",
    description: "Olive oil, legumes, herbs and vegetables from Greece to the Levant and North Africa.",
    kind: "cultural",
    filter: (r) => ["Mediterranean", "Middle East", "North Africa"].includes(r.region),
  },
  {
    slug: "warming-soups-and-stews",
    title: "Warming Soups & Stews",
    description: "One-pot comfort for cooler, rainy seasons — and they freeze beautifully.",
    kind: "seasonal",
    filter: (r) => r.categories.includes("soup") || /stew|wot|githeri|maharagwe/i.test(r.title),
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function collectionRecipes(c: Collection) {
  return recipes.filter(c.filter);
}

/** A distinct cover recipe for each collection so cards don't repeat the same dish. */
export function collectionCovers(): Record<string, Recipe | undefined> {
  const used = new Set<string>();
  const out: Record<string, Recipe | undefined> = {};
  for (const c of collections) {
    const items = collectionRecipes(c);
    const pick = items.find((r) => !used.has(r.slug)) ?? items[0];
    if (pick) used.add(pick.slug);
    out[c.slug] = pick;
  }
  return out;
}

export { GOALS } from "./goals";
