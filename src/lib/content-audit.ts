import { recipes } from "@/content/recipes";
import { nutritionArticles } from "@/content/nutrition";
import { conditions } from "@/content/conditions";
import { supplements } from "@/content/supplements";
import { fitnessGuides } from "@/content/fitness";
import { getReference, references } from "@/content/references";
import { getIngredient } from "@/content/ingredients";
import type { ContentReview } from "@/lib/types";

export interface AuditRow {
  kind: "Recipe" | "Nutrition" | "Health condition" | "Supplement" | "Fitness";
  title: string;
  href: string;
  review: ContentReview;
  references: number;
  requiresClinicalReview: boolean;
  issues: string[];
}

const DAY = 86_400_000;

function reviewIssues(review: ContentReview, requiresClinicalReview: boolean, now: Date): string[] {
  const issues: string[] = [];
  if (requiresClinicalReview && !review.reviewer) issues.push("Awaiting qualified professional review");
  const last = review.lastReviewed ?? review.published;
  if (now.getTime() - new Date(last).getTime() > 365 * DAY) issues.push("Over 12 months since last review");
  if (review.reviewer && !review.lastReviewed) issues.push("Reviewer recorded without a review date");
  return issues;
}

export function auditContent(now = new Date()): AuditRow[] {
  const rows: AuditRow[] = [];
  for (const r of recipes) {
    const issues = reviewIssues(r.review, false, now);
    if (!r.photo) issues.push("No dish image (illustration only; Recipe rich results disabled)");
    else if (r.photo.kind === "ai-generated") issues.push("AI-generated image; replace with photography of the tested dish");
    if (r.ingredients.some((l) => getIngredient(l.id).source.proxy)) issues.push("Uses proxy nutrient data");
    if ((r.references ?? []).some((id) => !getReference(id))) issues.push("Broken reference id");
    rows.push({ kind: "Recipe", title: r.title, href: `/recipes/${r.slug}`, review: r.review, references: r.references?.length ?? 0, requiresClinicalReview: false, issues });
  }
  const pushArticles = <T extends { review: ContentReview; references: string[] }>(kind: AuditRow["kind"], items: T[], title: (t: T) => string, href: (t: T) => string) => {
    for (const a of items) {
      const issues = reviewIssues(a.review, true, now);
      if (a.references.length === 0) issues.push("No references");
      if (a.references.some((id) => !getReference(id))) issues.push("Broken reference id");
      rows.push({ kind, title: title(a), href: href(a), review: a.review, references: a.references.length, requiresClinicalReview: true, issues });
    }
  };
  pushArticles("Nutrition", nutritionArticles, (a) => a.title, (a) => `/nutrition/${a.slug}`);
  pushArticles("Health condition", conditions, (a) => a.title, (a) => `/health-conditions/${a.slug}`);
  pushArticles("Supplement", supplements, (a) => a.name, (a) => `/supplements/${a.slug}`);
  pushArticles("Fitness", fitnessGuides, (a) => a.title, (a) => `/fitness/${a.slug}`);
  return rows;
}

export function referenceUsage() {
  const counts = new Map<string, number>();
  const add = (ids: string[] = []) => ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  recipes.forEach((r) => add(r.references));
  [...nutritionArticles, ...conditions, ...supplements, ...fitnessGuides].forEach((a) => add(a.references));
  return references.map((r) => ({ ...r, uses: counts.get(r.id) ?? 0 }));
}
