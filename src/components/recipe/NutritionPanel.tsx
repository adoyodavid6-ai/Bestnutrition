import Link from "next/link";
import { getIngredient } from "@/content/ingredients";
import { CHARACTERISTIC_LABELS, CHARACTERISTIC_THRESHOLDS, NUTRIENT_LABELS, calculateRecipeNutrition, characteristics, roundNutrient } from "@/lib/nutrition";
import type { Recipe } from "@/lib/types";

export function NutritionPanel({ recipe }: { recipe: Recipe }) {
  const n = calculateRecipeNutrition(recipe);
  const tags = characteristics(n.perServing);
  const proxies = n.lines.filter((l) => getIngredient(l.line.id).source.proxy && !l.line.optional);
  const excluded = recipe.ingredients.filter((l) => l.optional);
  const lines = [...n.lines].filter((l) => !l.line.optional && l.line.grams > 0).sort((a, b) => b.nutrients.kcal - a.nutrients.kcal);

  return (
    <section aria-labelledby="nutrition-heading" className="card">
      <div className="spread" style={{ alignItems: "baseline" }}>
        <h2 id="nutrition-heading" style={{ fontSize: "var(--fs-xl)", margin: 0 }}>
          Nutrition per serving
        </h2>
        <span className="chip chip-warning" title="Calculated, not laboratory-measured">
          Estimate
        </span>
      </div>
      <table className="nutrition-table" style={{ marginTop: 12 }}>
        <caption className="sr-only">Estimated nutrition per serving, 1 of {recipe.servings} servings</caption>
        <tbody>
          {NUTRIENT_LABELS.map(({ key, label, unit }) => (
            <tr key={key} className={key === "kcal" ? "major" : undefined}>
              <td>{key === "satFat" ? <span style={{ paddingLeft: 12 }}>of which saturates</span> : label}</td>
              <td>
                {roundNutrient(key, n.perServing[key])} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tags.length > 0 && (
        <div className="chip-row" style={{ marginTop: 12 }}>
          {tags.map((t) => (
            <span key={t} className="chip chip-outline">
              {CHARACTERISTIC_LABELS[t]}
            </span>
          ))}
        </div>
      )}
      <p className="xs muted" style={{ marginTop: 12 }}>
        Values are estimates calculated from ingredient reference data and rounded. They vary with brands, ingredient sizes, preparation and portion. Don&apos;t use them for medical dosing (such as insulin)
        without checking against packaging or a verified source.
      </p>

      <details className="disclosure" style={{ marginTop: 8 }}>
        <summary>How we calculated this</summary>
        <p className="small">
          We add up each ingredient&apos;s weight × its reference nutrient values per 100 g (from{" "}
          <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
            USDA FoodData Central
          </a>
          ), then divide by {recipe.servings} servings. Salt and stock used in the recipe are included. Water is counted as zero.
        </p>
        <div className="table-scroll">
          <table className="data-table">
            <caption className="sr-only">Nutrient contribution of each ingredient to the whole recipe</caption>
            <thead>
              <tr>
                <th scope="col">Ingredient</th>
                <th scope="col" className="num">
                  Weight
                </th>
                <th scope="col" className="num">
                  kcal
                </th>
                <th scope="col" className="num">
                  Protein
                </th>
                <th scope="col" className="num">
                  Fibre
                </th>
                <th scope="col" className="num">
                  Sodium
                </th>
                <th scope="col">Share of energy</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(({ line, nutrients, share }, i) => {
                const ing = getIngredient(line.id);
                return (
                  <tr key={`${line.id}-${i}`}>
                    <td>
                      {ing.name}
                      <div className="muted" style={{ fontSize: 11 }}>
                        Ref: {ing.source.description}
                        {ing.source.proxy ? ` — proxy: ${ing.source.proxy}` : ""}
                      </div>
                    </td>
                    <td className="num">{Math.round(line.grams)} g</td>
                    <td className="num">{Math.round(nutrients.kcal)}</td>
                    <td className="num">{nutrients.protein.toFixed(1)} g</td>
                    <td className="num">{nutrients.fiber.toFixed(1)} g</td>
                    <td className="num">{Math.round(nutrients.sodium)} mg</td>
                    <td>
                      <div className="bar" aria-label={`${Math.round(share * 100)}%`}>
                        <span style={{ width: `${Math.round(share * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {excluded.length > 0 && (
          <p className="xs muted" style={{ marginTop: 8 }}>
            Not included: optional {excluded.map((l) => getIngredient(l.id).name.toLowerCase()).join(", ")}.
          </p>
        )}
        {proxies.length > 0 && (
          <p className="xs muted">
            Proxy values used where no direct reference entry exists: {proxies.map((p) => getIngredient(p.line.id).name).join(", ")}.
          </p>
        )}
        <p className="xs muted">
          Characteristic labels use NourishWell editorial thresholds per serving: high fibre ≥ {CHARACTERISTIC_THRESHOLDS.highFibre} g, high protein ≥ {CHARACTERISTIC_THRESHOLDS.highProtein} g, lower sodium ≤{" "}
          {CHARACTERISTIC_THRESHOLDS.lowerSodium} mg, lower saturated fat ≤ {CHARACTERISTIC_THRESHOLDS.lowerSatFat} g. These are not regulatory nutrition claims.
        </p>
        <p className="xs" style={{ marginBottom: 0 }}>
          Data status: <strong>calculated estimate</strong> (not laboratory-verified). <Link href="/editorial-policy#nutrition-data">About our nutrition data</Link>
        </p>
      </details>
    </section>
  );
}
