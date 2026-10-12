"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { RecipeSummary } from "@/lib/recipe-index";
import { ALLERGEN_LABELS, COST_LABELS, DIET_LABELS, type DietTag } from "@/lib/recipe-meta";
import { CHARACTERISTIC_LABELS, type NutritionCharacteristic } from "@/lib/nutrition";
import type { Allergen } from "@/lib/types";
import { GOALS } from "@/content/goals";

const MEALS: [string, string][] = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
  ["supper", "Supper"],
  ["snack", "Snacks"],
  ["beverage", "Smoothies & drinks"],
  ["soup", "Soups"],
  ["salad", "Salads"],
  ["main", "Main courses"],
  ["side", "Sides"],
  ["dessert", "Desserts & treats"],
];
const DIETS: DietTag[] = ["vegan", "vegetarian", "pescatarian", "gluten-free", "dairy-free", "egg-free", "nut-free"];
const ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];
const METHODS: [string, string][] = [
  ["stovetop", "Stovetop"],
  ["simmered", "Simmered / stewed"],
  ["oven", "Oven-baked"],
  ["grill", "Grilled"],
  ["griddle", "Griddle / pan"],
  ["blender", "Blended"],
  ["no-cook", "No-cook"],
];
const EQUIPMENT: [string, string][] = [
  ["stovetop-only", "Stovetop only"],
  ["oven", "Needs an oven or grill"],
  ["blender", "Needs a blender"],
  ["no-cook", "No cooking needed"],
];
const SORTS: [string, string][] = [
  ["relevance", "Recommended"],
  ["quickest", "Quickest first"],
  ["protein", "Most protein"],
  ["fibre", "Most fibre"],
  ["energy", "Lowest energy"],
];

type Filters = Record<string, string>;

