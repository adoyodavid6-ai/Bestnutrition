"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSULT_MODES, MODE_LABELS, RATE_CURRENCIES, SESSION_LENGTHS, WEEKDAY_NAMES } from "@/lib/booking";
import { formToObject, useFormSubmit } from "./useFormSubmit";

type Day = { on: boolean; start: string; end: string };
const DEFAULT_DAYS: Day[] = WEEKDAY_NAMES.map((_, i) => ({ on: i < 5, start: "09:00", end: "17:00" }));

/** Rate, consultation modes and weekly availability (professionals only). */
function ProfessionalFields({ err, days, setDays, timezone, setTimezone }: { err: Record<string, string>; days: Day[]; setDays: (d: Day[]) => void; timezone: string; setTimezone: (t: string) => void }) {
  const [zones, setZones] = useState<string[]>([]);
  useEffect(() => {
    try {
      setZones((Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone"));
    } catch {
      setZones([]);
    }
  }, []);
  const e = (k: string) => Object.entries(err).find(([key]) => key === k || key.startsWith(`${k}.`))?.[1];
  return (
    <fieldset className="pro-fields">
      <legend>Your rate and availability</legend>
      <p className="small muted">Clients see your hourly rate and book a time with you. They pay you directly — NourishWell never takes a cut of your consultations.</p>
      <div className="grid grid-2" style={{ gap: "0 1.5rem" }}>
        <div className="field">
          <label htmlFor="l-rate">Hourly rate</label>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <select id="l-rate-currency" name="rateCurrency" className="select" defaultValue="USD" aria-label="Currency" style={{ maxWidth: 110 }}>
              {RATE_CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input id="l-rate" name="rateAmount" className="input" type="number" min="1" step="0.01" inputMode="decimal" placeholder="e.g. 80" aria-invalid={e("hourlyRate") ? true : undefined} />
          </div>
          {e("hourlyRate") && <span className="error">{e("hourlyRate")}</span>}
        </div>
        <div className="field">
          <label htmlFor="l-notice">Minimum notice for bookings</label>
          <select id="l-notice" name="minNoticeHours" className="select" defaultValue="24">
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
            <option value="48">2 days</option>
            <option value="72">3 days</option>
          </select>
        </div>
      </div>
      <div className="grid grid-2" style={{ gap: "0 1.5rem" }}>
        <div className="field">
          <span className="label">Session lengths you offer</span>
          <div className="chip-row">
            {SESSION_LENGTHS.map((m) => (
              <label key={m} className="checkbox small">
                <input type="checkbox" name={`session_${m}`} defaultChecked={m === 60} /> {m} min
              </label>
            ))}
          </div>
          {e("availability.sessionMinutes") && <span className="error">{e("availability.sessionMinutes")}</span>}
        </div>
        <div className="field">
          <span className="label">How you see clients</span>
          <div className="chip-row">
            {CONSULT_MODES.map((m) => (
              <label key={m} className="checkbox small">
                <input type="checkbox" name={`mode_${m}`} defaultChecked={m === "video"} /> {MODE_LABELS[m]}
              </label>
            ))}
          </div>
          {e("modes") && <span className="error">{e("modes")}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="l-tz">Your time zone</label>
        <select id="l-tz" className="select" value={timezone} onChange={(ev) => setTimezone(ev.target.value)}>
          {!zones.includes(timezone) && <option value={timezone}>{timezone}</option>}
          {zones.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <span className="label">Weekly availability</span>
        <div className="avail-grid">
          {days.map((d, i) => (
            <div key={WEEKDAY_NAMES[i]} className="avail-row">
              <label className="checkbox small">
                <input type="checkbox" checked={d.on} onChange={(ev) => setDays(days.map((x, j) => (j === i ? { ...x, on: ev.target.checked } : x)))} /> {WEEKDAY_NAMES[i]}
              </label>
              <input type="time" className="input" aria-label={`${WEEKDAY_NAMES[i]} from`} value={d.start} disabled={!d.on} step={1800} onChange={(ev) => setDays(days.map((x, j) => (j === i ? { ...x, start: ev.target.value } : x)))} />
              <span aria-hidden="true">–</span>
              <input type="time" className="input" aria-label={`${WEEKDAY_NAMES[i]} until`} value={d.end} disabled={!d.on} step={1800} onChange={(ev) => setDays(days.map((x, j) => (j === i ? { ...x, end: ev.target.value } : x)))} />
            </div>
          ))}
        </div>
        {e("availability") && <span className="error">{e("availability")}</span>}
      </div>
    </fieldset>
  );
}

function F({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={`l-${id}`}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && (
        <span id={`l-${id}-err`} className="error">
          {error}
        </span>
      )}
    </div>
  );
}

export function ListingForm({ defaultType = "professional" }: { defaultType?: "professional" | "business" }) {
  const { state, submit } = useFormSubmit("listing");
  const [type, setType] = useState(defaultType);
  const [days, setDays] = useState<Day[]>(DEFAULT_DAYS);
  const [timezone, setTimezone] = useState("UTC");
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);
  const err = state.errors;

  if (state.status === "success") return <div className="callout callout-success" role="status">{state.message}</div>;

  const a = (id: string) => ({ id: `l-${id}`, name: id, "aria-invalid": err[id] ? true : undefined, "aria-describedby": err[id] ? `l-${id}-err` : undefined });

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const data = formToObject(e.currentTarget);
        if (type === "professional") {
          // Shape the flat fields into the structure the server validates.
          const amount = Number.parseFloat(String(data.rateAmount ?? ""));
          data.hourlyRate = Number.isFinite(amount) ? { amount, currency: data.rateCurrency } : undefined;
          data.modes = CONSULT_MODES.filter((m) => data[`mode_${m}`]);
          data.availability = {
            timezone,
            weekly: days.flatMap((d, i) => (d.on ? [{ day: i + 1, start: d.start, end: d.end }] : [])),
            sessionMinutes: SESSION_LENGTHS.filter((m) => data[`session_${m}`]),
            minNoticeHours: Number(data.minNoticeHours ?? 24),
            horizonDays: 30,
          };
          for (const k of Object.keys(data)) if (/^(mode_|session_)|^rate(Amount|Currency)$|^minNoticeHours$|^$/.test(k)) delete data[k];
        }
        await submit(data);
      }}
    >
      <fieldset>
        <legend>I am applying as</legend>
        <div className="seg" role="group">
          {(["professional", "business"] as const).map((t) => (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)}>
              {t === "professional" ? "A qualified professional" : "A business"}
            </button>
          ))}
        </div>
        <input type="hidden" name="listingType" value={type} />
      </fieldset>
      <div className="grid grid-2" style={{ gap: "0 1.5rem" }}>
        <F id="name" error={err.name} label={type === "professional" ? "Full name" : "Business name"}>
          <input {...a("name")} className="input" required autoComplete={type === "professional" ? "name" : "organization"} />
        </F>
        <F id="organisation" error={err.organisation} label={type === "professional" ? "Practice or clinic (optional)" : "Legal entity (optional)"}>
          <input {...a("organisation")} className="input" />
        </F>
        <F id="email" error={err.email} label="Work email">
          <input {...a("email")} className="input" type="email" required autoComplete="email" />
        </F>
        <F id="country" error={err.country} label="Country">
          <input {...a("country")} className="input" required autoComplete="country-name" />
        </F>
        <F id="profession" error={err.profession} label={type === "professional" ? "Profession" : "Business type"} hint={type === "professional" ? "e.g. Registered dietitian, nutritionist, physiotherapist" : "e.g. Healthy meal provider, gym, clinic"}>
          <input {...a("profession")} className="input" required />
        </F>
        <F id="registration" error={err.registration} label={type === "professional" ? "Professional registration body and number" : "Business registration number (optional)"} hint="Used only for verification; never shown publicly without your consent.">
          <input {...a("registration")} className="input" />
        </F>
      </div>
      <F id="website" error={err.website} label="Website (optional)">
        <input {...a("website")} className="input" type="url" inputMode="url" placeholder="https://" />
      </F>
      <F id="tier" label="Listing you're interested in" hint="Everyone starts with verification. Featured listings are paid for only after you're verified.">
        <select id="tier" name="tier" className="select" defaultValue="basic">
          <option value="basic">Basic listing (free)</option>
          <option value="featured">Featured listing (paid, after verification)</option>
        </select>
      </F>
      {type === "professional" && <ProfessionalFields err={err} days={days} setDays={setDays} timezone={timezone} setTimezone={setTimezone} />}
      <F id="services" error={err.services} label="Services, specialties, languages and service areas">
        <textarea {...a("services")} className="textarea" required />
      </F>
      <div className="hp-field" aria-hidden="true">
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="checkbox">
        <input type="checkbox" name="consent" required />
        <span>
          I confirm the information is accurate and agree that NourishWell may contact me and verify my credentials or business details before any listing is published. See the{" "}
          <Link href="/privacy">privacy policy</Link> and <Link href="/terms">terms</Link>.
        </span>
      </label>
      {err.consent && <p className="error">{err.consent}</p>}
      <div role="status" aria-live="polite">
        {state.status === "error" && <p className="callout callout-warning small" style={{ marginTop: 16 }}>{state.message}</p>}
      </div>
      <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }} disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
