import type { Metadata } from "next";
import { getRecipe, recipes } from "@/content/recipes";
import { StarterPlans, type StarterPlan } from "@/components/marketing/StarterPlans";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { calculateRecipeNutrition } from "@/lib/nutrition";
import { DEFAULT_PREFS, generatePlan, type PlannerPrefs } from "@/lib/planner";
import { buildShoppingList, groupByCategory } from "@/lib/shopping";
import { formatBaseQuantity } from "@/lib/units";

export const metadata: Metadata = {
  title: "Free 7-Day Meal Plan with Shopping List",
  description: "A free, printable seven-day meal plan — American, British or Asian kitchen — with breakfasts, lunches and dinners, estimated nutrition and one consolidated shopping list.",
  alternates: { canonical: "/free-meal-plan" },
  openGraph: { title: "Free 7-day meal plan with shopping list", description: "Balanced breakfasts, lunches and dinners for a week, with one tidy shopping list. Free and printable.", url: "/free-meal-plan" },
};

const KITCHENS: { id: StarterPlan["id"]; label: string; regions: string[]; seed: number; blurb: string }[] = [
  { id: "american", label: "American kitchen", regions: ["United States"], seed: 11, blurb: "Familiar American favourites made lighter — turkey chilli, salmon bowls and sheet-pan dinners." },
  { id: "british", label: "British kitchen", regions: ["United Kingdom"], seed: 23, blurb: "Comforting British classics — soups, fish pie and Sunday-style suppers, with plenty of veg." },
  { id: "asian", label: "Asian kitchen", regions: ["East Asia", "Southeast Asia", "South Asia"], seed: 37, blurb: "Bright, quick dishes from across Asia — stir-fries, noodle salads, curries and rice bowls." },
];

function build(k: (typeof KITCHENS)[number]): StarterPlan {
  const prefs: PlannerPrefs = { ...DEFAULT_PREFS, regions: k.regions, household: 2, budget: 2, maxTotalMin: 45, seed: k.seed };
  const g = generatePlan(recipes, prefs);
  const reqs = g.days.flatMap((d) => d.entries.flatMap((e) => (e.recipeSlug ? [{ recipe: getRecipe(e.recipeSlug)!, servings: e.servings }] : [])));
  const list = buildShoppingList(reqs);
  return {
    id: k.id,
    label: k.label,
    blurb: k.blurb,
    plan: { id: `starter-${k.id}`, name: `Starter week · ${k.label}`, createdAt: "2026-10-13T00:00:00.000Z", prefs, days: g.days },
    days: g.days.map((d) => ({
      label: d.label,
      meals: d.entries.flatMap((e) => {
        const r = e.recipeSlug ? getRecipe(e.recipeSlug) : undefined;
        if (!r) return [];
        const n = calculateRecipeNutrition(r).perServing;
        return [{ slot: e.slot, slug: r.slug, title: r.title, minutes: r.prepMin + r.cookMin, kcal: Math.round(n.kcal / 10) * 10, cuisine: r.cuisine }];
      }),
    })),
    shopping: groupByCategory(list).map((g) => ({ label: g.label, items: g.items.map((i) => `${formatBaseQuantity(i.qty, i.unit, "metric")} ${i.name}`) })),
    itemCount: list.length,
  };
}

export default function FreeMealPlanPage() {
  const plans = KITCHENS.map(build);
  return (
    <>
      <Breadcrumbs items={[{ href: "/free-meal-plan", label: "Free 7-day meal plan" }]} />
      <header className="page-head container lead-hero">
        <div>
          <span className="eyebrow">Free · No sign-up needed</span>
          <h1>A week of easy, balanced meals — on us</h1>
          <p className="lede">Seven days of breakfasts, lunches and dinners for two, ready in 45 minutes or less, with one shopping list that reuses ingredients so less goes to waste. Pick your kitchen, print it, or make it your own.</p>
          <ul className="check-list small" style={{ marginTop: 16 }}>
            <li>Nutrition estimated from every ingredient — nothing invented</li>
            <li>One consolidated shopping list, grouped by aisle</li>
            <li>Swap any meal in the free planner</li>
          </ul>
        </div>
        <div className="card no-print">
          <NewsletterForm source="free-meal-plan" heading="Get a fresh plan every week" consentText="Email me a new weekly meal plan and recipes." button="Send me plans" />
        </div>
      </header>
      <div className="container" style={{ paddingBottom: 48 }}>
        <StarterPlans plans={plans} />
        <p className="xs muted" style={{ marginTop: 24 }}>
          Calorie figures are per serving and estimated from ingredients using USDA reference data; they vary with brands and portion sizes. This is a general plan, not medical or dietetic advice — if you have a health
          condition, check with your clinician.
        </p>
      </div>
    </>
  );
}
