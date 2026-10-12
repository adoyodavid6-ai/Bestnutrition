"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { recipes, getRecipe } from "@/content/recipes";
import { ingredients } from "@/content/ingredients";
import { GOALS } from "@/content/goals";
import {
  DAY_LABELS,
  DEFAULT_PREFS,
  SLOT_CATEGORIES,
  SLOT_LABELS,
  batchCookingIdeas,
  dayNutritionPerPerson,
  fitsPrefs,
  generatePlan,
  moveEntry,
  newId,
  type DietPreference,
  type MealEntry,
  type MealPlan,
  type PlannerPrefs,
  type Slot,
} from "@/lib/planner";
import { deriveRecipeMeta, ALLERGEN_LABELS, COST_LABELS } from "@/lib/recipe-meta";
import { roundNutrient } from "@/lib/nutrition";
import { buildShoppingList, mergeShoppingLists, type ShoppingItem } from "@/lib/shopping";
import { KEYS, useStored } from "@/lib/storage";
import { planById } from "@/lib/plans";
import { track } from "@/lib/analytics";
import type { Allergen } from "@/lib/types";
import { FoodArt } from "../FoodArt";
import { Icon } from "../Icon";
import { toast } from "../Toaster";

const FREE_PLAN_LIMIT = planById("free").limits.savedPlans;
const ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];
const REGIONS = Array.from(new Set(recipes.map((r) => r.region))).sort();
const INGREDIENT_OPTIONS = [...ingredients].filter((i) => !["water", "salt"].includes(i.id)).sort((a, b) => a.name.localeCompare(b.name));
const metaCache = new Map(recipes.map((r) => [r.slug, deriveRecipeMeta(r)]));

