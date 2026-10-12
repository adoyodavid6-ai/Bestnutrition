import { getIngredient } from "@/content/ingredients";
import { addNutrients, scaleNutrients, zeroNutrients } from "@/lib/nutrition";
import { deriveRecipeMeta, type CostLevel, type RecipeMeta } from "@/lib/recipe-meta";
import type { Allergen, GoalId, MealCategory, Nutrients, Recipe } from "@/lib/types";

export type Slot = "breakfast" | "lunch" | "dinner" | "supper" | "snack";

export const SLOT_LABELS: Record<Slot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  supper: "Supper",
  snack: "Snack",
};

export const SLOT_CATEGORIES: Record<Slot, MealCategory[]> = {
  breakfast: ["breakfast"],
  lunch: ["lunch", "salad", "soup"],
  dinner: ["dinner"],
  supper: ["supper", "soup"],
  snack: ["snack", "beverage"],
};

export type DietPreference = "any" | "vegetarian" | "vegan" | "pescatarian";

export interface PlannerPrefs {
  diet: DietPreference;
  avoidAllergens: Allergen[];
  dislikes: string[]; // ingredient ids
  maxTotalMin: number;
  household: number;
  budget: CostLevel;
  regions: string[];
  goals: GoalId[];
  includeSupper: boolean;
  includeSnack: boolean;
  pantry: string[]; // ingredient ids already at home
  seed: number;
}

export const DEFAULT_PREFS: PlannerPrefs = {
  diet: "any",
  avoidAllergens: [],
  dislikes: [],
  maxTotalMin: 60,
  household: 2,
  budget: 2,
  regions: [],
  goals: [],
  includeSupper: false,
  includeSnack: false,
  pantry: [],
  seed: 1,
};

export interface MealEntry {
  id: string;
  slot: Slot;
  recipeSlug?: string;
  customTitle?: string;
  servings: number;
  prepared: boolean;
}

export interface PlanDay {
  label: string;
  entries: MealEntry[];
}

export interface MealPlan {
  id: string;
  name: string;
  createdAt: string;
  prefs: PlannerPrefs;
  days: PlanDay[];
}

export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Small deterministic PRNG so that "regenerate" is reproducible from a seed. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function slotsFor(prefs: Pick<PlannerPrefs, "includeSupper" | "includeSnack">): Slot[] {
  const s: Slot[] = ["breakfast", "lunch", "dinner"];
  if (prefs.includeSupper) s.push("supper");
  if (prefs.includeSnack) s.push("snack");
  return s;
}

/** Hard constraints a recipe must satisfy for this household. */
export function fitsPrefs(recipe: Recipe, meta: RecipeMeta, prefs: PlannerPrefs, opts: { ignoreTime?: boolean; ignoreBudget?: boolean } = {}): boolean {
  if (prefs.diet !== "any" && !meta.diets.includes(prefs.diet)) return false;
  if (prefs.avoidAllergens.some((a) => meta.allergens.includes(a))) return false;
  if (prefs.dislikes.some((d) => meta.ingredientIds.includes(d))) return false;
  if (!opts.ignoreTime && meta.totalMin > prefs.maxTotalMin) return false;
  if (!opts.ignoreBudget && meta.cost > prefs.budget) return false;
  return true;
}

function reusableIngredients(recipe: Recipe): string[] {
  return recipe.ingredients
    .filter((l) => {
      const c = getIngredient(l.id).category;
      return c !== "spices" && c !== "oils" && l.id !== "salt" && l.id !== "water";
    })
    .map((l) => l.id);
}

export interface GeneratedPlan {
  days: PlanDay[];
  notes: string[];
}

