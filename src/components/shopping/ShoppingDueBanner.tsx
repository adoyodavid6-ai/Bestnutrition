"use client";

import Link from "next/link";
import { KEYS, useStored } from "@/lib/storage";
import { markDone, shouldShowReminder } from "@/lib/shopping-schedule";
import { groupByCategory, type ShoppingItem } from "@/lib/shopping";
import { formatBaseQuantity } from "@/lib/units";
import { useUserPrefs } from "@/lib/user-prefs";
import { Icon } from "../Icon";
import { toast } from "../Toaster";
import { formatDay, useShoppingSchedule } from "./useShoppingSchedule";

const PREVIEW_LIMIT = 12;

/**
 * Homepage reminder: when a scheduled shopping day arrives (or its lead time opens),
 * the shopping list appears at the top of the homepage until the user marks it done.
 */
export function ShoppingDueBanner() {
  const { schedule, setSchedule, hydrated, today } = useShoppingSchedule();
  const [items, setItems] = useStored<ShoppingItem[]>(KEYS.shopping, []);
  const { prefs } = useUserPrefs();

  if (!hydrated) return null;
  const due = shouldShowReminder(schedule, today);
  if (!due) return null;

  const done = items.filter((i) => i.checked).length;
  const remaining = items.filter((i) => !i.checked);
  // Stable order, so ticking an item crosses it out in place rather than making it jump away.
  const shown = items.slice(0, PREVIEW_LIMIT);
  const heading =
    due.status === "today"
      ? "Today is shopping day"
      : due.status === "upcoming"
        ? `Shopping day is ${due.daysAway === 1 ? "tomorrow" : formatDay(due.day, { weekday: "long" })}`
        : `Shopping from ${formatDay(due.day, { weekday: "long", day: "numeric", month: "short" })} is still to do`;

  const finish = () => {
    setSchedule(markDone(schedule, due.day));
    setItems((all) => all.filter((i) => !i.checked));
    toast("Shopping done — ticked items cleared. See you next time!");
  };

  return (
    <section className="due-banner" aria-labelledby="due-h">
      <div className="container">
        <div className="due-card">
          <div className="spread" style={{ alignItems: "flex-start" }}>
            <div>
              <span className="eyebrow" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="cart" size={14} /> Shopping calendar · {formatDay(due.day, { weekday: "short", day: "numeric", month: "short" })}
              </span>
              <h2 id="due-h" style={{ margin: 0 }}>
                {heading}
              </h2>
              {items.length > 0 && (
                <p className="small muted" style={{ margin: "6px 0 0" }}>
                  {done} of {items.length} items in your basket
                </p>
              )}
            </div>
            <div className="row">
              <Link href="/shopping-list" className="btn btn-primary btn-sm">
                Open full list
              </Link>
              <button type="button" className="btn btn-secondary btn-sm" onClick={finish}>
                <Icon name="check" size={16} /> Done shopping
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSchedule({ ...schedule, hiddenOn: today })}>
                Hide for today
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="small" style={{ margin: "16px 0 0" }}>
              Your shopping list is empty. <Link href="/meal-planner">Make one from your meal plan</Link> or <Link href="/recipes">add ingredients from a recipe</Link>.
            </p>
          ) : remaining.length === 0 ? (
            <p className="small" style={{ margin: "16px 0 0" }}>
              Everything&apos;s ticked off. Tap <strong>Done shopping</strong> to finish this trip.
            </p>
          ) : (
            <>
              <div className="due-groups">
                {groupByCategory(shown).map((g) => (
                  <div key={g.category}>
                    <h3 className="due-group-h">{g.label}</h3>
                    <ul>
                      {g.items.map((i) => (
                        <li key={i.key}>
                          <label className="checkbox">
                            <input type="checkbox" checked={i.checked} onChange={() => setItems((all) => all.map((x) => (x.key === i.key ? { ...x, checked: !x.checked } : x)))} />
                            <span className={i.checked ? "is-ticked" : undefined}>
                              <strong>{formatBaseQuantity(i.qty, i.unit, prefs.units)}</strong> {i.name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {items.length > PREVIEW_LIMIT && (
                <p className="small" style={{ margin: "12px 0 0" }}>
                  <Link href="/shopping-list">+ {items.length - PREVIEW_LIMIT} more items on your full list</Link>
                </p>
              )}
            </>
          )}
          <p className="xs muted" style={{ margin: "12px 0 0" }}>
            <Link href="/shopping-calendar">Change your shopping schedule</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
