import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { RecipeCompare } from "@/components/recipe/RecipeCompare";
import { recipeSummaries } from "@/lib/recipe-index";
import { recipes } from "@/content/recipes";
import { calculateRecipeNutrition } from "@/lib/nutrition";

export const metadata: Metadata = {
  title: "Compare Recipes",
  description: "Compare two recipes side by side: time, cost, nutrition estimates, allergens and dietary suitability.",
  alternates: { canonical: "/recipes/compare" },
};

export default function ComparePage() {
  const nutrition = Object.fromEntries(recipes.map((r) => [r.slug, calculateRecipeNutrition(r).perServing]));
  return (
    <>
      <Breadcrumbs items={[{ href: "/recipes", label: "Recipes" }, { href: "/recipes/compare", label: "Compare" }]} />
      <PageHead eyebrow="Nutrition transparency" title="Compare two recipes" lede="See the trade-offs side by side. Every figure is an estimate you can trace back to its ingredients on the recipe page." />
      <div className="container" style={{ paddingBottom: 48 }}>
        <Suspense fallback={null}>
          <RecipeCompare recipes={recipeSummaries()} nutrition={nutrition} />
        </Suspense>
      </div>
    </>
  );
}
