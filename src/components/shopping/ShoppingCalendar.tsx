"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FREQUENCY_LABELS,
  addDays,
  dueOccurrence,
  isValidDay,
  lastOccurrence,
  markDone,
  nextOccurrence,
  occurrencesBetween,
  toICS,
  totalOccurrences,
  type FrequencyWeeks,
  type LeadDays,
  type ShoppingSchedule,
} from "@/lib/shopping-schedule";
import { Icon } from "../Icon";
import { toast } from "../Toaster";
import { formatDay, useShoppingSchedule } from "./useShoppingSchedule";

type EndChoice = "never" | "after" | "until";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function describe(s: ShoppingSchedule) {
  const weekday = formatDay(s.startDate, { weekday: "long" });
  const every = s.frequencyWeeks === 1 ? `Every ${weekday}` : `Every ${s.frequencyWeeks} weeks on ${weekday}s`;
  const from = `starting ${formatDay(s.startDate, { day: "numeric", month: "long", year: "numeric" })}`;
  const total = totalOccurrences(s);
  const last = lastOccurrence(s);
  if (total === null) return `${every}, ${from}, with no end date.`;
  if (!total || !last) return `${every}, ${from}. The end date is before the first trip, so no trips are scheduled.`;
  return `${every}, ${from}: ${total} ${total === 1 ? "trip" : "trips"}, the last on ${formatDay(last, { day: "numeric", month: "long", year: "numeric" })}.`;
}

