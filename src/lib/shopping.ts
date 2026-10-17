import { getIngredient } from "@/content/ingredients";
import type { IngredientCategory, Recipe, Unit } from "@/lib/types";
import { scaleQuantity, toBase } from "@/lib/units";

export interface ShoppingItem {
  key: string;
  ingredientId?: string;
  name: string;
  qty: number;
  unit: Unit;
  category: IngredientCategory | "other";
  checked: boolean;
  custom?: boolean;
  /** Recipe titles that need this item. */
  recipes: string[];
  /** Optional price the user enters for their own market. Never pre-filled. */
  price?: number;
  note?: string;
}

export interface ShoppingRequest {
  recipe: Recipe;
  servings: number;
}

export const CATEGORY_ORDER: (IngredientCategory | "other")[] = [
  "produce",
  "fruit",
  "grains",
  "legumes",
  "protein",
  "dairy",
  "nuts-seeds",
  "oils",
  "pantry",
  "spices",
  "other",
];

export const CATEGORY_LABELS: Record<IngredientCategory | "other", string> = {
  produce: "Vegetables & fresh produce",
  fruit: "Fruit",
  grains: "Grains, flours & bread",
  legumes: "Beans, lentils & pulses",
  protein: "Fish, meat, eggs & tofu",
  dairy: "Dairy",
  "nuts-seeds": "Nuts & seeds",
  oils: "Oils",
  pantry: "Pantry",
  spices: "Herbs & spices",
  other: "Other",
};

/** Ingredients nearly every kitchen has; flagged so users can skip them quickly. */
export const STAPLES = new Set(["water", "salt", "black-pepper"]);

/**
 * Combine ingredients from several recipes into one list. Quantities are scaled to the
 * requested servings, spoon measures are converted to millilitres so they can be added,
 * and lines are merged by ingredient + unit.
 */
export function buildShoppingList(requests: ShoppingRequest[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const { recipe, servings } of requests) {
    for (const line of recipe.ingredients) {
      if (line.id === "water") continue;
      const ing = getIngredient(line.id);
      const scaled = scaleQuantity(line.qty, recipe.servings, servings);
      const base = toBase(scaled, line.unit);
      const key = `${ing.id}|${base.unit}`;
      const existing = map.get(key);
      if (existing) {
        existing.qty += base.qty;
        if (!existing.recipes.includes(recipe.title)) existing.recipes.push(recipe.title);
      } else {
        map.set(key, {
          key,
          ingredientId: ing.id,
          name: ing.name,
          qty: base.qty,
          unit: base.unit,
          category: ing.category,
          checked: false,
          recipes: [recipe.title],
          note: STAPLES.has(ing.id) ? "Pantry staple — check before buying" : line.optional ? "Optional" : undefined,
        });
      }
    }
  }
  return sortShoppingItems([...map.values()]);
}

export function sortShoppingItems(items: ShoppingItem[]): ShoppingItem[] {
  return [...items].sort((a, b) => {
    const c = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    return c !== 0 ? c : a.name.localeCompare(b.name);
  });
}

export function groupByCategory(items: ShoppingItem[]) {
  return CATEGORY_ORDER.map((category) => ({ category, label: CATEGORY_LABELS[category], items: items.filter((i) => i.category === category) })).filter(
    (g) => g.items.length > 0,
  );
}

/** Merge a freshly generated list into an existing one, keeping checks, prices and custom items. */
export function mergeShoppingLists(existing: ShoppingItem[], generated: ShoppingItem[]): ShoppingItem[] {
  const prev = new Map(existing.map((i) => [i.key, i]));
  const merged = generated.map((g) => {
    const p = prev.get(g.key);
    return p ? { ...g, checked: p.checked, price: p.price } : g;
  });
  const custom = existing.filter((i) => i.custom);
  return sortShoppingItems([...merged, ...custom]);
}

export function estimateTotal(items: ShoppingItem[]): { total: number; priced: number; unpriced: number } {
  let total = 0;
  let priced = 0;
  for (const i of items) {
    if (typeof i.price === "number" && Number.isFinite(i.price)) {
      total += i.price;
      priced++;
    }
  }
  return { total, priced, unpriced: items.length - priced };
}