let idCounter = 0;
export const newId = (prefix = "m") => `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

/**
 * Build a 7-day plan. Hard constraints (diet, allergens, dislikes) are never relaxed.
 * Soft constraints (time, budget) are relaxed only if a slot would otherwise be empty,
 * and the plan reports when that happens. Scoring favours pantry items, ingredient reuse
 * across the week (less waste, smaller shopping list), goals and preferred regions, and
 * avoids repeating a recipe on consecutive days.
 */
export function generatePlan(recipes: Recipe[], prefs: PlannerPrefs): GeneratedPlan {
  const rand = mulberry32(prefs.seed);
  const metas = new Map(recipes.map((r) => [r.slug, deriveRecipeMeta(r)]));
  const slots = slotsFor(prefs);
  const used = new Map<string, number>();
  const lastDayUsed = new Map<string, number>();
  const weekIngredients = new Map<string, number>();
  const pantry = new Set(prefs.pantry);
  const notes = new Set<string>();

  const candidatesFor = (slot: Slot, relax: { ignoreTime?: boolean; ignoreBudget?: boolean }) =>
    recipes.filter((r) => r.categories.some((c) => SLOT_CATEGORIES[slot].includes(c)) && fitsPrefs(r, metas.get(r.slug)!, prefs, relax));

  const days: PlanDay[] = DAY_LABELS.map((label, dayIndex) => {
    const entries: MealEntry[] = [];
    for (const slot of slots) {
      let pool = candidatesFor(slot, {});
      if (pool.length === 0) {
        pool = candidatesFor(slot, { ignoreTime: true });
        if (pool.length) notes.add(`Some ${SLOT_LABELS[slot].toLowerCase()} recipes take longer than your ${prefs.maxTotalMin}-minute limit — no faster match was available.`);
      }
      if (pool.length === 0) {
        pool = candidatesFor(slot, { ignoreTime: true, ignoreBudget: true });
        if (pool.length) notes.add(`Some ${SLOT_LABELS[slot].toLowerCase()} recipes are above your budget level — no lower-cost match was available.`);
      }
      // Never repeat a recipe in the same day.
      pool = pool.filter((r) => !entries.some((e) => e.recipeSlug === r.slug));
      if (pool.length === 0) {
        notes.add(`No ${SLOT_LABELS[slot].toLowerCase()} recipes match your dietary and allergen settings yet. Add your own meal for this slot.`);
        entries.push({ id: newId(), slot, servings: prefs.household, prepared: false, customTitle: "Your own meal" });
        continue;
      }

      let best = pool[0];
      let bestScore = -Infinity;
      for (const r of pool) {
        const meta = metas.get(r.slug)!;
        const ingr = reusableIngredients(r);
        let score = rand() * 2;
        score += ingr.filter((i) => pantry.has(i)).length * 1.5;
        score += ingr.filter((i) => weekIngredients.has(i)).length * 0.6;
        score += r.goals.filter((g) => prefs.goals.includes(g)).length * 1.2;
        if (prefs.regions.includes(r.region)) score += 1.5;
        if (meta.cost < prefs.budget) score += 0.3;
        const times = used.get(r.slug) ?? 0;
        score -= times * 2.5;
        const last = lastDayUsed.get(r.slug);
        if (last !== undefined && dayIndex - last <= 1) score -= 6;
        if (score > bestScore) {
          bestScore = score;
          best = r;
        }
      }
      used.set(best.slug, (used.get(best.slug) ?? 0) + 1);
      lastDayUsed.set(best.slug, dayIndex);
      for (const i of reusableIngredients(best)) weekIngredients.set(i, (weekIngredients.get(i) ?? 0) + 1);
      entries.push({ id: newId(), slot, recipeSlug: best.slug, servings: prefs.household, prepared: false });
    }
    return { label, entries };
  });

  return { days, notes: [...notes] };
}

export interface BatchIdea {
  title: string;
  detail: string;
}

/** Suggest batch cooking where the same recipe or base ingredient appears more than once. */
export function batchCookingIdeas(plan: PlanDay[], recipes: Recipe[]): BatchIdea[] {
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const recipeDays = new Map<string, string[]>();
  const baseUse = new Map<string, Set<string>>();
  for (const day of plan) {
    for (const e of day.entries) {
      if (!e.recipeSlug) continue;
      const r = bySlug.get(e.recipeSlug);
      if (!r) continue;
      recipeDays.set(r.slug, [...(recipeDays.get(r.slug) ?? []), day.label]);
      for (const l of r.ingredients) {
        const ing = getIngredient(l.id);
        if (ing.category === "legumes" || (ing.category === "grains" && ing.id !== "yeast")) {
          if (!baseUse.has(ing.id)) baseUse.set(ing.id, new Set());
          baseUse.get(ing.id)!.add(r.title);
        }
      }
    }
  }
  const ideas: BatchIdea[] = [];
  for (const [slug, days] of recipeDays) {
    if (days.length > 1) {
      const r = bySlug.get(slug)!;
      ideas.push({ title: `Cook ${r.title} once, eat it ${days.length} times`, detail: `It appears on ${days.join(", ")}. Make a larger batch on ${days[0]} and refrigerate portions promptly — ${r.storage}` });
    }
  }
  for (const [id, titles] of baseUse) {
    if (titles.size > 1) {
      const ing = getIngredient(id);
      ideas.push({
        title: `Prepare ${ing.name.toLowerCase()} in one go`,
        detail: `Used in ${[...titles].join(", ")}. Cook or soak it once early in the week; cool quickly and keep refrigerated for up to 3–4 days.`,
      });
    }
  }
  return ideas.slice(0, 6);
}

/** Estimated nutrition per person for a day (one serving of each planned recipe). */
export function dayNutritionPerPerson(day: PlanDay, recipes: Recipe[]): { nutrients: Nutrients; counted: number } {
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  let total = zeroNutrients();
  let counted = 0;
  for (const e of day.entries) {
    const r = e.recipeSlug ? bySlug.get(e.recipeSlug) : undefined;
    if (!r) continue;
    total = addNutrients(total, scaleNutrients(deriveRecipeMeta(r).perServing, 1));
    counted++;
  }
  return { nutrients: total, counted };
}

/** Swap two entries (possibly across days). Returns a new array. */
export function moveEntry(days: PlanDay[], from: { day: number; id: string }, toDay: number): PlanDay[] {
  const next = days.map((d) => ({ ...d, entries: [...d.entries] }));
  const src = next[from.day];
  const idx = src.entries.findIndex((e) => e.id === from.id);
  if (idx < 0 || toDay === from.day || !next[toDay]) return days;
  const entry = src.entries[idx];
  const target = next[toDay];
  const tIdx = target.entries.findIndex((e) => e.slot === entry.slot);
  if (tIdx >= 0) {
    // swap same-slot meals between days
    const other = target.entries[tIdx];
    target.entries[tIdx] = entry;
    src.entries[idx] = other;
  } else {
    src.entries.splice(idx, 1);
    target.entries.push(entry);
  }
  return next;
}