function Select({ k, label, options, any = "Any", f, set }: { k: string; label: string; options: [string, string][]; any?: string; f: Filters; set: (k: string, v: string) => void }) {
  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <label htmlFor={`f-${k}`}>{label}</label>
      <select id={`f-${k}`} className="select" value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)}>
        <option value="">{any}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RecipeLibrary({ recipes, cards }: { recipes: RecipeSummary[]; cards: Record<string, React.ReactNode> }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [showAll, setShowAll] = useState(false);

  const f: Filters = Object.fromEntries(params.entries());
  const multi = (k: string) => (f[k] ? f[k].split(",").filter(Boolean) : []);

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };
  const toggleMulti = (k: string, v: string) => {
    const cur = multi(k);
    set(k, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(","));
  };

  const cuisines = useMemo(() => Array.from(new Set(recipes.map((r) => r.cuisine))).sort(), [recipes]);
  const regions = useMemo(() => Array.from(new Set(recipes.map((r) => r.region))).sort(), [recipes]);
  const proteins = useMemo(() => Array.from(new Set(recipes.flatMap((r) => r.proteinSources))).sort(), [recipes]);
  const ingredientOptions = useMemo(() => {
    const m = new Map<string, string>();
    recipes.forEach((r) => r.ingredients.forEach((i) => m.set(i.id, i.name)));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [recipes]);

  const results = useMemo(() => {
    const q = (f.q ?? "").toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);
    const diets = multi("diet");
    const exclude = multi("exclude");
    let list = recipes.filter((r) => {
      if (terms.length) {
        const hay = `${r.title} ${r.cuisine} ${r.region} ${r.intro} ${r.ingredients.map((i) => i.name).join(" ")}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      if (f.meal && !r.categories.includes(f.meal as never)) return false;
      if (f.cuisine && r.cuisine !== f.cuisine) return false;
      if (f.region && r.region !== f.region) return false;
      if (f.time && r.totalMin > Number(f.time)) return false;
      if (f.prep && r.prepMin > Number(f.prep)) return false;
      if (f.cook && r.cookMin > Number(f.cook)) return false;
      if (f.difficulty && r.difficulty !== f.difficulty) return false;
      if (f.cost && r.cost > Number(f.cost)) return false;
      if (f.method && !r.methods.includes(f.method as never)) return false;
      if (f.equipment && !r.equipment.includes(f.equipment as never)) return false;
      if (f.protein && !r.proteinSources.includes(f.protein)) return false;
      if (f.ingredient && !r.ingredients.some((i) => i.id === f.ingredient)) return false;
      if (f.nutrition && !r.characteristics.includes(f.nutrition as NutritionCharacteristic)) return false;
      if (f.servings && r.servings < Number(f.servings)) return false;
      if (f.goal && !r.goals.includes(f.goal as never)) return false;
      if (diets.some((d) => !r.diets.includes(d as DietTag))) return false;
      if (exclude.some((a) => r.allergens.includes(a as Allergen))) return false;
      return true;
    });
    const sort = f.sort ?? "relevance";
    if (sort === "quickest") list = [...list].sort((a, b) => a.totalMin - b.totalMin);
    if (sort === "protein") list = [...list].sort((a, b) => b.protein - a.protein);
    if (sort === "fibre") list = [...list].sort((a, b) => b.fiber - a.fiber);
    if (sort === "energy") list = [...list].sort((a, b) => a.kcal - b.kcal);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, recipes]);

  const activeCount = [...params.keys()].filter((k) => k !== "sort").length;

  return (
    <div>
      <div className="filters-panel">
        <div className="field">
          <label htmlFor="f-q">Search recipes</label>
          <input id="f-q" className="input" type="search" placeholder="Try “beans”, “Somali”, “breakfast under 20 minutes”…" defaultValue={f.q ?? ""} onChange={(e) => set("q", e.target.value)} />
        </div>
        <div className="chip-row" role="group" aria-label="Meal category" style={{ marginBottom: 16 }}>
          <button type="button" className="filter-chip" aria-pressed={!f.meal} onClick={() => set("meal", "")}>
            All
          </button>
          {MEALS.map(([v, l]) => (
            <button key={v} type="button" className="filter-chip" aria-pressed={f.meal === v} onClick={() => set("meal", f.meal === v ? "" : v)}>
              {l}
            </button>
          ))}
        </div>
        <fieldset style={{ marginBottom: 16 }}>
          <legend className="small">Dietary preference</legend>
          <div className="chip-row">
            {DIETS.map((d) => (
              <button key={d} type="button" className="filter-chip" aria-pressed={multi("diet").includes(d)} onClick={() => toggleMulti("diet", d)}>
                {DIET_LABELS[d]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="filters-grid">
          <Select f={f} set={set} k="time" label="Total time" options={[["15", "15 min or less"], ["30", "30 min or less"], ["45", "45 min or less"], ["60", "1 hour or less"]]} />
          <Select f={f} set={set} k="cuisine" label="Cuisine" options={cuisines.map((c) => [c, c])} />
          <Select f={f} set={set} k="cost" label="Estimated cost" options={[["1", COST_LABELS[1]], ["2", `${COST_LABELS[2]} or less`]]} />
          <Select f={f} set={set} k="sort" label="Sort by" options={SORTS} any="Recommended" />
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Fewer filters" : "More filters"}
        </button>
        {showAll && (
          <div style={{ marginTop: 16 }}>
            <fieldset>
              <legend className="small">Exclude allergens</legend>
              <div className="chip-row">
                {ALLERGENS.map((a) => (
                  <button key={a} type="button" className="filter-chip" aria-pressed={multi("exclude").includes(a)} onClick={() => toggleMulti("exclude", a)}>
                    No {ALLERGEN_LABELS[a].replace(/ \(.*\)/, "").toLowerCase()}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="filters-grid">
              <Select f={f} set={set} k="region" label="Region" options={regions.map((r) => [r, r])} />
              <Select f={f} set={set} k="prep" label="Preparation time" options={[["10", "10 min or less"], ["15", "15 min or less"], ["20", "20 min or less"]]} />
              <Select f={f} set={set} k="cook" label="Cooking time" options={[["0", "No cooking"], ["15", "15 min or less"], ["30", "30 min or less"], ["45", "45 min or less"]]} />
              <Select f={f} set={set} k="difficulty" label="Difficulty" options={[["easy", "Easy"], ["moderate", "Moderate"], ["involved", "Involved"]]} />
              <Select f={f} set={set} k="ingredient" label="Includes ingredient" options={ingredientOptions} />
              <Select f={f} set={set} k="protein" label="Protein source" options={proteins.map((p) => [p, p])} />
              <Select f={f} set={set} k="method" label="Cooking method" options={METHODS} />
              <Select f={f} set={set} k="equipment" label="Equipment" options={EQUIPMENT} />
              <Select f={f} set={set} k="nutrition" label="Nutrition" options={(Object.keys(CHARACTERISTIC_LABELS) as NutritionCharacteristic[]).map((c) => [c, CHARACTERISTIC_LABELS[c]])} />
              <Select f={f} set={set} k="goal" label="Goal" options={GOALS.map((g) => [g.id, g.title])} />
              <Select f={f} set={set} k="servings" label="Serves at least" options={[["2", "2 people"], ["4", "4 people"], ["6", "6 people"]]} />
            </div>
          </div>
        )}
      </div>

      <div className="spread" style={{ margin: "24px 0 16px" }}>
        <p role="status" aria-live="polite" style={{ margin: 0 }}>
          <strong>{results.length}</strong> {results.length === 1 ? "recipe" : "recipes"}
          {activeCount > 0 && " match your filters"}
        </p>
        {activeCount > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.replace(pathname, { scroll: false })}>
            Clear all filters
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-3">
          {results.map((r) => (
            <div key={r.slug}>{cards[r.slug]}</div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No recipes match yet</h2>
          <p className="muted">Try removing a filter or two. Our library is growing as recipes are written and checked.</p>
          <button type="button" className="btn btn-primary" onClick={() => router.replace(pathname, { scroll: false })}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