function MonthGrid({ schedule, today }: { schedule: ShoppingSchedule; today: string }) {
  const [month, setMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const first = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday-first offset
  const last = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  const shopDays = new Set(schedule.enabled ? occurrencesBetween(schedule, first, last) : []);
  const due = dueOccurrence(schedule, today);
  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setMonth(d.toISOString().slice(0, 7));
  };
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);

  return (
    <div className="card">
      <div className="spread" style={{ marginBottom: 12 }}>
        <h2 id="cal-month" style={{ fontSize: "var(--fs-xl)", margin: 0 }} aria-live="polite">
          {formatDay(first, { month: "long", year: "numeric" })}
        </h2>
        <div className="row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => shift(-1)} aria-label="Previous month">
            ←
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMonth(today.slice(0, 7))}>
            Today
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => shift(1)} aria-label="Next month">
            →
          </button>
        </div>
      </div>
      <table className="cal-grid" aria-labelledby="cal-month">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((day, i) => {
                if (!day) return <td key={i} className="cal-empty" />;
                const isShop = shopDays.has(day);
                const done = schedule.completed.includes(day);
                const isDue = due?.day === day;
                const label = [formatDay(day, { weekday: "long", day: "numeric", month: "long" }), isShop ? (done ? "shopping done" : isDue ? "shopping due" : "shopping day") : "", day === today ? "today" : ""]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <td key={day} className={`cal-day${day === today ? " is-today" : ""}${isShop ? " is-shop" : ""}${done ? " is-done" : ""}${isDue ? " is-due" : ""}`} aria-label={label}>
                    <span className="cal-num" aria-hidden="true">
                      {Number(day.slice(8))}
                    </span>
                    {isShop && (
                      <span className="cal-tag" aria-hidden="true">
                        {done ? "✓ Done" : "Shop"}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row xs muted" style={{ marginTop: 12, gap: 16 }}>
        <span className="row" style={{ gap: 6 }}>
          <span className="cal-key is-shop" /> Shopping day
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="cal-key is-due" /> Due now
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="cal-key is-done" /> Done
        </span>
        <span className="row" style={{ gap: 6 }}>
          <span className="cal-key is-today" /> Today
        </span>
      </div>
    </div>
  );
}

export function ShoppingCalendar() {
  const { schedule, setSchedule, hydrated, today, isSet } = useShoppingSchedule();
  const [draft, setDraft] = useState<ShoppingSchedule>(schedule);
  const [endChoice, setEndChoice] = useState<EndChoice>("never");
  const [trips, setTrips] = useState(8);
  const [untilDate, setUntilDate] = useState(addDays(today, 91));
  const [error, setError] = useState<string | null>(null);

  // Load the saved schedule into the form once storage is available.
  useEffect(() => {
    if (!hydrated) return;
    setDraft(schedule);
    setEndChoice(schedule.end.type);
    if (schedule.end.type === "after") setTrips(schedule.end.occurrences);
    if (schedule.end.type === "until") setUntilDate(schedule.end.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isSet]);

  const preview: ShoppingSchedule = useMemo(
    () => ({ ...draft, enabled: true, end: endChoice === "after" ? { type: "after", occurrences: trips } : endChoice === "until" ? { type: "until", date: untilDate } : { type: "never" } }),
    [draft, endChoice, trips, untilDate],
  );

  if (!hydrated) return <div className="card" aria-busy="true" style={{ minHeight: 320 }} />;

  const save = (enabled: boolean) => {
    if (!isValidDay(preview.startDate)) return setError("Choose a valid first shopping day.");
    if (endChoice === "after" && (!Number.isInteger(trips) || trips < 1 || trips > 260)) return setError("Choose between 1 and 260 shopping trips.");
    if (endChoice === "until" && (!isValidDay(untilDate) || untilDate < preview.startDate)) return setError("The end date must be on or after the first shopping day.");
    setError(null);
    // Changing the pattern resets completion history, which belonged to the old dates.
    const patternChanged = preview.startDate !== schedule.startDate || preview.frequencyWeeks !== schedule.frequencyWeeks;
    setSchedule({ ...preview, enabled, completed: patternChanged ? [] : schedule.completed, hiddenOn: undefined });
    toast(enabled ? "Shopping calendar saved" : "Shopping reminders turned off");
  };

  const downloadIcs = () => {
    const blob = new Blob([toICS(schedule)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nourishwell-shopping.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const due = dueOccurrence(schedule, today);
  const upcoming = schedule.enabled ? occurrencesBetween(schedule, today, addDays(today, 7 * 4 * 6)).slice(0, 6) : [];
  const next = schedule.enabled ? nextOccurrence(schedule, today) : null;

  return (
    <div className="shop-cal-layout">
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          save(true);
        }}
        aria-labelledby="sched-h"
        noValidate
      >
        <h2 id="sched-h" style={{ fontSize: "var(--fs-xl)" }}>
          Your shopping schedule
        </h2>
        <p className="small muted">On shopping day your list appears at the top of the homepage, and it stays there until you mark the shopping done.</p>

        <div className="field">
          <label htmlFor="sc-start">First shopping day</label>
          <input id="sc-start" type="date" className="input" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} required />
        </div>

        <fieldset>
          <legend className="small">How often</legend>
          <div className="chip-row" role="group" aria-label="How often">
            {([1, 2, 3, 4] as FrequencyWeeks[]).map((w) => (
              <button key={w} type="button" className="filter-chip" aria-pressed={draft.frequencyWeeks === w} onClick={() => setDraft({ ...draft, frequencyWeeks: w })}>
                {FREQUENCY_LABELS[w]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="small">How long it repeats</legend>
          <label className="checkbox">
            <input type="radio" name="sc-end" checked={endChoice === "never"} onChange={() => setEndChoice("never")} /> Keep repeating until I turn it off
          </label>
          <label className="checkbox" style={{ marginTop: 10, alignItems: "center" }}>
            <input type="radio" name="sc-end" checked={endChoice === "after"} onChange={() => setEndChoice("after")} />
            <span className="row" style={{ gap: 8 }}>
              Stop after
              <input
                type="number"
                min={1}
                max={260}
                className="input"
                style={{ width: 84, minHeight: 36 }}
                aria-label="Number of shopping trips"
                value={trips}
                onFocus={() => setEndChoice("after")}
                onChange={(e) => setTrips(Math.round(Number(e.target.value)))}
              />
              shopping trips
            </span>
          </label>
          <label className="checkbox" style={{ marginTop: 10, alignItems: "center" }}>
            <input type="radio" name="sc-end" checked={endChoice === "until"} onChange={() => setEndChoice("until")} />
            <span className="row" style={{ gap: 8 }}>
              Stop on
              <input type="date" className="input" style={{ width: "auto", minHeight: 36 }} aria-label="Last possible shopping day" value={untilDate} onFocus={() => setEndChoice("until")} onChange={(e) => setUntilDate(e.target.value)} />
            </span>
          </label>
        </fieldset>

        <div className="field">
          <label htmlFor="sc-lead">Show my list on the homepage</label>
          <select id="sc-lead" className="select" value={draft.leadDays} onChange={(e) => setDraft({ ...draft, leadDays: Number(e.target.value) as LeadDays })}>
            <option value={0}>On shopping day</option>
            <option value={1}>1 day before</option>
            <option value={2}>2 days before</option>
          </select>
        </div>

        {isValidDay(preview.startDate) && (
          <p className="callout callout-info small" role="status">
            {describe(preview)}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="row" style={{ marginTop: 12 }}>
          <button type="submit" className="btn btn-primary">
            {schedule.enabled ? "Update schedule" : "Turn on shopping calendar"}
          </button>
          {schedule.enabled && (
            <button type="button" className="btn btn-ghost" onClick={() => save(false)}>
              Turn off
            </button>
          )}
        </div>
      </form>

      <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <MonthGrid schedule={schedule} today={today} />

        <section className="card" aria-labelledby="up-h">
          <h2 id="up-h" style={{ fontSize: "var(--fs-xl)" }}>
            Upcoming shopping trips
          </h2>
          {!schedule.enabled ? (
            <p className="muted small" style={{ marginBottom: 0 }}>
              Turn on the shopping calendar to see your trips here.
            </p>
          ) : (
            <>
              {due && due.status !== "upcoming" && (
                <div className="callout callout-warning small" style={{ marginBottom: 12 }}>
                  <strong>{due.status === "today" ? "Today is shopping day." : `Shopping from ${formatDay(due.day)} is still to do.`}</strong>{" "}
                  <Link href="/shopping-list">Open your list</Link> or{" "}
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setSchedule(markDone(schedule, due.day));
                      toast("Marked as done");
                    }}
                  >
                    mark it done
                  </button>
                </div>
              )}
              {upcoming.length === 0 ? (
                <p className="muted small">No more trips are scheduled. {next === null && "Your schedule has finished — update it to keep going."}</p>
              ) : (
                <ol className="shop-trips">
                  {upcoming.map((d) => (
                    <li key={d}>
                      <span>{formatDay(d, { weekday: "long", day: "numeric", month: "long" })}</span>
                      <span className="xs muted">{d === today ? "Today" : schedule.completed.includes(d) ? "Done" : `in ${Math.round((Date.parse(d) - Date.parse(today)) / 86_400_000)} days`}</span>
                    </li>
                  ))}
                </ol>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={downloadIcs}>
                <Icon name="calendar" size={16} /> Add to my calendar (.ics)
              </button>
              <p className="xs muted" style={{ marginTop: 8, marginBottom: 0 }}>
                Works with Google Calendar, Apple Calendar and Outlook, so you get a reminder even when NourishWell isn&apos;t open.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
