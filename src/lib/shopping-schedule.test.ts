import { describe, expect, it } from "vitest";
import {
  addDays,
  defaultSchedule,
  dueOccurrence,
  lastOccurrence,
  markDone,
  nextOccurrence,
  occurrencesBetween,
  shouldShowReminder,
  toICS,
  totalOccurrences,
  type ShoppingSchedule,
} from "./shopping-schedule";

const base = (over: Partial<ShoppingSchedule> = {}): ShoppingSchedule => ({ ...defaultSchedule("2026-10-10"), enabled: true, startDate: "2026-10-10", ...over });

describe("shopping schedule", () => {
  it("adds days across month, year and DST boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-28", 7)).toBe("2027-01-04");
    expect(addDays("2026-03-28", 7)).toBe("2026-04-04");
  });

  it.each([
    [1, ["2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31"]],
    [2, ["2026-10-10", "2026-10-24"]],
    [3, ["2026-10-10", "2026-10-31"]],
    [4, ["2026-10-10"]],
  ] as const)("repeats every %i week(s)", (weeks, expected) => {
    expect(occurrencesBetween(base({ frequencyWeeks: weeks }), "2026-10-01", "2026-11-06")).toEqual(expected);
  });

  it("stops after a set number of trips", () => {
    const s = base({ frequencyWeeks: 2, end: { type: "after", occurrences: 3 } });
    expect(occurrencesBetween(s, "2026-01-01", "2027-12-31")).toEqual(["2026-10-10", "2026-10-24", "2026-11-07"]);
    expect(totalOccurrences(s)).toBe(3);
    expect(lastOccurrence(s)).toBe("2026-11-07");
  });

  it("stops on an end date", () => {
    const s = base({ frequencyWeeks: 1, end: { type: "until", date: "2026-10-30" } });
    expect(occurrencesBetween(s, "2026-01-01", "2027-12-31")).toEqual(["2026-10-10", "2026-10-17", "2026-10-24"]);
    expect(totalOccurrences(s)).toBe(3);
  });

  it("is not due before the first shopping day", () => {
    expect(dueOccurrence(base({ startDate: "2026-10-20" }), "2026-10-12")).toBeNull();
  });

  it("is due on shopping day", () => {
    expect(dueOccurrence(base(), "2026-10-17")).toEqual({ day: "2026-10-17", status: "today", daysAway: 0 });
  });

  it("shows early when a lead time is set", () => {
    expect(dueOccurrence(base({ leadDays: 2 }), "2026-10-15")).toEqual({ day: "2026-10-17", status: "upcoming", daysAway: 2 });
    expect(dueOccurrence(base({ leadDays: 1 }), "2026-10-15")?.status).toBe("overdue"); // the 10th is still open
  });

  it("keeps a missed trip visible until it is marked done", () => {
    const s = base({ frequencyWeeks: 2 });
    expect(dueOccurrence(s, "2026-10-13")).toEqual({ day: "2026-10-10", status: "overdue", daysAway: -3 });
    const done = markDone(s, "2026-10-10");
    expect(dueOccurrence(done, "2026-10-13")).toBeNull();
    expect(dueOccurrence(done, "2026-10-24")?.status).toBe("today");
  });

  it("moves on to the newer trip once the next window opens", () => {
    expect(dueOccurrence(base({ frequencyWeeks: 1 }), "2026-10-18")?.day).toBe("2026-10-17");
  });

  it("is never due when disabled", () => {
    expect(dueOccurrence(base({ enabled: false }), "2026-10-17")).toBeNull();
  });

  it("finishes after the schedule ends and the last trip is done", () => {
    const s = base({ end: { type: "after", occurrences: 2 } });
    expect(dueOccurrence(s, "2026-12-01")?.day).toBe("2026-10-17");
    expect(dueOccurrence(markDone(s, "2026-10-17"), "2026-12-01")).toBeNull();
    expect(nextOccurrence(markDone(markDone(s, "2026-10-10"), "2026-10-17"), "2026-10-11")).toBeNull();
  });

  it("can be hidden for the rest of the day", () => {
    const s = base({ hiddenOn: "2026-10-17" });
    expect(shouldShowReminder(s, "2026-10-17")).toBeNull();
    expect(shouldShowReminder(s, "2026-10-18")).not.toBeNull();
  });

  it("finds the next upcoming trip", () => {
    expect(nextOccurrence(base({ frequencyWeeks: 3 }), "2026-10-12")).toBe("2026-10-31");
  });

  it("exports a recurring calendar event", () => {
    const ics = toICS(base({ frequencyWeeks: 2, end: { type: "after", occurrences: 6 } }), new Date("2026-10-13T09:00:00Z"));
    expect(ics).toContain("DTSTART;VALUE=DATE:20261010");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=6");
    expect(toICS(base({ end: { type: "until", date: "2026-12-31" } }))).toContain("UNTIL=20261231");
  });
});
