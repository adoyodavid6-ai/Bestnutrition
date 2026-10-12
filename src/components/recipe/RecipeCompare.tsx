"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RecipeSummary } from "@/lib/recipe-index";
import { ALLERGEN_LABELS, COST_LABELS, DIET_LABELS, type DietTag } from "@/lib/recipe-meta";
import { NUTRIENT_LABELS, roundNutrient } from "@/lib/nutrition";
import type { Nutrients } from "@/lib/types";

const DIETS: DietTag[] = ["vegan", "vegetarian", "pescatarian", "gluten-free", "dairy-free"];

export function RecipeCompare({ recipes, nutrition }: { recipes: RecipeSummary[]; nutrition: Record<string, Nutrients> }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const aSlug = params.get("a") || recipes[0].slug;
  const bSlug = params.get("b") || recipes[1].slug;
  const a = recipes.find((r) => r.slug === aSlug) ?? recipes[0];
  const b = recipes.find((r) => r.slug === bSlug) ?? recipes[1];

  const choose = (k: "a" | "b", v: string) => {
    const next = new URLSearchParams(params.toString());
    next.set(k, v);
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  const sorted = [...recipes].sort((x, y) => x.title.localeCompare(y.title));
  const pick = (k: "a" | "b", value: string) => (
    <div className="field">
      <label htmlFor={`cmp-${k}`}>{k === "a" ? "First recipe" : "Second recipe"}</label>
      <select id={`cmp-${k}`} className="select" value={value} onChange={(e) => choose(k, e.target.value)}>
        {sorted.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.title}
          </option>
        ))}
      </select>
    </div>
  );

  const rows: { label: string; a: React.ReactNode; b: React.ReactNode }[] = [
    { label: "Total time", a: `${a.totalMin} min`, b: `${b.totalMin} min` },
    { label: "Servings", a: a.servings, b: b.servings },
    { label: "Estimated cost", a: COST_LABELS[a.cost], b: COST_LABELS[b.cost] },
    ...NUTRIENT_LABELS.map(({ key, label, unit }) => ({
      label: `${label} (per serving)`,
      a: `${roundNutrient(key, nutrition[a.slug][key])} ${unit}`,
      b: `${roundNutrient(key, nutrition[b.slug][key])} ${unit}`,
    })),
    { label: "Suitable for", a: DIETS.filter((d) => a.diets.includes(d)).map((d) => DIET_LABELS[d]).join(", ") || "—", b: DIETS.filter((d) => b.diets.includes(d)).map((d) => DIET_LABELS[d]).join(", ") || "—" },
    { label: "Contains allergens", a: a.allergens.map((x) => ALLERGEN_LABELS[x]).join(", ") || "None tracked", b: b.allergens.map((x) => ALLERGEN_LABELS[x]).join(", ") || "None tracked" },
  ];

  return (
    <div>
      <div className="grid grid-2" style={{ gap: "0 24px" }}>
        {pick("a", a.slug)}
        {pick("b", b.slug)}
      </div>
      <div className="table-scroll">
        <table className="data-table" style={{ fontSize: "var(--fs-sm)" }}>
          <thead>
            <tr>
              <th scope="col">Compare</th>
              <th scope="col">
                <Link href={`/recipes/${a.slug}`}>{a.title}</Link>
              </th>
              <th scope="col">
                <Link href={`/recipes/${b.slug}`}>{b.title}</Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" style={{ background: "transparent", position: "static" }}>
                  {r.label}
                </th>
                <td>{r.a}</td>
                <td>{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xs muted" style={{ marginTop: 12 }}>
        Nutrition values are rounded estimates per serving, calculated from ingredient reference data. Serving sizes differ between recipes, so compare energy alongside how filling a meal is. Cost is a
        relative estimate, not a price.
      </p>
    </div>
  );
}
