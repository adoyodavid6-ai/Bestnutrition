import { describe, expect, it } from "vitest";
import { availabilitySchema, bookingRequestSchema, generateSlots, isBookableSlot, sessionFee, zonedToUtc, type Availability } from "./booking";

const av = (over: Partial<Availability> = {}): Availability => ({
  timezone: "Europe/London",
  weekly: [{ day: 2, start: "09:00", end: "11:00" }],
  sessionMinutes: [30, 60],
  minNoticeHours: 24,
  horizonDays: 14,
  ...over,
});

describe("time zones", () => {
  it("converts wall time to UTC across zones and DST", () => {
    expect(zonedToUtc("2026-07-14", "09:00", "Europe/London")!.toISOString()).toBe("2026-07-14T08:00:00.000Z"); // BST
    expect(zonedToUtc("2026-12-15", "09:00", "Europe/London")!.toISOString()).toBe("2026-12-15T09:00:00.000Z"); // GMT
    expect(zonedToUtc("2026-07-14", "09:00", "America/New_York")!.toISOString()).toBe("2026-07-14T13:00:00.000Z");
    expect(zonedToUtc("2026-07-14", "09:00", "Asia/Singapore")!.toISOString()).toBe("2026-07-14T01:00:00.000Z");
    expect(zonedToUtc("2026-07-14", "09:00", "Asia/Kolkata")!.toISOString()).toBe("2026-07-14T03:30:00.000Z");
  });

  it("rejects wall times skipped by a daylight-saving jump", () => {
    expect(zonedToUtc("2026-03-08", "02:30", "America/New_York")).toBeNull();
    expect(zonedToUtc("2026-03-29", "01:30", "Europe/London")).toBeNull();
  });
});

describe("slots", () => {
  const now = new Date("2026-10-13T08:00:00Z"); // a Tuesday

  it("offers starts every 30 minutes that fit the session, after the notice period", () => {
    const s = generateSlots(av(), 60, now);
    // Tuesday 13th is inside 24h notice; next Tuesdays 20th and 27th: 09:00, 09:30, 10:00
    expect(s.map((x) => `${x.date} ${x.time}`)).toEqual(["2026-10-20 09:00", "2026-10-20 09:30", "2026-10-20 10:00", "2026-10-27 09:00", "2026-10-27 09:30", "2026-10-27 10:00"]);
    expect(s[0].start).toBe("2026-10-20T08:00:00.000Z"); // BST
    expect(s[3].start).toBe("2026-10-27T09:00:00.000Z"); // GMT after clocks change on 25 Oct
  });

  it("only allows session lengths the professional offers", () => {
    expect(generateSlots(av(), 90, now)).toEqual([]);
  });

  it("validates a requested start time server-side", () => {
    expect(isBookableSlot(av(), "2026-10-20T08:30:00Z", 60, now)).toBe(true);
    expect(isBookableSlot(av(), "2026-10-20T08:15:00Z", 60, now)).toBe(false);
    expect(isBookableSlot(av(), "2026-10-20T10:00:00Z", 60, now)).toBe(false); // 11:00 local: ends after window
    expect(isBookableSlot(av(), "2026-10-13T09:00:00Z", 60, now)).toBe(false); // inside notice period
  });
});

describe("fees and validation", () => {
  it("prices a session from the hourly rate", () => {
    expect(sessionFee({ amount: 80, currency: "USD" }, 45)).toEqual({ amount: 60, display: "$60" });
    expect(sessionFee({ amount: 75, currency: "GBP" }, 30).display).toBe("£37.50");
  });

  it("validates availability and booking requests", () => {
    expect(availabilitySchema.safeParse({ timezone: "Mars/Base", weekly: [{ day: 1, start: "09:00", end: "17:00" }], sessionMinutes: [60], minNoticeHours: 24 }).success).toBe(false);
    expect(availabilitySchema.safeParse({ timezone: "Asia/Singapore", weekly: [], sessionMinutes: [60], minNoticeHours: 24 }).success).toBe(false);
    expect(availabilitySchema.safeParse({ timezone: "Asia/Singapore", weekly: [{ day: 1, start: "09:00", end: "09:15" }], sessionMinutes: [60], minNoticeHours: 24 }).success).toBe(false);
    expect(availabilitySchema.safeParse({ timezone: "Asia/Singapore", weekly: [{ day: 1, start: "09:00", end: "17:00" }], sessionMinutes: [60], minNoticeHours: 24 }).success).toBe(true);
    const ok = { professional: "jane-doe", start: "2026-10-20T08:00:00.000Z", minutes: 60, mode: "video", name: "A", email: "a@b.co", consent: true };
    expect(bookingRequestSchema.safeParse(ok).success).toBe(true);
    expect(bookingRequestSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...ok, note: "x".repeat(700) }).success).toBe(false);
  });
});
