import { recipes } from "@/content/recipes";
import { nutritionArticles } from "@/content/nutrition";
import { conditions } from "@/content/conditions";
import { supplements } from "@/content/supplements";
import { fitnessGuides } from "@/content/fitness";
import { getIngredient } from "@/content/ingredients";

export interface SearchDoc {
  type: "Recipe" | "Nutrition" | "Health condition" | "Supplement" | "Fitness & wellness";
  title: string;
  summary: string;
  href: string;
  text: string; // lower-cased searchable text
}

export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const r of recipes) {
    const ingr = r.ingredients.map((l) => {
      const i = getIngredient(l.id);
      return `${i.name} ${(i.altNames ?? []).join(" ")}`;
    });
    docs.push({ type: "Recipe", title: r.title, summary: r.intro, href: `/recipes/${r.slug}`, text: [r.title, r.cuisine, r.region, r.intro, r.categories.join(" "), ...ingr].join(" ").toLowerCase() });
  }
  for (const a of nutritionArticles)
    docs.push({ type: "Nutrition", title: a.title, summary: a.summary, href: `/nutrition/${a.slug}`, text: [a.title, a.summary, a.category, ...a.sections.map((s) => s.heading + " " + s.body.join(" ") + " " + (s.bullets ?? []).join(" "))].join(" ").toLowerCase() });
  for (const c of conditions)
    docs.push({ type: "Health condition", title: c.title, summary: c.summary, href: `/health-conditions/${c.slug}`, text: [c.title, c.summary, c.group, ...c.whatItIs, ...c.patterns, ...c.practical].join(" ").toLowerCase() });
  for (const s of supplements)
    docs.push({ type: "Supplement", title: s.name, summary: s.summary, href: `/supplements/${s.slug}`, text: [s.name, s.type, s.summary, ...s.role, ...s.foodSources, ...s.useCases].join(" ").toLowerCase() });
  for (const g of fitnessGuides)
    docs.push({ type: "Fitness & wellness", title: g.title, summary: g.summary, href: `/fitness/${g.slug}`, text: [g.title, g.category, g.summary, g.audience, ...g.steps.map((s) => s.title + " " + s.detail)].join(" ").toLowerCase() });
  return docs;
}

/** Score documents for a query: title matches weigh most, then every-term matches in the body. */
export function searchDocs(docs: SearchDoc[], query: string): SearchDoc[] {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .filter((t) => t.length > 1);
  if (terms.length === 0) return [];
  const scored = docs
    .map((d) => {
      const title = d.title.toLowerCase();
      let score = 0;
      let matched = 0;
      for (const t of terms) {
        const inTitle = title.includes(t);
        const inText = d.text.includes(t);
        if (inTitle || inText) matched++;
        if (inTitle) score += 5;
        if (inText) score += 1 + Math.min(3, d.text.split(t).length - 2) * 0.3;
      }
      if (title === query.toLowerCase().trim()) score += 10;
      return { d, score, matched };
    })
    .filter((x) => x.matched === terms.length || (terms.length > 2 && x.matched >= terms.length - 1))
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.d);
}
