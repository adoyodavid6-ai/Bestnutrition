import type { Metadata } from "next";
import Link from "next/link";
import { nutritionArticles } from "@/content/nutrition";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";

export const metadata: Metadata = {
  title: "Nutrition Education",
  description: "Plain-language, evidence-informed guides to macronutrients, fibre, salt, sugar, food labels, food safety and nutrition through life.",
  alternates: { canonical: "/nutrition" },
};

export default function NutritionIndex() {
  const categories = Array.from(new Set(nutritionArticles.map((a) => a.category)));
  return (
    <>
      <Breadcrumbs items={[{ href: "/nutrition", label: "Nutrition" }]} />
      <PageHead
        eyebrow="Nutrition explained"
        title="Nutrition, in plain language"
        lede="Clear guides built on public-health evidence — what the science says, what it doesn't, and how to apply it in your own kitchen."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        {categories.map((cat) => (
          <section key={cat} className="section-tight" aria-labelledby={`cat-${cat}`}>
            <h2 id={`cat-${cat}`} style={{ fontSize: "var(--fs-xl)" }}>
              {cat}
            </h2>
            <div className="grid grid-3">
              {nutritionArticles
                .filter((a) => a.category === cat)
                .map((a) => (
                  <Link key={a.slug} href={`/nutrition/${a.slug}`} className="card card-link">
                    <span className="eyebrow">{a.readMin} min read</span>
                    <h3 className="serif" style={{ fontWeight: 500, fontSize: "1.3rem" }}>
                      {a.title}
                    </h3>
                    <p className="small muted">{a.summary}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
