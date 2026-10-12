import { getIngredient } from "@/content/ingredients";
import { recipes } from "@/content/recipes";
import { deriveRecipeMeta, type CostLevel, type DietTag } from "@/lib/recipe-meta";
import type { NutritionCharacteristic } from "@/lib/nutrition";
import type { Allergen, CookingMethod, Difficulty, GoalId, MealCategory } from "@/lib/types";

export type EquipmentTag = "oven" | "blender" | "stovetop-only" | "no-cook";

export interface RecipeSummary {
  slug: string;
  title: string;
  intro: string;
  cuisine: string;
  region: string;
  categories: MealCategory[];
  prepMin: number;
  cookMin: number;
  totalMin: number;
  difficulty: Difficulty;
  servings: number;
  diets: DietTag[];
  allergens: Allergen[];
  cost: CostLevel;
  methods: CookingMethod[];
  equipment: EquipmentTag[];
  proteinSources: string[];
  characteristics: NutritionCharacteristic[];
  ingredients: { id: string; name: string }[];
  goals: GoalId[];
  kcal: number;
  protein: number;
  fiber: number;
}

function equipmentTags(methods: CookingMethod[], equipment: string[]): EquipmentTag[] {
  const text = equipment.join(" ").toLowerCase();
  const out: EquipmentTag[] = [];
  if (methods.includes("oven") || methods.includes("grill") || /oven|baking tray/.test(text)) out.push("oven");
  if (methods.includes("blender") || /blender|food processor/.test(text)) out.push("blender");
  if (methods.every((m) => m === "no-cook")) out.push("no-cook");
  else if (!out.includes("oven") && !out.includes("blender")) out.push("stovetop-only");
  return out;
}

export function recipeSummaries(): RecipeSummary[] {
  return recipes.map((r) => {
    const m = deriveRecipeMeta(r);
    return {
      slug: r.slug,
      title: r.title,
      intro: r.intro,
      cuisine: r.cuisine,
      region: r.region,
      categories: r.categories,
      prepMin: r.prepMin,
      cookMin: r.cookMin,
      totalMin: m.totalMin,
      difficulty: r.difficulty,
      servings: r.servings,
      diets: m.diets,
      allergens: m.allergens,
      cost: m.cost,
      methods: r.methods,
      equipment: equipmentTags(r.methods, r.equipment),
      proteinSources: m.proteinSources,
      characteristics: m.characteristics,
      ingredients: r.ingredients.map((l) => ({ id: l.id, name: getIngredient(l.id).name })),
      goals: r.goals,
      kcal: m.perServing.kcal,
      protein: m.perServing.protein,
      fiber: m.perServing.fiber,
    };
  });
}
