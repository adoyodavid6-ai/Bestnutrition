import { getIngredient } from "@/content/ingredients";
import { calculateRecipeNutrition, characteristics, type NutritionCharacteristic } from "@/lib/nutrition";
import type { Allergen, Nutrients, Recipe } from "@/lib/types";

export type DietTag = "vegan" | "vegetarian" | "pescatarian" | "gluten-free" | "dairy-free" | "egg-free" | "nut-free";

export const DIET_LABELS: Record<DietTag, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  pescatarian: "Pescatarian",
  "gluten-free": "Gluten-free",
  "dairy-free": "Dairy-free",
  "egg-free": "Egg-free",
  "nut-free": "Peanut & tree-nut free",
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten (wheat, oats*)",
  dairy: "Milk",
  egg: "Egg",
  fish: "Fish",
  shellfish: "Crustacean shellfish",
  peanut: "Peanut",
  "tree-nut": "Tree nuts",
  soy: "Soy",
  sesame: "Sesame",
};

export type CostLevel = 1 | 2 | 3;
export const COST_LABELS: Record<CostLevel, string> = {
  1: "Budget-friendly",
  2: "Moderate",
  3: "Higher cost",
};

export interface RecipeMeta {
  totalMin: number;
  diets: DietTag[];
  allergens: Allergen[];
  perServing: Nutrients;
  characteristics: NutritionCharacteristic[];
  cost: CostLevel;
  proteinSources: string[];
  ingredientIds: string[];
}

const PROTEIN_CATEGORIES = new Set(["legumes", "protein", "dairy", "nuts-seeds"]);

/**
 * Dietary tags and allergens are derived from the ingredient table rather than typed by hand,
 * so a recipe can never be labelled vegan while containing an animal ingredient.
 * Optional garnishes are included in this check to stay conservative.
 */
export function deriveRecipeMeta(recipe: Recipe): RecipeMeta {
  const ings = recipe.ingredients.map((l) => ({ line: l, ing: getIngredient(l.id) }));
  const animals = new Set(ings.map(({ ing }) => ing.animal).filter(Boolean));
  const allergens = Array.from(new Set(ings.flatMap(({ ing }) => ing.allergens ?? []))).sort() as Allergen[];

  const diets: DietTag[] = [];
  if (animals.size === 0) diets.push("vegan");
  if (![...animals].some((a) => a === "meat" || a === "poultry" || a === "fish" || a === "shellfish")) diets.push("vegetarian");
  if (![...animals].some((a) => a === "meat" || a === "poultry")) diets.push("pescatarian");
  if (!allergens.includes("gluten")) diets.push("gluten-free");
  if (!allergens.includes("dairy")) diets.push("dairy-free");
  if (!allergens.includes("egg")) diets.push("egg-free");
  if (!allergens.includes("peanut") && !allergens.includes("tree-nut")) diets.push("nut-free");

  // Relative cost: weight each ingredient's cost level by its share of the recipe's weight.
  const weighted = ings.filter(({ ing }) => ing.category !== "spices" && ing.id !== "water" && ing.id !== "salt");
  const totalG = weighted.reduce((s, { line }) => s + line.grams, 0) || 1;
  const avg = weighted.reduce((s, { line, ing }) => s + ing.cost * line.grams, 0) / totalG;
  const cost: CostLevel = avg < 1.5 ? 1 : avg < 2.3 ? 2 : 3;

  const nutrition = calculateRecipeNutrition(recipe);
  const proteinSources = Array.from(
    new Set(ings.filter(({ ing, line }) => PROTEIN_CATEGORIES.has(ing.category) && !line.optional && line.grams >= 30).map(({ ing }) => ing.name)),
  );

  return {
    totalMin: recipe.prepMin + recipe.cookMin,
    diets,
    allergens,
    perServing: nutrition.perServing,
    characteristics: characteristics(nutrition.perServing),
    cost,
    proteinSources,
    ingredientIds: recipe.ingredients.map((l) => l.id),
  };
}
