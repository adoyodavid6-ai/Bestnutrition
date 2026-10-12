import type { Unit } from "@/lib/types";

export type UnitSystem = "metric" | "us";

const GRAMS_PER_OZ = 28.3495;
const ML_PER_CUP = 240;
const ML_PER_TBSP = 15;
const ML_PER_TSP = 5;

/** Format a decimal as a friendly fraction (nearest quarter, or third where closer). */
export function toFraction(value: number): string {
  if (value <= 0) return "0";
  const whole = Math.floor(value);
  const rest = value - whole;
  const candidates: [number, string][] = [
    [0, ""],
    [0.25, "¼"],
    [1 / 3, "⅓"],
    [0.5, "½"],
    [2 / 3, "⅔"],
    [0.75, "¾"],
    [1, ""],
  ];
  let best = candidates[0];
  for (const c of candidates) if (Math.abs(c[0] - rest) < Math.abs(best[0] - rest)) best = c;
  const w = best[0] === 1 ? whole + 1 : whole;
  if (w === 0 && best[1] === "") return best[0] === 1 ? "1" : "¼"; // never show 0 for a real amount
  if (w === 0) return best[1];
  return best[1] ? `${w}${best[1]}` : `${w}`;
}

function roundMetric(value: number): number {
  if (value >= 100) return Math.round(value / 5) * 5;
  if (value >= 10) return Math.round(value);
  return Math.round(value * 2) / 2 || 0.5;
}

const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

/** Convert and format a quantity for display. */
export function formatQuantity(qty: number, unit: Unit, system: UnitSystem): string {
  switch (unit) {
    case "g": {
      if (system === "metric") {
        if (qty >= 1000) return `${(Math.round(qty / 50) * 50) / 1000} kg`;
        return `${roundMetric(qty)} g`;
      }
      const oz = qty / GRAMS_PER_OZ;
      if (oz >= 16) return `${toFraction(oz / 16)} lb`;
      return `${toFraction(oz)} oz`;
    }
    case "ml": {
      if (system === "metric") {
        if (qty >= 1000) return `${Math.round(qty / 50) * 50 / 1000} L`;
        return `${roundMetric(qty)} ml`;
      }
      if (qty >= ML_PER_CUP / 4) {
        const cups = qty / ML_PER_CUP;
        return `${toFraction(cups)} ${plural(cups, "cup", "cups")}`;
      }
      if (qty >= ML_PER_TBSP) return `${toFraction(qty / ML_PER_TBSP)} tbsp`;
      return `${toFraction(qty / ML_PER_TSP)} tsp`;
    }
    case "tsp":
      return `${toFraction(qty)} tsp`;
    case "tbsp":
      return `${toFraction(qty)} tbsp`;
    case "clove":
      return `${toFraction(qty)} ${plural(qty, "clove", "cloves")}`;
    case "pinch":
      return `${Math.max(1, Math.round(qty))} ${plural(Math.round(qty), "pinch", "pinches")}`;
    case "handful":
      return `${toFraction(qty)} ${plural(qty, "handful", "handfuls")}`;
    case "piece":
    default:
      return toFraction(qty);
  }
}

/** Scale a quantity from base servings to target servings. */
export function scaleQuantity(qty: number, baseServings: number, targetServings: number): number {
  if (baseServings <= 0) return qty;
  return (qty * targetServings) / baseServings;
}

/** Normalise volume units so they can be added together. */
export function toBase(qty: number, unit: Unit): { qty: number; unit: Unit } {
  if (unit === "tsp") return { qty: qty * ML_PER_TSP, unit: "ml" };
  if (unit === "tbsp") return { qty: qty * ML_PER_TBSP, unit: "ml" };
  return { qty, unit };
}

/** Prefer spoon measures for small volumes when displaying base millilitres in metric. */
export function formatBaseQuantity(qty: number, unit: Unit, system: UnitSystem): string {
  if (unit === "ml" && qty < 30) {
    if (qty >= ML_PER_TBSP) return `${toFraction(qty / ML_PER_TBSP)} tbsp`;
    return `${toFraction(qty / ML_PER_TSP)} tsp`;
  }
  return formatQuantity(qty, unit, system);
}
