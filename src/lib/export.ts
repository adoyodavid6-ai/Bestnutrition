import type { MealPlan, Slot } from "./planner";
import { SLOT_LABELS } from "./planner";
import type { ShoppingItem } from "./shopping";
import { formatBaseQuantity } from "./units";

/** Premium exports: meal plan and shopping list as CSV, and the plan as a calendar (.ics). */

export interface ExportRecipe {
  title: string;
  totalMin: number;
  kcal: number;
  protein: number;
  url: string;
}

const csvCell = (v: string | number) => {
  const s = String(v);
  // Neutralise spreadsheet formula injection, then quote when needed.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const csvRow = (cells: (string | number)[]) => cells.map(csvCell).join(",");

export function planToCsv(plan: MealPlan, lookup: (slug: string) => ExportRecipe | undefined): string {
  const rows = [csvRow(["Day", "Meal", "Recipe", "Servings", "Total time (min)", "Calories per serving (est.)", "Protein per serving (g, est.)", "Link", "Prepared"])];
  for (const day of plan.days) {
    for (const e of day.entries) {
      const r = e.recipeSlug ? lookup(e.recipeSlug) : undefined;
      rows.push(csvRow([day.label, SLOT_LABELS[e.slot], r?.title ?? e.customTitle ?? "", e.servings, r?.totalMin ?? "", r ? Math.round(r.kcal) : "", r ? Math.round(r.protein) : "", r?.url ?? "", e.prepared ? "yes" : "no"]));
    }
  }
  return rows.join("\r\n") + "\r\n";
}

export function shoppingToCsv(items: ShoppingItem[], units: "metric" | "us" = "metric"): string {
  const rows = [csvRow(["Item", "Quantity", "Aisle", "Got it", "For recipes", "Your price", "Note"])];
  for (const i of items) {
    rows.push(csvRow([i.name, formatBaseQuantity(i.qty, i.unit, units), i.category, i.checked ? "yes" : "no", i.recipes.join("; "), i.price ?? "", i.note ?? ""]));
  }
  return rows.join("\r\n") + "\r\n";
}

/** Suggested meal times. Calendar apps treat these as local "floating" times. */
export const SLOT_TIMES: Record<Slot, [string, number]> = {
  breakfast: ["0800", 30],
  lunch: ["1230", 45],
  snack: ["1530", 15],
  dinner: ["1830", 60],
  supper: ["2030", 30],
};

const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};
const plusMinutes = (hhmm: string, mins: number) => {
  const total = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(2)) + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}${String(total % 60).padStart(2, "0")}`;
};

/** Fold long lines at 75 octets as RFC 5545 requires. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function planToIcs(plan: MealPlan, weekStart: string, lookup: (slug: string) => ExportRecipe | undefined, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NourishWell//Meal plan//EN", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${icsText(plan.name)}`];
  plan.days.forEach((day, i) => {
    const date = addDays(weekStart, i);
    for (const e of day.entries) {
      const r = e.recipeSlug ? lookup(e.recipeSlug) : undefined;
      const title = r?.title ?? e.customTitle;
      if (!title) continue;
      const [start, mins] = SLOT_TIMES[e.slot];
      const desc = [`${SLOT_LABELS[e.slot]} · ${e.servings} serving${e.servings === 1 ? "" : "s"}`, r ? `About ${r.totalMin} minutes` : "", r?.url ?? ""].filter(Boolean).join("\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${plan.id}-${i}-${e.id}@nourishwell`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${date}T${start}00`,
        `DTEND:${date}T${plusMinutes(start, mins)}00`,
        `SUMMARY:${icsText(`${SLOT_LABELS[e.slot]}: ${title}`)}`,
        `DESCRIPTION:${icsText(desc)}`,
        ...(r ? [`URL:${r.url}`] : []),
        "END:VEVENT",
      );
    }
  });
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
