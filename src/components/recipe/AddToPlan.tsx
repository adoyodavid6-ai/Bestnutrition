"use client";

import { useState } from "react";
import Link from "next/link";
import { KEYS, useStored } from "@/lib/storage";
import { DAY_LABELS, DEFAULT_PREFS, SLOT_CATEGORIES, SLOT_LABELS, newId, type MealPlan, type Slot } from "@/lib/planner";
import type { Recipe } from "@/lib/types";
import { toast } from "../Toaster";
import { Icon } from "../Icon";

function emptyPlan(): MealPlan {
  return {
    id: newId("plan"),
    name: "My week",
    createdAt: new Date().toISOString(),
    prefs: DEFAULT_PREFS,
    days: DAY_LABELS.map((label) => ({ label, entries: [] })),
  };
}

export function AddToPlan({ recipe }: { recipe: Recipe }) {
  const [plans, setPlans] = useStored<MealPlan[]>(KEYS.plans, []);
  const [currentId, setCurrentId] = useStored<string | null>(KEYS.currentPlan, null);
  const [open, setOpen] = useState(false);
  const defaultSlot = (Object.keys(SLOT_CATEGORIES) as Slot[]).find((s) => recipe.categories.some((c) => SLOT_CATEGORIES[s].includes(c))) ?? "dinner";
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<Slot>(defaultSlot);

  const add = () => {
    let plan = plans.find((p) => p.id === currentId);
    let list = plans;
    if (!plan) {
      plan = emptyPlan();
      list = [...plans, plan];
      setCurrentId(plan.id);
    }
    const updated: MealPlan = {
      ...plan,
      days: plan.days.map((d, i) => {
        if (i !== day) return d;
        const entries = d.entries.filter((e) => e.slot !== slot);
        return { ...d, entries: [...entries, { id: newId(), slot, recipeSlug: recipe.slug, servings: plan!.prefs.household || recipe.servings, prepared: false }] };
      }),
    };
    setPlans(list.map((p) => (p.id === updated.id ? updated : p)));
    toast(`Added to ${DAY_LABELS[day]} ${SLOT_LABELS[slot].toLowerCase()}`);
    setOpen(false);
  };

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Icon name="calendar" size={16} /> Add to meal plan
      </button>
      {open && (
        <div className="card" style={{ marginTop: 10, maxWidth: 380 }}>
          <div className="field">
            <label htmlFor="atp-day">Day</label>
            <select id="atp-day" className="select" value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAY_LABELS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="atp-slot">Meal</label>
            <select id="atp-slot" className="select" value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
              {(Object.keys(SLOT_LABELS) as Slot[]).map((s) => (
                <option key={s} value={s}>
                  {SLOT_LABELS[s]}
                </option>
              ))}
            </select>
            <span className="hint">This replaces any meal already in that slot.</span>
          </div>
          <div className="row">
            <button type="button" className="btn btn-primary btn-sm" onClick={add}>
              Add
            </button>
            <Link href="/meal-planner" className="link-arrow small">
              Open planner
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
