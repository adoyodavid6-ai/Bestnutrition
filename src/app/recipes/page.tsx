import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { recipes } from "@/content/recipes";
import { collections } from "@/content/collections";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeLibrary } from "@/components/recipe/RecipeLibrary";
import { recipeSummaries } from "@/lib/recipe-index";

export const metadata: Metadata = {
  title: "Healthy Recipes from Around the World",
  description: "Search healthy, affordable recipes by meal, cuisine, time, cost, diet and allergens — American, British and Asian favourites plus African, Mediterranean and Latin American dishes.",
  alternates: { canonical: "/recipes" },
};

export default function RecipesPage() {
  const cards = Object.fromEntries(recipes.map((r) => [r.slug, <RecipeCard key={r.slug} recipe={r} headingLevel={2} />]));
  return (
    <>
      <Breadcrumbs items={[{ href: "/recipes", label: "Recipes" }]} />
      <PageHead
        eyebrow="Recipe library"
        title="Recipes for real kitchens"
        lede={`${recipes.length} recipes from American, British and Asian kitchens and around the world, each with complete quantities, practical steps, substitutions and transparent nutrition estimates.`}
      >
        <div className="chip-row" style={{ marginTop: 20 }}>
          {collections.map((c) => (
            <Link key={c.slug} href={`/discover/${c.slug}`} className="chip chip-outline" style={{ textDecoration: "none" }}>
              {c.title}
            </Link>
          ))}
          <Link href="/recipes/compare" className="chip chip-violet" style={{ textDecoration: "none" }}>
            Compare recipes
          </Link>
        </div>
      </PageHead>
      <div className="container" style={{ paddingBottom: 48 }}>
        <Suspense fallback={<p className="muted">Loading filters…</p>}>
          <RecipeLibrary recipes={recipeSummaries()} cards={cards} />
        </Suspense>
      </div>
    </>
  );
}
