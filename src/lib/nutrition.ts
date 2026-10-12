import { getIngredient } from "@/content/ingredients";
import type { Nutrients, Recipe, RecipeIngredient } from "@/lib/types";

export const NUTRIENT_LABELS: { key: keyof Nutrients; label: string; unit: string }[] = [
  { key: "kcal", label: "Energy", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbohydrate", unit: "g" },
  { key: "fat", label: "Total fat", unit: "g" },
  { key: "satFat", label: "Saturated fat", unit: "g" },
  { key: "fiber", label: "Fibre", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
];

export const zeroNutrients = (): Nutrients => ({ kcal: 0, protein: 0, carbs: 0, fat: 0, satFat: 0, fiber: 0, sodium: 0 });

export function addNutrients(a: Nutrients, b: Nutrients, factor = 1): Nutrients {
  return {
    kcal: a.kcal + b.kcal * factor,
    protein: a.protein + b.protein * factor,
    carbs: a.carbs + b.carbs * factor,
    fat: a.fat + b.fat * factor,
    satFat: a.satFat + b.satFat * factor,
    fiber: a.fiber + b.fiber * factor,
    sodium: a.sodium + b.sodium * factor,
  };
}

export function scaleNutrients(a: Nutrients, factor: number): Nutrients {
  return addNutrients(zeroNutrients(), a, factor);
}

/** Nutrient contribution of one recipe line for the whole recipe (base servings). */
export function lineNutrients(line: RecipeIngredient): Nutrients {
  if (line.optional || line.grams <= 0) return zeroNutrients();
  return scaleNutrients(getIngredient(line.id).per100g, line.grams / 100);
}

export interface NutritionBreakdown {
  perServing: Nutrients;
  total: Nutrients;
  lines: { line: RecipeIngredient; nutrients: Nutrients; share: number }[];
}

/** Transparent ingredient-based calculation. Every figure can be traced to a line. */
export function calculateRecipeNutrition(recipe: Recipe): NutritionBreakdown {
  const lines = recipe.ingredients.map((line) => ({ line, nutrients: lineNutrients(line), share: 0 }));
  const total = lines.reduce((acc, l) => addNutrients(acc, l.nutrients), zeroNutrients());
  for (const l of lines) l.share = total.kcal > 0 ? l.nutrients.kcal / total.kcal : 0;
  return { total, perServing: scaleNutrients(total, 1 / recipe.servings), lines };
}

/** Label-style rounding so we never present false precision. */
export function roundNutrient(key: keyof Nutrients, value: number): number {
  if (key === "kcal") return value < 50 ? Math.round(value / 5) * 5 : Math.round(value / 10) * 10;
  if (key === "sodium") return value < 140 ? Math.round(value / 5) * 5 : Math.round(value / 10) * 10;
  if (value < 5) return Math.round(value * 2) / 2;
  return Math.round(value);
}

export function roundAll(n: Nutrients): Nutrients {
  const out = zeroNutrients();
  for (const { key } of NUTRIENT_LABELS) out[key] = roundNutrient(key, n[key]);
  return out;
}

/** Editorial thresholds (per serving) used for nutrition characteristic tags. */
export const CHARACTERISTIC_THRESHOLDS = {
  highFibre: 6, // g
  highProtein: 20, // g
  lowerSodium: 400, // mg
  lowerSatFat: 3, // g
};

export type NutritionCharacteristic = "high-fibre" | "high-protein" | "lower-sodium" | "lower-saturated-fat";

export const CHARACTERISTIC_LABELS: Record<NutritionCharacteristic, string> = {
  "high-fibre": "High in fibre",
  "high-protein": "High in protein",
  "lower-sodium": "Lower in sodium",
  "lower-saturated-fat": "Lower in saturated fat",
};

export function characteristics(perServing: Nutrients): NutritionCharacteristic[] {
  const out: NutritionCharacteristic[] = [];
  if (perServing.fiber >= CHARACTERISTIC_THRESHOLDS.highFibre) out.push("high-fibre");
  if (perServing.protein >= CHARACTERISTIC_THRESHOLDS.highProtein) out.push("high-protein");
  if (perServing.sodium <= CHARACTERISTIC_THRESHOLDS.lowerSodium) out.push("lower-sodium");
  if (perServing.satFat <= CHARACTERISTIC_THRESHOLDS.lowerSatFat) out.push("lower-saturated-fat");
  return out;
}
