import type { Metadata } from "next";
import Link from "next/link";
import { collections, collectionCovers, collectionRecipes } from "@/content/collections";
import { GOALS } from "@/content/goals";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { RecipeImage } from "@/components/RecipeImage";

export const metadata: Metadata = {
  title: "Discover Recipe Collections",
  description: "Curated collections: American classics, British favourites, the Asian kitchen, budget-friendly meals, 30-minute dinners, plant-forward plates and warming soups.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverPage() {
  const covers = collectionCovers();
  return (
    <>
      <Breadcrumbs items={[{ href: "/discover", label: "Discover" }]} />
      <PageHead eyebrow="Discover" title="Collections for every kitchen" lede="Cultural classics, budget staples and quick weeknight meals, curated from our recipe library." />
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="grid grid-3">
          {collections.map((c) => {
            const items = collectionRecipes(c);
            return (
              <Link key={c.slug} href={`/discover/${c.slug}`} className="recipe-card">
                <div className="art">{covers[c.slug] && <RecipeImage recipe={covers[c.slug]!} decorative />}</div>
                <div className="body">
                  <span className="cuisine">{c.kind}</span>
                  <h2 className="serif" style={{ fontWeight: 500, fontSize: "1.35rem", margin: 0 }}>
                    {c.title}
                  </h2>
                  <p className="small muted" style={{ margin: 0 }}>
                    {c.description}
                  </p>
                  <div className="meta">{items.length} recipes</div>
                </div>
              </Link>
            );
          })}
        </div>
        <section className="section-tight" aria-labelledby="by-goal" style={{ marginTop: 32 }}>
          <h2 id="by-goal" style={{ fontSize: "var(--fs-xl)" }}>
            Browse by goal
          </h2>
          <div className="chip-row">
            {GOALS.map((g) => (
              <Link key={g.id} href={`/recipes?goal=${g.id}`} className="chip chip-outline" style={{ textDecoration: "none", padding: "8px 14px", fontSize: "var(--fs-sm)" }}>
                {g.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
