import type { MetadataRoute } from "next";
import { recipes } from "@/content/recipes";
import { nutritionArticles } from "@/content/nutrition";
import { conditions } from "@/content/conditions";
import { supplements } from "@/content/supplements";
import { fitnessGuides } from "@/content/fitness";
import { collections } from "@/content/collections";
import { publishedBusinesses, publishedProfessionals } from "@/content/directory";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/discover",
    "/recipes",
    "/recipes/compare",
    "/nutrition",
    "/health-conditions",
    "/meal-planner",
    "/fitness",
    "/wellness",
    "/supplements",
    "/professionals",
    "/businesses",
    "/for-businesses",
    "/pricing",
    "/about",
    "/editorial-policy",
    "/medical-disclaimer",
    "/privacy",
    "/terms",
    "/accessibility",
    "/contact",
  ];
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
  });
  return [
    ...staticPaths.map((p) => entry(p, undefined, p === "/" ? 1 : 0.7)),
    ...collections.map((c) => entry(`/discover/${c.slug}`)),
    ...recipes.map((r) => entry(`/recipes/${r.slug}`, r.review.lastReviewed ?? r.review.published, 0.8)),
    ...nutritionArticles.map((a) => entry(`/nutrition/${a.slug}`, a.review.lastReviewed ?? a.review.published)),
    ...conditions.map((c) => entry(`/health-conditions/${c.slug}`, c.review.lastReviewed ?? c.review.published)),
    ...supplements.map((s) => entry(`/supplements/${s.slug}`, s.review.lastReviewed ?? s.review.published)),
    ...fitnessGuides.map((g) => entry(`/fitness/${g.slug}`, g.review.lastReviewed ?? g.review.published)),
    ...publishedProfessionals().map((p) => entry(`/professionals/${p.slug}`)),
    ...publishedBusinesses().map((b) => entry(`/businesses/${b.slug}`)),
  ];
}
