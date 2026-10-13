import { z } from "zod";

/**
 * Appointment scheduling for professionals.
 *
 * Professionals publish weekly availability in their own time zone; visitors pick a session
 * length, a date and a start time, and send a booking *request*. The professional confirms it
 * and is paid directly by the client — NourishWell doesn't handle consultation payments.
 * All time-zone conversion uses the platform's Intl data (no libraries), including DST.
 */

export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Monday = 1
export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const SESSION_LENGTHS = [30, 45, 60, 90] as const;
export const CONSULT_MODES = ["video", "phone", "in-person"] as const;
export type ConsultMode = (typeof CONSULT_MODES)[number];
export const MODE_LABELS: Record<ConsultMode, string> = { video: "Video call", phone: "Phone call", "in-person": "In person" };

/** Currencies professionals can quote their hourly rate in. */
export const RATE_CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "NZD", "SGD", "MYR", "INR", "HKD", "JPY", "KRW", "PHP", "IDR", "THB", "AED", "ZAR", "KES", "NGN"] as const;

export interface Availability {
  /** IANA time zone, e.g. "Europe/London". */
  timezone: string;
  weekly: { day: IsoWeekday; start: string; end: string }[];
  sessionMinutes: number[];
  /** Earliest bookable time, in hours from now. */
  minNoticeHours: number;
  /** How far ahead clients can book, in days. */
  horizonDays: number;
}

export interface HourlyRate {
  amount: number;
  currency: string;
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const minutesOf = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock parts of an instant in a time zone. */
export function zonedParts(instant: Date, tz: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const weekday = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday) + 1) as IsoWeekday;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`, second: Number(parts.second), weekday };
}

function offsetMs(instant: Date, tz: string) {
  const p = zonedParts(instant, tz);
  const asUtc = Date.UTC(Number(p.date.slice(0, 4)), Number(p.date.slice(5, 7)) - 1, Number(p.date.slice(8, 10)), minutesOf(p.time) / 60, minutesOf(p.time) % 60, p.second);
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * The instant at which it is `date` `time` in `tz`. Returns null for wall times that don't
 * exist (skipped by a daylight-saving jump).
 */
export function zonedToUtc(date: string, time: string, tz: string): Date | null {
  const guess = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), Math.floor(minutesOf(time) / 60), minutesOf(time) % 60);
  let t = guess - offsetMs(new Date(guess), tz);
  t = guess - offsetMs(new Date(t), tz);
  const back = zonedParts(new Date(t), tz);
  return back.date === date && back.time === time ? new Date(t) : null;
}

const addDaysStr = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export interface Slot {
  /** UTC instant, ISO string. */
  start: string;
  /** Date and time in the professional's time zone. */
  date: string;
  time: string;
}

/** Bookable start times, every 30 minutes within each availability window. */
export function generateSlots(av: Availability, sessionMinutes: number, now: Date = new Date(), stepMinutes = 30): Slot[] {
  if (!av.sessionMinutes.includes(sessionMinutes) || !isValidTimeZone(av.timezone)) return [];
  const earliest = now.getTime() + av.minNoticeHours * 3600_000;
  const today = zonedParts(now, av.timezone).date;
  const slots: Slot[] = [];
  for (let i = 0; i <= av.horizonDays; i++) {
    const date = addDaysStr(today, i);
    const weekday = (((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7) + 1) as IsoWeekday;
    for (const w of av.weekly.filter((x) => x.day === weekday)) {
      for (let m = minutesOf(w.start); m + sessionMinutes <= minutesOf(w.end); m += stepMinutes) {
        const instant = zonedToUtc(date, hhmm(m), av.timezone);
        if (instant && instant.getTime() >= earliest) slots.push({ start: instant.toISOString(), date, time: hhmm(m) });
      }
    }
  }
  return slots;
}

export function isBookableSlot(av: Availability, startIso: string, sessionMinutes: number, now: Date = new Date()) {
  return generateSlots(av, sessionMinutes, now).some((s) => s.start === new Date(startIso).toISOString());
}

/** The client's cost for a session at the professional's hourly rate (paid to the professional). */
export function sessionFee(rate: HourlyRate, minutes: number) {
  const amount = Math.round(((rate.amount * minutes) / 60) * 100) / 100;
  return { amount, display: formatRate(amount, rate.currency) };
}

export function formatRate(amount: number, currency: string, locale = "en") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Availability as submitted with a professional's application. */
export const availabilitySchema = z
  .object({
    timezone: z.string().refine(isValidTimeZone, "Choose a valid time zone"),
    weekly: z
      .array(z.object({ day: z.number().int().min(1).max(7), start: z.string().regex(TIME), end: z.string().regex(TIME) }))
      .min(1, "Add at least one day you're available")
      .refine((w) => w.every((x) => minutesOf(x.end) - minutesOf(x.start) >= 30), "Each day needs at least 30 minutes between start and end"),
    sessionMinutes: z.array(z.number().int().refine((n) => (SESSION_LENGTHS as readonly number[]).includes(n))).min(1, "Choose at least one session length"),
    minNoticeHours: z.number().int().min(0).max(168),
    horizonDays: z.number().int().min(7).max(90).default(30),
  })
  .transform((a) => a as Availability);

export const hourlyRateSchema = z.object({
  amount: z.number({ message: "Enter your hourly rate" }).positive("Enter your hourly rate").max(100_000),
  currency: z.enum(RATE_CURRENCIES),
});

/** A booking request from a visitor. */
export const bookingRequestSchema = z.object({
  professional: z.string().regex(/^[a-z0-9-]{2,80}$/),
  start: z.string().datetime(),
  minutes: z.number().int(),
  mode: z.enum(CONSULT_MODES),
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  phone: z.string().trim().max(40).optional().default(""),
  timezone: z.string().max(60).refine(isValidTimeZone).optional(),
  note: z.string().trim().max(600, "Please keep this under 600 characters").optional().default(""),
  consent: z.literal(true, { message: "Please confirm to continue" }),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** Format an instant for people, in a given time zone. */
export function formatInZone(iso: string, tz: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }) {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: tz, timeZoneName: "short" }).format(new Date(iso));
}