function IngredientPicker({ id, label, hint, value, onChange }: { id: string; label: string; hint?: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      <select
        id={id}
        className="select"
        value=""
        onChange={(e) => {
          if (e.target.value && !value.includes(e.target.value)) onChange([...value, e.target.value]);
        }}
      >
        <option value="">Add an ingredient…</option>
        {INGREDIENT_OPTIONS.filter((i) => !value.includes(i.id)).map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
      {value.length > 0 && (
        <div className="chip-row" style={{ marginTop: 6 }}>
          {value.map((v) => (
            <button key={v} type="button" className="filter-chip" aria-label={`Remove ${INGREDIENT_OPTIONS.find((i) => i.id === v)?.name}`} onClick={() => onChange(value.filter((x) => x !== v))}>
              {INGREDIENT_OPTIONS.find((i) => i.id === v)?.name} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PrefsForm({ prefs, setPrefs, onGenerate, hasPlan }: { prefs: PlannerPrefs; setPrefs: (p: PlannerPrefs) => void; onGenerate: () => void; hasPlan: boolean }) {
  const patch = (p: Partial<PlannerPrefs>) => setPrefs({ ...prefs, ...p });
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGenerate();
      }}
    >
      <h2 style={{ fontSize: "var(--fs-xl)" }}>Your household</h2>
      <div className="field">
        <label htmlFor="p-household">People to cook for</label>
        <input id="p-household" type="number" min={1} max={12} className="input" value={prefs.household} onChange={(e) => patch({ household: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })} />
      </div>
      <fieldset>
        <legend className="small">Eating pattern</legend>
        <div className="chip-row">
          {(["any", "vegetarian", "vegan", "pescatarian"] as DietPreference[]).map((d) => (
            <button key={d} type="button" className="filter-chip" aria-pressed={prefs.diet === d} onClick={() => patch({ diet: d })}>
              {d === "any" ? "Anything" : d[0].toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="small">Allergies &amp; intolerances to avoid</legend>
        <div className="chip-row">
          {ALLERGENS.map((a) => (
            <button key={a} type="button" className="filter-chip" aria-pressed={prefs.avoidAllergens.includes(a)} onClick={() => patch({ avoidAllergens: toggle(prefs.avoidAllergens, a) })}>
              {ALLERGEN_LABELS[a].replace(/ \(.*\)/, "")}
            </button>
          ))}
        </div>
        <p className="hint" style={{ marginTop: 6 }}>
          Allergen matching uses our ingredient list. Always check packaged product labels.
        </p>
      </fieldset>
      <IngredientPicker id="p-dislikes" label="Foods you don't eat" value={prefs.dislikes} onChange={(v) => patch({ dislikes: v })} />
      <IngredientPicker id="p-pantry" label="Already in your kitchen" hint="We'll favour recipes that use these, to save money and waste." value={prefs.pantry} onChange={(v) => patch({ pantry: v })} />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="p-time">Max time per meal</label>
          <select id="p-time" className="select" value={prefs.maxTotalMin} onChange={(e) => patch({ maxTotalMin: Number(e.target.value) })}>
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={240}>No limit</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-budget">Budget</label>
          <select id="p-budget" className="select" value={prefs.budget} onChange={(e) => patch({ budget: Number(e.target.value) as 1 | 2 | 3 })}>
            <option value={1}>{COST_LABELS[1]}</option>
            <option value={2}>Moderate</option>
            <option value={3}>Flexible</option>
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="small">Favourite food traditions (optional)</legend>
        <div className="chip-row">
          {REGIONS.map((r) => (
            <button key={r} type="button" className="filter-chip" aria-pressed={prefs.regions.includes(r)} onClick={() => patch({ regions: toggle(prefs.regions, r) })}>
              {r}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="small">Goals (optional)</legend>
        <div className="chip-row">
          {GOALS.map((g) => (
            <button key={g.id} type="button" className="filter-chip" aria-pressed={prefs.goals.includes(g.id)} onClick={() => patch({ goals: toggle(prefs.goals, g.id) })}>
              {g.title}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="small">Meals to plan</legend>
        <p className="hint">Breakfast, lunch and dinner are always included.</p>
        <label className="checkbox">
          <input type="checkbox" checked={prefs.includeSupper} onChange={(e) => patch({ includeSupper: e.target.checked })} /> Add a light supper
        </label>
        <label className="checkbox" style={{ marginTop: 8 }}>
          <input type="checkbox" checked={prefs.includeSnack} onChange={(e) => patch({ includeSnack: e.target.checked })} /> Add a snack
        </label>
      </fieldset>
      <p className="xs muted">
        We don&apos;t ask about medical conditions. If you have one, read our <Link href="/health-conditions">condition guides</Link> and ask a registered dietitian for an individual plan.
      </p>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
        {hasPlan ? "Generate a new week" : "Build my meal plan"}
      </button>
    </form>
  );
}

function EntryRow({
  entry,
  dayIndex,
  plan,
  update,
  setDays,
}: {
  entry: MealEntry;
  dayIndex: number;
  plan: MealPlan;
  update: (e: MealEntry) => void;
  setDays: (d: MealPlan["days"]) => void;
}) {
  const r = entry.recipeSlug ? getRecipe(entry.recipeSlug) : undefined;
  const meta = r ? metaCache.get(r.slug) : undefined;
  const alternatives = useMemo(
    () => recipes.filter((x) => x.slug !== entry.recipeSlug && x.categories.some((c) => SLOT_CATEGORIES[entry.slot].includes(c)) && fitsPrefs(x, metaCache.get(x.slug)!, plan.prefs, { ignoreTime: true, ignoreBudget: true })),
    [entry.recipeSlug, entry.slot, plan.prefs],
  );
  const title = r?.title ?? entry.customTitle ?? "Meal";
  return (
    <div className={`plan-entry${entry.prepared ? " prepared" : ""}`}>
      <div className="thumb">{r ? <FoodArt recipe={r} decorative /> : <div style={{ width: "100%", height: "100%", background: "var(--parchment-deep)" }} />}</div>
      <div>
        <span className="slot">{SLOT_LABELS[entry.slot]}</span>
        <div className="title">{r ? <Link href={`/recipes/${r.slug}`}>{title}</Link> : title}</div>
        {r && meta && (
          <div className="xs muted">
            {meta.totalMin} min · ≈ {roundNutrient("kcal", meta.perServing.kcal)} kcal/serving · {COST_LABELS[meta.cost]}
          </div>
        )}
        <div className="controls no-print">
          <div className="servings-control" role="group" aria-label={`Servings for ${title}`}>
            <button type="button" aria-label="Fewer servings" onClick={() => update({ ...entry, servings: Math.max(1, entry.servings - 1) })}>
              −
            </button>
            <output>{entry.servings}</output>
            <button type="button" aria-label="More servings" onClick={() => update({ ...entry, servings: Math.min(24, entry.servings + 1) })}>
              +
            </button>
          </div>
          <label className="checkbox xs">
            <input type="checkbox" checked={entry.prepared} onChange={(e) => update({ ...entry, prepared: e.target.checked })} /> Prepared
          </label>
          <label className="sr-only" htmlFor={`rep-${entry.id}`}>
            Replace {title}
          </label>
          <select
            id={`rep-${entry.id}`}
            className="select"
            value=""
            onChange={(e) => {
              if (e.target.value) update({ ...entry, recipeSlug: e.target.value, customTitle: undefined, prepared: false });
            }}
          >
            <option value="">Replace…</option>
            {alternatives.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.title}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`mv-${entry.id}`}>
            Move {title} to another day
          </label>
          <select
            id={`mv-${entry.id}`}
            className="select"
            value=""
            onChange={(e) => {
              if (e.target.value !== "") setDays(moveEntry(plan.days, { day: dayIndex, id: entry.id }, Number(e.target.value)));
            }}
          >
            <option value="">Move to…</option>
            {DAY_LABELS.map((d, i) =>
              i === dayIndex ? null : (
                <option key={d} value={i}>
                  {d}
                </option>
              ),
            )}
          </select>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            aria-label={`Remove ${title}`}
            onClick={() => setDays(plan.days.map((d, i) => (i === dayIndex ? { ...d, entries: d.entries.filter((e) => e.id !== entry.id) } : d)))}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMeal({ dayIndex, plan, setDays }: { dayIndex: number; plan: MealPlan; setDays: (d: MealPlan["days"]) => void }) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<Slot>("snack");
  const [choice, setChoice] = useState("");
  const [custom, setCustom] = useState("");
  if (!open)
    return (
      <div style={{ padding: "12px 20px" }} className="no-print">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}>
          <Icon name="plus" size={14} /> Add a meal
        </button>
      </div>
    );
  return (
    <form
      className="no-print"
      style={{ padding: "12px 20px", display: "grid", gap: 8 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!choice && !custom.trim()) return;
        const entry: MealEntry = { id: newId(), slot, servings: plan.prefs.household, prepared: false, ...(choice ? { recipeSlug: choice } : { customTitle: custom.trim().slice(0, 80) }) };
        setDays(plan.days.map((d, i) => (i === dayIndex ? { ...d, entries: [...d.entries, entry] } : d)));
        setOpen(false);
        setChoice("");
        setCustom("");
      }}
    >
      <div className="row">
        <label className="sr-only" htmlFor={`am-slot-${dayIndex}`}>
          Meal
        </label>
        <select id={`am-slot-${dayIndex}`} className="select" style={{ width: "auto" }} value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
          {(Object.keys(SLOT_LABELS) as Slot[]).map((s) => (
            <option key={s} value={s}>
              {SLOT_LABELS[s]}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`am-recipe-${dayIndex}`}>
          Recipe
        </label>
        <select id={`am-recipe-${dayIndex}`} className="select" style={{ flex: 1, width: "auto" }} value={choice} onChange={(e) => setChoice(e.target.value)}>
          <option value="">Choose a recipe, or type your own below</option>
          {recipes
            .filter((r) => fitsPrefs(r, metaCache.get(r.slug)!, plan.prefs, { ignoreTime: true, ignoreBudget: true }))
            .map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.title}
              </option>
            ))}
        </select>
      </div>
      {!choice && (
        <>
          <label className="sr-only" htmlFor={`am-custom-${dayIndex}`}>
            Your own meal
          </label>
          <input id={`am-custom-${dayIndex}`} className="input" placeholder="Your own meal, e.g. “Leftover githeri” or “Eating out”" value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={80} />
        </>
      )}
      <div className="row">
        <button type="submit" className="btn btn-primary btn-sm">
          Add
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function MealPlanner() {
  const router = useRouter();
  const [prefs, setPrefs, hydrated] = useStored<PlannerPrefs>(KEYS.plannerPrefs, DEFAULT_PREFS);
  const [plans, setPlans] = useStored<MealPlan[]>(KEYS.plans, []);
  const [currentId, setCurrentId] = useStored<string | null>(KEYS.currentPlan, null);
  const [shopping, setShopping] = useStored<ShoppingItem[]>(KEYS.shopping, []);
  const [notes, setNotes] = useState<string[]>([]);
  const mergedPrefs = { ...DEFAULT_PREFS, ...prefs };
  const plan = plans.find((p) => p.id === currentId) ?? null;

  const savePlan = (p: MealPlan) => setPlans((all) => (all.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? p : x)) : [...all, p]));
  const setDays = (days: MealPlan["days"]) => plan && savePlan({ ...plan, days });

  const generate = () => {
    const seed = Math.floor(Math.random() * 1e9);
    const nextPrefs = { ...mergedPrefs, seed };
    setPrefs(nextPrefs);
    const g = generatePlan(recipes, nextPrefs);
    setNotes(g.notes);
    if (plan) {
      savePlan({ ...plan, prefs: nextPrefs, days: g.days, createdAt: new Date().toISOString() });
    } else {
      if (plans.length >= FREE_PLAN_LIMIT) {
        toast(`You can keep up to ${FREE_PLAN_LIMIT} saved plans. Delete one to create another.`);
        return;
      }
      const p: MealPlan = { id: newId("plan"), name: `Week of ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`, createdAt: new Date().toISOString(), prefs: nextPrefs, days: g.days };
      savePlan(p);
      setCurrentId(p.id);
    }
    track("meal_plan_created");
    toast("Your week is ready");
  };

  const newBlankPlan = () => {
    if (plans.length >= FREE_PLAN_LIMIT) {
      toast(`You can keep up to ${FREE_PLAN_LIMIT} saved plans. Delete one to create another.`);
      return;
    }
    const p: MealPlan = { id: newId("plan"), name: "New plan", createdAt: new Date().toISOString(), prefs: mergedPrefs, days: DAY_LABELS.map((label) => ({ label, entries: [] })) };
    savePlan(p);
    setCurrentId(p.id);
  };

  const duplicate = () => {
    if (!plan) return;
    if (plans.length >= FREE_PLAN_LIMIT) {
      toast(`You can keep up to ${FREE_PLAN_LIMIT} saved plans. Delete one to duplicate this.`);
      return;
    }
    const p: MealPlan = {
      ...plan,
      id: newId("plan"),
      name: `${plan.name} (copy)`,
      createdAt: new Date().toISOString(),
      days: plan.days.map((d) => ({ ...d, entries: d.entries.map((e) => ({ ...e, id: newId(), prepared: false })) })),
    };
    savePlan(p);
    setCurrentId(p.id);
    toast("Plan duplicated — reuse it as a template");
  };

  const remove = () => {
    if (!plan || !window.confirm(`Delete “${plan.name}”? This can't be undone.`)) return;
    const rest = plans.filter((p) => p.id !== plan.id);
    setPlans(rest);
    setCurrentId(rest[0]?.id ?? null);
  };

  const toShoppingList = () => {
    if (!plan) return;
    const reqs = plan.days.flatMap((d) => d.entries.filter((e) => e.recipeSlug && !e.prepared).map((e) => ({ recipe: getRecipe(e.recipeSlug!)!, servings: e.servings })));
    if (reqs.length === 0) {
      toast("Add some recipes first");
      return;
    }
    // Replace recipe-derived lines with this plan's, keeping check marks, prices and manual items.
    setShopping(mergeShoppingLists(shopping, buildShoppingList(reqs)));
    track("shopping_list_created");
    router.push("/shopping-list");
  };

  const stats = useMemo(() => {
    if (!plan) return null;
    const entries = plan.days.flatMap((d) => d.entries);
    const slugs = entries.map((e) => e.recipeSlug).filter(Boolean) as string[];
    const unique = new Set(slugs);
    const prepared = entries.filter((e) => e.prepared).length;
    const cookMin = [...unique].reduce((s, slug) => s + (metaCache.get(slug)?.totalMin ?? 0), 0);
    const ingredientCounts = new Map<string, number>();
    for (const slug of unique) for (const id of new Set(metaCache.get(slug)?.ingredientIds)) ingredientCounts.set(id, (ingredientCounts.get(id) ?? 0) + 1);
    const reused = [...ingredientCounts.entries()].filter(([id, c]) => c > 1 && !["water", "salt", "veg-oil", "olive-oil"].includes(id)).length;
    const days = plan.days.map((d) => dayNutritionPerPerson(d, recipes));
    const avg = days.filter((d) => d.counted > 0);
    const avgKcal = avg.length ? avg.reduce((s, d) => s + d.nutrients.kcal, 0) / avg.length : 0;
    const avgFibre = avg.length ? avg.reduce((s, d) => s + d.nutrients.fiber, 0) / avg.length : 0;
    return { total: entries.length, prepared, unique: unique.size, cookMin, reused, days, avgKcal, avgFibre };
  }, [plan]);

  const ideas = useMemo(() => (plan ? batchCookingIdeas(plan.days, recipes) : []), [plan]);

  if (!hydrated) return <div className="card" aria-busy="true" style={{ minHeight: 400 }} />;

  return (
    <div className="planner-layout">
      <aside className="card no-print" aria-label="Meal plan preferences">
        <PrefsForm prefs={mergedPrefs} setPrefs={setPrefs} onGenerate={generate} hasPlan={Boolean(plan)} />
      </aside>

      <div>
        {plans.length > 0 && (
          <div className="card no-print" style={{ marginBottom: 16 }}>
            <div className="spread">
              <div className="field" style={{ margin: 0, flex: "1 1 220px" }}>
                <label htmlFor="plan-select">Saved plans ({plans.length}/{FREE_PLAN_LIMIT})</label>
                <select id="plan-select" className="select" value={currentId ?? ""} onChange={(e) => setCurrentId(e.target.value)}>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="row">
                <button type="button" className="btn btn-ghost btn-sm" onClick={newBlankPlan}>
                  New blank plan
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={duplicate} disabled={!plan}>
                  Duplicate
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={remove} disabled={!plan}>
                  Delete
                </button>
              </div>
            </div>
            <p className="xs muted" style={{ margin: "8px 0 0" }}>
              Plans are saved on this device. The free plan keeps up to {FREE_PLAN_LIMIT}. <Link href="/pricing">See Premium plans</Link>.
            </p>
          </div>
        )}

        {!plan ? (
          <div className="empty-state">
            <Icon name="calendar" size={40} className="muted" />
            <h2 style={{ marginTop: 12 }}>Your week, planned in seconds</h2>
            <p className="muted" style={{ maxWidth: "52ch", margin: "0 auto 20px" }}>
              Tell us who you&apos;re cooking for and what you like. We&apos;ll build seven days of breakfasts, lunches and dinners that reuse ingredients, respect your budget and time, and turn into one
              tidy shopping list.
            </p>
            <button type="button" className="btn btn-primary" onClick={generate}>
              Build my meal plan
            </button>
          </div>
        ) : (
          <>
            <div className="spread" style={{ marginBottom: 16 }}>
              <div style={{ flex: "1 1 260px" }}>
                <label htmlFor="plan-name" className="sr-only">
                  Plan name
                </label>
                <input id="plan-name" className="input serif" style={{ fontSize: "1.5rem", border: "1px solid transparent", background: "transparent", padding: "4px 0" }} value={plan.name} onChange={(e) => savePlan({ ...plan, name: e.target.value.slice(0, 60) })} />
              </div>
              <div className="row no-print">
                <button type="button" className="btn btn-primary btn-sm" onClick={toShoppingList}>
                  <Icon name="cart" size={16} /> Make shopping list
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
                  <Icon name="print" size={16} /> Print plan
                </button>
              </div>
            </div>

            {notes.length > 0 && (
              <div className="callout callout-info" style={{ marginBottom: 16 }} role="status">
                <span className="callout-title">About this plan</span>
                <ul style={{ marginBottom: 0 }}>
                  {notes.map((n) => (
                    <li key={n} className="small">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stats && (
              <div className="kpi" style={{ marginBottom: 16 }}>
                <div className="card">
                  <strong>{stats.unique}</strong>
                  <span className="xs muted">different recipes</span>
                </div>
                <div className="card">
                  <strong>{stats.reused}</strong>
                  <span className="xs muted">ingredients reused across meals</span>
                </div>
                <div className="card">
                  <strong>
                    {stats.prepared}/{stats.total}
                  </strong>
                  <span className="xs muted">meals prepared</span>
                </div>
                <div className="card">
                  <strong>≈ {roundNutrient("kcal", stats.avgKcal)}</strong>
                  <span className="xs muted">kcal per person per day (estimate)</span>
                </div>
              </div>
            )}

            <div className="plan-days">
              {plan.days.map((day, di) => {
                const n = stats?.days[di];
                return (
                  <section key={day.label} className="plan-day" aria-labelledby={`day-${di}`}>
                    <header>
                      <h3 id={`day-${di}`}>{day.label}</h3>
                      {n && n.counted > 0 && (
                        <span className="xs muted">
                          Per person ≈ {roundNutrient("kcal", n.nutrients.kcal)} kcal · {roundNutrient("protein", n.nutrients.protein)} g protein · {roundNutrient("fiber", n.nutrients.fiber)} g fibre
                        </span>
                      )}
                    </header>
                    {day.entries.length === 0 && <p className="small muted" style={{ padding: "12px 20px", margin: 0 }}>Nothing planned yet.</p>}
                    {day.entries.map((e) => (
                      <EntryRow
                        key={e.id}
                        entry={e}
                        dayIndex={di}
                        plan={plan}
                        setDays={setDays}
                        update={(next) => setDays(plan.days.map((d, i) => (i === di ? { ...d, entries: d.entries.map((x) => (x.id === next.id ? next : x)) } : d)))}
                      />
                    ))}
                    <AddMeal dayIndex={di} plan={plan} setDays={setDays} />
                  </section>
                );
              })}
            </div>

            <p className="xs muted" style={{ marginTop: 12 }}>
              Daily figures assume one serving of each planned recipe per person and exclude drinks and extras. Energy needs vary widely between people; these numbers are for orientation, not targets.
            </p>

            {ideas.length > 0 && (
              <section className="card" style={{ marginTop: 24 }} aria-labelledby="batch-heading">
                <h2 id="batch-heading" style={{ fontSize: "var(--fs-xl)" }}>
                  Batch-cooking ideas
                </h2>
                <ul>
                  {ideas.map((i) => (
                    <li key={i.title}>
                      <strong>{i.title}.</strong> <span className="small">{i.detail}</span>
                    </li>
                  ))}
                </ul>
                <p className="xs muted" style={{ marginBottom: 0 }}>
                  Cool cooked food within 2 hours and refrigerate. See <Link href="/fitness/meal-prep-basics">meal prep basics</Link>.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
