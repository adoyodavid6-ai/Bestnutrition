import { describe, expect, it } from "vitest";
import { recipes, getRecipe } from "@/content/recipes";
import { ingredients, hasIngredient } from "@/content/ingredients";
import { getReference } from "@/content/references";
import { calculateRecipeNutrition, roundNutrient } from "@/lib/nutrition";
import { deriveRecipeMeta } from "@/lib/recipe-meta";
import { formatQuantity, scaleQuantity, toFraction } from "@/lib/units";
import { buildShoppingList, mergeShoppingLists, estimateTotal } from "@/lib/shopping";
import { DEFAULT_PREFS, generatePlan, moveEntry, batchCookingIdeas, fitsPrefs } from "@/lib/planner";

describe("content integrity", () => {
  it("has unique recipe slugs", () => {
    const slugs = recipes.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique ingredient ids", () => {
    const ids = ingredients.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every recipe line references a known ingredient with a non-negative weight", () => {
    for (const r of recipes) {
      for (const l of r.ingredients) {
        expect(hasIngredient(l.id), `${r.slug}: ${l.id}`).toBe(true);
        expect(l.grams).toBeGreaterThanOrEqual(0);
        expect(l.qty).toBeGreaterThan(0);
      }
    }
  });

  it("every recipe is complete", () => {
    for (const r of recipes) {
      expect(r.ingredients.length, r.slug).toBeGreaterThan(2);
      expect(r.steps.length, r.slug).toBeGreaterThan(1);
      expect(r.servings, r.slug).toBeGreaterThan(0);
      expect(r.storage.length, r.slug).toBeGreaterThan(10);
      expect(r.categories.length, r.slug).toBeGreaterThan(0);
    }
  });

  it("recipe references resolve", () => {
    for (const r of recipes) for (const id of r.references ?? []) expect(getReference(id), id).toBeDefined();
  });
});

describe("nutrition", () => {
  it("computes per-serving values from ingredient weights", () => {
    const r = getRecipe("ugali-with-sukuma-wiki")!;
    const n = calculateRecipeNutrition(r);
    // 400 g maize flour alone contributes 1448 kcal; the whole dish should be in a plausible range.
    expect(n.total.kcal).toBeGreaterThan(1800);
    expect(n.total.kcal).toBeLessThan(2100);
    expect(n.perServing.kcal).toBeCloseTo(n.total.kcal / 4, 5);
  });

  it("excludes optional ingredients", () => {
    const r = getRecipe("shakshuka")!;
    const withFeta = calculateRecipeNutrition({ ...r, ingredients: r.ingredients.map((l) => ({ ...l, optional: false })) });
    const without = calculateRecipeNutrition(r);
    expect(withFeta.total.kcal).toBeGreaterThan(without.total.kcal);
  });

  it("rounds like a nutrition label", () => {
    expect(roundNutrient("kcal", 487)).toBe(490);
    expect(roundNutrient("kcal", 42)).toBe(40);
    expect(roundNutrient("protein", 3.3)).toBe(3.5);
    expect(roundNutrient("sodium", 333)).toBe(330);
  });

  it("all recipes have plausible per-serving energy", () => {
    for (const r of recipes) {
      const kcal = calculateRecipeNutrition(r).perServing.kcal;
      expect(kcal, r.slug).toBeGreaterThan(50);
      expect(kcal, r.slug).toBeLessThan(900);
    }
  });
});

describe("dietary derivation", () => {
  it("labels plant-only recipes as vegan", () => {
    expect(deriveRecipeMeta(getRecipe("githeri")!).diets).toContain("vegan");
  });
  it("never labels a recipe with fish as vegetarian", () => {
    const meta = deriveRecipeMeta(getRecipe("miso-glazed-salmon")!);
    expect(meta.diets).not.toContain("vegetarian");
    expect(meta.diets).toContain("pescatarian");
    expect(meta.allergens).toContain("fish");
  });
  it("treats honey as non-vegan", () => {
    expect(deriveRecipeMeta(getRecipe("uji-millet-porridge")!).diets).not.toContain("vegan");
  });
  it("flags gluten from oats conservatively", () => {
    expect(deriveRecipeMeta(getRecipe("berry-overnight-oats")!).allergens).toContain("gluten");
  });
});

describe("units and scaling", () => {
  it("scales quantities", () => {
    expect(scaleQuantity(400, 4, 6)).toBe(600);
    expect(scaleQuantity(1, 4, 2)).toBe(0.5);
  });
  it("formats fractions", () => {
    expect(toFraction(0.5)).toBe("½");
    expect(toFraction(1.25)).toBe("1¼");
    expect(toFraction(2)).toBe("2");
    expect(toFraction(0.05)).toBe("¼");
  });
  it("converts metric to US", () => {
    expect(formatQuantity(240, "ml", "us")).toBe("1 cup");
    expect(formatQuantity(454, "g", "us")).toBe("1 lb");
    expect(formatQuantity(1000, "ml", "metric")).toBe("1 L");
    expect(formatQuantity(15, "ml", "us")).toBe("1 tbsp");
    expect(formatQuantity(400, "g", "metric")).toBe("400 g");
  });
});

