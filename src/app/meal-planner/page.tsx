import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { MealPlanner } from "@/components/planner/MealPlanner";

export const metadata: Metadata = {
  title: "Free Weekly Meal Planner",
  description: "Build a seven-day meal plan around your budget, time, household size, food traditions and allergies — with ingredient reuse, batch-cooking ideas and a consolidated shopping list.",
  alternates: { canonical: "/meal-planner" },
};

export default function MealPlannerPage() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/meal-planner", label: "Meal planner" }]} />
      <PageHead
        eyebrow="Meal planner"
        title="Plan a week of good food"
        lede="Seven days of meals that fit your household, budget and taste — with ingredients reused across the week so you buy less and waste less."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <MealPlanner />
      </div>
    </>
  );
}
