/**
 * Recurring shopping calendar.
 *
 * Dates are plain calendar days ("YYYY-MM-DD") in the user's local time zone, so a shopping
 * day never shifts because of time zones or daylight-saving changes. Arithmetic is done on
 * UTC midnight timestamps of those calendar days.
 */

export type FrequencyWeeks = 1 | 2 | 3 | 4;
export type LeadDays = 0 | 1 | 2;

export type ScheduleEnd = { type: "never" } | { type: "after"; occurrences: number } | { type: "until"; date: string };

export interface ShoppingSchedule {
  enabled: boolean;
  /** First shopping day. */
  startDate: string;
  frequencyWeeks: FrequencyWeeks;
  end: ScheduleEnd;
  /** Show the list on the homepage this many days before shopping day. */
  leadDays: LeadDays;
  /** Shopping days the user has marked as done. */
  completed: string[];
  /** Calendar day on which the homepage reminder was hidden ("hide for today"). */
  hiddenOn?: string;
}

export const FREQUENCY_LABELS: Record<FrequencyWeeks, string> = {
  1: "Every week",
  2: "Every 2 weeks",
  3: "Every 3 weeks",
  4: "Every 4 weeks",
};

const DAY = 86_400_000;

export function toDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const toUtc = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function addDays(day: string, n: number): string {
  return fromUtc(toUtc(day) + n * DAY);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY);
}

export function isValidDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && fromUtc(toUtc(day)) === day;
}

export function defaultSchedule(today: string): ShoppingSchedule {
  return { enabled: false, startDate: today, frequencyWeeks: 1, end: { type: "never" }, leadDays: 0, completed: [] };
}

/** The n-th shopping day (0-based), or null if the schedule has ended by then. */
export function occurrence(s: ShoppingSchedule, index: number): string | null {
  if (index < 0) return null;
  if (s.end.type === "after" && index >= s.end.occurrences) return null;
  const day = addDays(s.startDate, index * s.frequencyWeeks * 7);
  if (s.end.type === "until" && day > s.end.date) return null;
  return day;
}

/** All shopping days between `from` and `to` inclusive. */
export function occurrencesBetween(s: ShoppingSchedule, from: string, to: string): string[] {
  const step = s.frequencyWeeks * 7;
  const first = Math.max(0, Math.ceil(daysBetween(s.startDate, from) / step));
  const out: string[] = [];
  for (let i = first; ; i++) {
    const day = occurrence(s, i);
    if (!day || day > to) break;
    if (day >= from) out.push(day);
  }
  return out;
}

/** The next shopping day on or after `today` that hasn't been completed. */
export function nextOccurrence(s: ShoppingSchedule, today: string): string | null {
  const step = s.frequencyWeeks * 7;
  let i = Math.max(0, Math.ceil(daysBetween(s.startDate, today) / step));
  for (let guard = 0; guard < 1000; guard++, i++) {
    const day = occurrence(s, i);
    if (!day) return null;
    if (!s.completed.includes(day)) return day;
  }
  return null;
}

/** Total number of shopping days, or null when the schedule never ends. */
export function totalOccurrences(s: ShoppingSchedule): number | null {
  if (s.end.type === "never") return null;
  if (s.end.type === "after") return s.end.occurrences;
  if (s.end.date < s.startDate) return 0;
  return Math.floor(daysBetween(s.startDate, s.end.date) / (s.frequencyWeeks * 7)) + 1;
}

export function lastOccurrence(s: ShoppingSchedule): string | null {
  const n = totalOccurrences(s);
  return n ? occurrence(s, n - 1) : null;
}

export type DueState = { day: string; status: "upcoming" | "today" | "overdue"; daysAway: number };

/**
 * Which shopping day (if any) should be shown on the homepage today.
 * The most recent shopping day whose reminder window has opened (day − leadDays ≤ today) is due
 * until the user marks it done — a missed trip stays visible rather than silently disappearing.
 */
export function dueOccurrence(s: ShoppingSchedule, today: string): DueState | null {
  if (!s.enabled || !isValidDay(s.startDate)) return null;
  const step = s.frequencyWeeks * 7;
  const latestIndex = Math.floor(daysBetween(s.startDate, addDays(today, s.leadDays)) / step);
  if (latestIndex < 0) return null;
  let idx = latestIndex;
  let day = occurrence(s, idx);
  // The schedule may have ended; fall back to its final shopping day.
  while (!day && idx > 0) day = occurrence(s, --idx);
  if (!day || s.completed.includes(day)) return null;
  const daysAway = daysBetween(today, day);
  return { day, daysAway, status: daysAway > 0 ? "upcoming" : daysAway === 0 ? "today" : "overdue" };
}

/** Whether the homepage reminder should be shown right now. */
export function shouldShowReminder(s: ShoppingSchedule, today: string): DueState | null {
  if (s.hiddenOn === today) return null;
  return dueOccurrence(s, today);
}

export function markDone(s: ShoppingSchedule, day: string): ShoppingSchedule {
  return s.completed.includes(day) ? s : { ...s, completed: [...s.completed, day].sort().slice(-200) };
}

/** iCalendar file so the schedule can be added to Google, Apple or Outlook calendars. */
export function toICS(s: ShoppingSchedule, now: Date = new Date()): string {
  const compact = (day: string) => day.replace(/-/g, "");
  const rule = [`FREQ=WEEKLY`, `INTERVAL=${s.frequencyWeeks}`];
  if (s.end.type === "after") rule.push(`COUNT=${s.end.occurrences}`);
  if (s.end.type === "until") rule.push(`UNTIL=${compact(s.end.date)}`);
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NourishWell//Shopping calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:shopping-${compact(s.startDate)}-${s.frequencyWeeks}w@nourishwell`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(s.startDate)}`,
    `DTEND;VALUE=DATE:${compact(addDays(s.startDate, 1))}`,
    `RRULE:${rule.join(";")}`,
    "SUMMARY:Grocery shopping (NourishWell)",
    "DESCRIPTION:Your NourishWell shopping list is waiting on the homepage.",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
