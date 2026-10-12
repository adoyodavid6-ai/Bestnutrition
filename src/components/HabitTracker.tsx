"use client";

import { useState } from "react";
import { useStored } from "@/lib/storage";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUGGESTED = ["Walk 20 minutes", "Vegetables at lunch", "Water with every meal", "Lights out by 11pm", "Cook at home", "5-minute stretch"];

interface HabitState {
  week: string;
  habits: { name: string; done: boolean[] }[];
}

function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  return date.toISOString().slice(0, 10);
}

export function HabitTracker() {
  const [state, setState, hydrated] = useStored<HabitState>("habits", { week: weekKey(), habits: [] });
  const [draft, setDraft] = useState("");
  const current = state.week === weekKey() ? state : { week: weekKey(), habits: state.habits.map((h) => ({ ...h, done: Array(7).fill(false) })) };

  const save = (habits: HabitState["habits"]) => setState({ week: weekKey(), habits });
  const add = (name: string) => {
    const n = name.trim();
    if (!n || current.habits.length >= 3 || current.habits.some((h) => h.name === n)) return;
    save([...current.habits, { name: n, done: Array(7).fill(false) }]);
    setDraft("");
  };

  if (!hydrated) return <div className="card" aria-busy="true" style={{ minHeight: 200 }} />;

  return (
    <div className="card">
      {current.habits.length === 0 && <p className="muted small">No habits yet. Choose a suggestion or write your own.</p>}
      {current.habits.map((h, hi) => (
        <div key={h.name} style={{ marginBottom: 16 }}>
          <div className="spread">
            <strong className="small">{h.name}</strong>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => save(current.habits.filter((_, i) => i !== hi))} aria-label={`Remove habit ${h.name}`}>
              Remove
            </button>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            {DAYS.map((d, di) => (
              <label key={d} className="checkbox xs" style={{ flexDirection: "column", alignItems: "center", gap: 2 }}>
                <input
                  type="checkbox"
                  checked={h.done[di]}
                  onChange={() => save(current.habits.map((x, i) => (i === hi ? { ...x, done: x.done.map((v, j) => (j === di ? !v : v)) } : x)))}
                  aria-label={`${h.name} — ${d}`}
                />
                <span aria-hidden="true">{d}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {current.habits.length < 3 && (
        <>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              add(draft);
            }}
          >
            <label htmlFor="habit-new" className="sr-only">
              New habit
            </label>
            <input id="habit-new" className="input" style={{ flex: 1 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a habit" maxLength={60} />
            <button className="btn btn-primary btn-sm" type="submit">
              Add
            </button>
          </form>
          <div className="chip-row" style={{ marginTop: 12 }}>
            {SUGGESTED.filter((s) => !current.habits.some((h) => h.name === s)).map((s) => (
              <button key={s} type="button" className="filter-chip" onClick={() => add(s)}>
                + {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