describe("shopping list", () => {
  it("consolidates ingredients across recipes and scales servings", () => {
    const list = buildShoppingList([
      { recipe: getRecipe("ugali-with-sukuma-wiki")!, servings: 4 },
      { recipe: getRecipe("githeri")!, servings: 8 },
    ]);
    const onion = list.find((i) => i.key === "onion|piece")!;
    expect(onion.qty).toBe(1 + 2); // 1 from ugali, 1 × 2 from doubled githeri
    expect(onion.recipes).toHaveLength(2);
    // tbsp of oil converted to ml and merged
    const oil = list.find((i) => i.key === "veg-oil|ml")!;
    expect(oil.qty).toBe(2 * 15 + 1.5 * 15 * 2);
    expect(list.find((i) => i.ingredientId === "water")).toBeUndefined();
  });

  it("keeps user checks, prices and custom items when regenerated", () => {
    const base = buildShoppingList([{ recipe: getRecipe("githeri")!, servings: 4 }]);
    base[0].checked = true;
    base[0].price = 2.5;
    const custom = { key: "custom|1", name: "Tea leaves", qty: 1, unit: "piece" as const, category: "other" as const, checked: false, custom: true, recipes: [] };
    const merged = mergeShoppingLists([...base, custom], buildShoppingList([{ recipe: getRecipe("githeri")!, servings: 4 }]));
    expect(merged.find((i) => i.key === base[0].key)!.checked).toBe(true);
    expect(merged.find((i) => i.key === "custom|1")).toBeDefined();
    expect(estimateTotal(merged).total).toBe(2.5);
  });
});

describe("meal planner", () => {
  it("creates 7 days with the requested slots", () => {
    const plan = generatePlan(recipes, { ...DEFAULT_PREFS, includeSnack: true });
    expect(plan.days).toHaveLength(7);
    for (const d of plan.days) expect(d.entries.map((e) => e.slot)).toEqual(["breakfast", "lunch", "dinner", "snack"]);
  });

  it("never violates hard dietary constraints", () => {
    const prefs = { ...DEFAULT_PREFS, diet: "vegan" as const, avoidAllergens: ["peanut" as const], maxTotalMin: 240, budget: 3 as const };
    const plan = generatePlan(recipes, prefs);
    for (const d of plan.days)
      for (const e of d.entries) {
        if (!e.recipeSlug) continue;
        const r = getRecipe(e.recipeSlug)!;
        const meta = deriveRecipeMeta(r);
        expect(meta.diets).toContain("vegan");
        expect(meta.allergens).not.toContain("peanut");
      }
  });

  it("does not repeat a recipe on consecutive days when alternatives exist", () => {
    const plan = generatePlan(recipes, { ...DEFAULT_PREFS, maxTotalMin: 240, budget: 3 });
    for (let i = 1; i < plan.days.length; i++) {
      const dinnerToday = plan.days[i].entries.find((e) => e.slot === "dinner")!.recipeSlug;
      const dinnerYesterday = plan.days[i - 1].entries.find((e) => e.slot === "dinner")!.recipeSlug;
      expect(dinnerToday).not.toBe(dinnerYesterday);
    }
  });

  it("is reproducible from a seed", () => {
    const a = generatePlan(recipes, { ...DEFAULT_PREFS, seed: 42 });
    const b = generatePlan(recipes, { ...DEFAULT_PREFS, seed: 42 });
    expect(a.days.map((d) => d.entries.map((e) => e.recipeSlug))).toEqual(b.days.map((d) => d.entries.map((e) => e.recipeSlug)));
  });

  it("moves meals between days by swapping same-slot entries", () => {
    const plan = generatePlan(recipes, DEFAULT_PREFS);
    const mon = plan.days[0].entries.find((e) => e.slot === "dinner")!;
    const tue = plan.days[1].entries.find((e) => e.slot === "dinner")!;
    const moved = moveEntry(plan.days, { day: 0, id: mon.id }, 1);
    expect(moved[1].entries.find((e) => e.slot === "dinner")!.id).toBe(mon.id);
    expect(moved[0].entries.find((e) => e.slot === "dinner")!.id).toBe(tue.id);
  });

  it("suggests batch cooking for shared staples", () => {
    const plan = generatePlan(recipes, { ...DEFAULT_PREFS, maxTotalMin: 240, budget: 3 });
    expect(batchCookingIdeas(plan.days, recipes).length).toBeGreaterThan(0);
  });

  it("every slot has at least one candidate under default prefs", () => {
    for (const slot of ["breakfast", "lunch", "dinner", "supper", "snack"] as const) {
      const ok = recipes.some((r) => fitsPrefs(r, deriveRecipeMeta(r), { ...DEFAULT_PREFS }) && r.categories.length > 0);
      expect(ok, slot).toBe(true);
    }
  });
});
