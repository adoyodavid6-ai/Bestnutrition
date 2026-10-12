"use client";

import Link from "next/link";
import { KEYS, useStored } from "@/lib/storage";
import { DAY_LABELS, SLOT_LABELS, type MealPlan } from "@/lib/planner";
import type { ShoppingItem } from "@/lib/shopping";
import type { RecentItem } from "./RecentTracker";
import { Icon } from "./Icon";

export interface DashboardRecipe {
  slug: string;
  title: string;
  cuisine: string;
  totalMin: number;
}

export function Dashboard({ recipes, thumbs, articleTitles }: { recipes: DashboardRecipe[]; thumbs: Record<string, React.ReactNode>; articleTitles: Record<string, string> }) {
  const [plans, , hydrated] = useStored<MealPlan[]>(KEYS.plans, []);
  const [currentId] = useStored<string | null>(KEYS.currentPlan, null);
  const [shopping] = useStored<ShoppingItem[]>(KEYS.shopping, []);
  const [savedRecipes, setSavedRecipes] = useStored<string[]>(KEYS.savedRecipes, []);
  const [savedArticles, setSavedArticles] = useStored<string[]>(KEYS.savedArticles, []);
  const [recent] = useStored<RecentItem[]>(KEYS.recent, []);

  if (!hydrated) return <div className="card" aria-busy="true" style={{ minHeight: 300 }} />;

  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const plan = plans.find((p) => p.id === currentId);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const today = plan?.days[todayIndex];
  const done = shopping.filter((i) => i.checked).length;
  const totalEntries = plan?.days.reduce((s, d) => s + d.entries.length, 0) ?? 0;
  const prepared = plan?.days.reduce((s, d) => s + d.entries.filter((e) => e.prepared).length, 0) ?? 0;

  const actions: { href: string; label: string }[] = [];
  if (!plan) actions.push({ href: "/meal-planner", label: "Build your first weekly meal plan" });
  else if (shopping.length === 0) actions.push({ href: "/meal-planner", label: "Turn your plan into a shopping list" });
  if (shopping.length > 0 && done < shopping.length) actions.push({ href: "/shopping-list", label: `Finish your shopping list (${shopping.length - done} items left)` });
  if (savedRecipes.length === 0) actions.push({ href: "/recipes", label: "Save a few recipes you'd like to try" });
  actions.push({ href: "/account", label: "Set your units, region and preferences" });

  return (
    <div className="stack" style={{ display: "grid", gap: 24 }}>
      <div className="callout callout-info">
        <span className="callout-title">Stored on this device</span>
        <p className="small">
          Your dashboard, plans and lists live in this browser only. They won&apos;t appear on other devices and are removed if you clear your browser data. You can export or delete them any time from{" "}
          <Link href="/account">your account settings</Link>.
        </p>
      </div>

      <div className="grid grid-2">
        <section className="card" aria-labelledby="today-h">
          <div className="spread">
            <h2 id="today-h" style={{ fontSize: "var(--fs-xl)", margin: 0 }}>
              Today · {DAY_LABELS[todayIndex]}
            </h2>
            <Link href="/meal-planner" className="link-arrow small">
              Planner
            </Link>
          </div>
          {!plan ? (
            <p className="muted" style={{ marginTop: 12 }}>
              No meal plan yet. <Link href="/meal-planner">Build one in a minute</Link>.
            </p>
          ) : today && today.entries.length ? (
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
              {today.entries.map((e) => {
                const r = e.recipeSlug ? bySlug.get(e.recipeSlug) : undefined;
                return (
                  <li key={e.id} className="spread" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", margin: 0 }}>
                    <span>
                      <span className="eyebrow" style={{ margin: 0, display: "block" }}>
                        {SLOT_LABELS[e.slot]}
                      </span>
                      {r ? <Link href={`/recipes/${r.slug}`}>{r.title}</Link> : e.customTitle}
                    </span>
                    {e.prepared && <span className="chip chip-success">Prepared</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Nothing planned for today.</p>
          )}
          {plan && (
            <p className="xs muted" style={{ marginBottom: 0 }}>
              {plan.name}: {prepared} of {totalEntries} meals prepared this week.
            </p>
          )}
        </section>

        <section className="card" aria-labelledby="shop-h">
          <div className="spread">
            <h2 id="shop-h" style={{ fontSize: "var(--fs-xl)", margin: 0 }}>
              Shopping list
            </h2>
            <Link href="/shopping-list" className="link-arrow small">
              Open
            </Link>
          </div>
          {shopping.length === 0 ? (
            <p className="muted" style={{ marginTop: 12 }}>
              Your list is empty.
            </p>
          ) : (
            <>
              <p style={{ marginTop: 12 }}>
                <strong>{done}</strong> of {shopping.length} items ticked off
              </p>
              <div className="progress" role="progressbar" aria-valuenow={Math.round((done / shopping.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Shopping progress">
                <span style={{ width: `${(done / shopping.length) * 100}%` }} />
              </div>
            </>
          )}
        </section>
      </div>

      <section className="card" aria-labelledby="next-h">
        <h2 id="next-h" style={{ fontSize: "var(--fs-xl)" }}>
          Suggested next steps
        </h2>
        <ul className="check-list" style={{ marginBottom: 0 }}>
          {actions.map((a) => (
            <li key={a.label}>
              <Link href={a.href}>{a.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="saved" aria-labelledby="saved-h">
        <h2 id="saved-h">Saved recipes</h2>
        {savedRecipes.length === 0 ? (
          <p className="muted">
            Tap <Icon name="heart" size={14} /> Save on any recipe to keep it here.
          </p>
        ) : (
          <div className="grid grid-4">
            {savedRecipes
              .filter((s) => bySlug.has(s))
              .map((s) => (
                <div key={s} style={{ position: "relative" }}>
                  {thumbs[s]}
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    style={{ position: "absolute", top: 10, right: 10 }}
                    onClick={() => setSavedRecipes((all) => all.filter((x) => x !== s))}
                    aria-label={`Remove ${bySlug.get(s)!.title} from saved`}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>

      <section aria-labelledby="saved-a-h">
        <h2 id="saved-a-h" style={{ fontSize: "var(--fs-xl)" }}>
          Saved guides
        </h2>
        {savedArticles.length === 0 ? (
          <p className="muted">Save nutrition, health and fitness guides to find them here.</p>
        ) : (
          <ul>
            {savedArticles.map((href) => (
              <li key={href}>
                <Link href={href}>{articleTitles[href] ?? href}</Link>{" "}
                <button type="button" className="btn btn-sm btn-ghost" style={{ minHeight: 28, padding: "2px 10px" }} onClick={() => setSavedArticles((all) => all.filter((x) => x !== href))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-h">
        <h2 id="recent-h" style={{ fontSize: "var(--fs-xl)" }}>
          Recently viewed
        </h2>
        {recent.length === 0 ? (
          <p className="muted">Recipes and guides you open will appear here.</p>
        ) : (
          <ul>
            {recent.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>{r.title}</Link> <span className="xs muted">· {r.kind}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
