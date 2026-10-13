"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { newId, SLOT_LABELS, type MealPlan, type Slot } from "@/lib/planner";
import { KEYS, useStored } from "@/lib/storage";
import { Icon } from "../Icon";
import { toast } from "../Toaster";
import { usePlan } from "../billing/usePlan";

export interface StarterPlan {
  id: "american" | "british" | "asian";
  label: string;
  blurb: string;
  plan: MealPlan;
  days: { label: string; meals: { slot: Slot; slug: string; title: string; minutes: number; kcal: number; cuisine: string }[] }[];
  shopping: { label: string; items: string[] }[];
  itemCount: number;
}

export function StarterPlans({ plans }: { plans: StarterPlan[] }) {
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useStored<MealPlan[]>(KEYS.plans, []);
  const [, setCurrent] = useStored<string | null>(KEYS.currentPlan, null);
  const { info } = usePlan();
  const router = useRouter();
  const p = plans[active];

  useEffect(() => {
    track("lead_magnet_view", { kitchen: plans[0].id });
  }, [plans]);

  const useThisPlan = () => {
    if (saved.length >= info.limits.savedPlans) {
      toast(`You already have ${saved.length} saved plans. Delete one in the planner to add this one.`);
      router.push("/meal-planner");
      return;
    }
    const copy: MealPlan = { ...p.plan, id: newId("plan"), createdAt: new Date().toISOString(), days: p.plan.days.map((d) => ({ ...d, entries: d.entries.map((e) => ({ ...e, id: newId() })) })) };
    setSaved((all) => [...all, copy]);
    setCurrent(copy.id);
    track("meal_plan_created", { source: "free-meal-plan" });
    router.push("/meal-planner");
  };

  return (
    <div>
      <div className="seg no-print" role="tablist" aria-label="Choose a kitchen" style={{ marginBottom: 16 }}>
        {plans.map((x, i) => (
          <button key={x.id} type="button" role="tab" id={`tab-${x.id}`} aria-controls="starter-panel" aria-selected={i === active} onClick={() => setActive(i)}>
            {x.label}
          </button>
        ))}
      </div>

      <section id="starter-panel" role="tabpanel" aria-labelledby={`tab-${p.id}`}>
        <div className="spread" style={{ marginBottom: 16, alignItems: "flex-end" }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Your starter week · {p.label}</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {p.blurb}
            </p>
          </div>
          <div className="row no-print">
            <button type="button" className="btn btn-primary btn-sm" onClick={useThisPlan}>
              <Icon name="calendar" size={16} /> Make it mine in the planner
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Icon name="print" size={16} /> Print
            </button>
          </div>
        </div>

        <div className="starter-week">
          {p.days.map((d) => (
            <div key={d.label} className="card starter-day">
              <h3>{d.label}</h3>
              <ul>
                {d.meals.map((m) => (
                  <li key={m.slot}>
                    <span className="xs muted">{SLOT_LABELS[m.slot]}</span>
                    <Link href={`/recipes/${m.slug}`}>{m.title}</Link>
                    <span className="xs muted">
                      {m.minutes} min · ≈{m.kcal} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="card" style={{ marginTop: 24 }} aria-labelledby="starter-shop-h">
          <h2 id="starter-shop-h" style={{ fontSize: "var(--fs-xl)" }}>
            Shopping list · {p.itemCount} items
          </h2>
          <div className="due-groups">
            {p.shopping.map((g) => (
              <div key={g.label}>
                <h3 className="due-group-h">{g.label}</h3>
                <ul className="starter-list">
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="cta-band no-print" style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Want it tailored to you?</h2>
          <p style={{ marginBottom: 16 }}>The free meal planner adjusts for your household, budget, time, diet and allergies — then builds the shopping list and reminds you on shopping day.</p>
          <div className="row">
            <Link href="/meal-planner" className="btn btn-light">
              Build my own plan
            </Link>
            <Link href="/shopping-calendar" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,.5)" }}>
              Set a shopping day
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
