import { describe, expect, it } from "vitest";
import { planToCsv, planToIcs, shoppingToCsv, type ExportRecipe } from "./export";
import { DEFAULT_PREFS, type MealPlan } from "./planner";
import type { ShoppingItem } from "./shopping";

const plan: MealPlan = {
  id: "plan_1",
  name: "Week, with commas",
  createdAt: "2026-10-13T00:00:00Z",
  prefs: DEFAULT_PREFS,
  days: [
    { label: "Monday", entries: [{ id: "a", slot: "breakfast", recipeSlug: "oats", servings: 2, prepared: false }] },
    { label: "Tuesday", entries: [{ id: "b", slot: "dinner", customTitle: '=HYPERLINK("x")', servings: 1, prepared: true }] },
  ],
};
const lookup = (slug: string): ExportRecipe | undefined => (slug === "oats" ? { title: "Porridge, apples", totalMin: 15, kcal: 351.4, protein: 11.6, url: "https://example.com/recipes/oats" } : undefined);

describe("exports", () => {
  it("writes the plan as CSV, quoting commas and neutralising formulas", () => {
    const csv = planToCsv(plan, lookup);
    const lines = csv.trim().split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('Monday,Breakfast,"Porridge, apples",2,15,351,12,https://example.com/recipes/oats,no');
    expect(lines[2]).toContain(`"'=HYPERLINK(""x"")"`);
  });

  it("writes the shopping list as CSV", () => {
    const items: ShoppingItem[] = [{ key: "k", name: "Rolled oats", qty: 160, unit: "g", category: "grains", checked: true, recipes: ["Porridge"] }];
    expect(shoppingToCsv(items).split("\r\n")[1]).toBe("Rolled oats,160 g,grains,yes,Porridge,,");
  });

  it("writes a calendar with one event per meal on the right dates", () => {
    const ics = planToIcs(plan, "2026-10-19", lookup, new Date("2026-10-13T09:00:00Z"));
    expect(ics).toContain("DTSTART:20261019T080000");
    expect(ics).toContain("DTEND:20261019T083000");
    expect(ics).toContain("DTSTART:20261020T183000");
    expect(ics).toContain("SUMMARY:Breakfast: Porridge\\, apples");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    for (const line of ics.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
  });
});
