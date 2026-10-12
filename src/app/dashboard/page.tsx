import type { Metadata } from "next";
import { recipes } from "@/content/recipes";
import { nutritionArticles } from "@/content/nutrition";
import { conditions } from "@/content/conditions";
import { supplements } from "@/content/supplements";
import { fitnessGuides } from "@/content/fitness";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { Dashboard } from "@/components/Dashboard";
import { RecipeCard } from "@/components/RecipeCard";
import { deriveRecipeMeta } from "@/lib/recipe-meta";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Your meal plan, shopping list, saved recipes and recently viewed content.",
  robots: { index: false },
};

export default function DashboardPage() {
  const thumbs = Object.fromEntries(recipes.map((r) => [r.slug, <RecipeCard key={r.slug} recipe={r} />]));
  const articleTitles: Record<string, string> = {
    ...Object.fromEntries(nutritionArticles.map((a) => [`/nutrition/${a.slug}`, a.title])),
    ...Object.fromEntries(conditions.map((c) => [`/health-conditions/${c.slug}`, c.title])),
    ...Object.fromEntries(supplements.map((s) => [`/supplements/${s.slug}`, s.name])),
    ...Object.fromEntries(fitnessGuides.map((g) => [`/fitness/${g.slug}`, g.title])),
  };
  return (
    <>
      <Breadcrumbs items={[{ href: "/dashboard", label: "Dashboard" }]} />
      <PageHead eyebrow="Your space" title="My dashboard" />
      <div className="container" style={{ paddingBottom: 48 }}>
        <Dashboard recipes={recipes.map((r) => ({ slug: r.slug, title: r.title, cuisine: r.cuisine, totalMin: deriveRecipeMeta(r).totalMin }))} thumbs={thumbs} articleTitles={articleTitles} />
      </div>
    </>
  );
}
