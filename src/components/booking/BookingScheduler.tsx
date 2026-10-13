"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAttribution } from "@/lib/attribution-client";
import { track } from "@/lib/analytics";
import { MODE_LABELS, formatInZone, generateSlots, sessionFee, type Availability, type ConsultMode, type HourlyRate, type Slot } from "@/lib/booking";

interface Props {
  professional: { slug: string; name: string; hourlyRate: HourlyRate; availability: Availability; modes: ConsultMode[] };
  /** Preview mode shows the tool with example data and can't send requests. */
  preview?: boolean;
}

const dayLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

export function BookingScheduler({ professional: p, preview = false }: Props) {
  const [minutes, setMinutes] = useState(p.availability.sessionMinutes[0]);
  const [now, setNow] = useState<Date | null>(null);
  const [viewerTz, setViewerTz] = useState("UTC");
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [mode, setMode] = useState<ConsultMode>(p.modes[0]);
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "sent" | "error"; message?: string; errors?: Record<string, string> }>({ kind: "idle" });

  useEffect(() => {
    setNow(new Date());
    setViewerTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  const slots = useMemo(() => (now ? generateSlots(p.availability, minutes, now) : []), [now, p.availability, minutes]);
  const dates = useMemo(() => [...new Set(slots.map((s) => s.date))], [slots]);
  const daySlots = slots.filter((s) => s.date === date);
  const fee = sessionFee(p.hourlyRate, minutes);
  const sameZone = viewerTz === p.availability.timezone;

  useEffect(() => {
    if (date && !dates.includes(date)) setDate(null);
    setSlot(null);
  }, [minutes, date, dates]);

  if (status.kind === "sent")
    return (
      <div className="callout callout-success" role="status">
        <span className="callout-title">Request sent</span>
        {status.message}
      </div>
    );

  return (
    <div className="booking">
      <div className="field">
        <span className="label">Session length</span>
        <div className="chip-row" role="group" aria-label="Session length">
          {p.availability.sessionMinutes.map((m) => (
            <button key={m} type="button" className="filter-chip" aria-pressed={minutes === m} onClick={() => setMinutes(m)}>
              {m} min · {sessionFee(p.hourlyRate, m).display}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="label" id={`dates-${p.slug}`}>
          Choose a date
        </span>
        {!now ? (
          <p className="small muted">Loading availability…</p>
        ) : dates.length === 0 ? (
          <p className="small muted">No times are available in the next {p.availability.horizonDays} days.</p>
        ) : (
          <div className="booking-dates" role="group" aria-labelledby={`dates-${p.slug}`}>
            {dates.map((d) => (
              <button key={d} type="button" className="filter-chip" aria-pressed={date === d} onClick={() => setDate(d)}>
                {dayLabel(d)}
              </button>
            ))}
          </div>
        )}
      </div>

      {date && (
        <div className="field">
          <span className="label">Choose a time</span>
          <div className="booking-times" role="group" aria-label="Available start times">
            {daySlots.map((s) => (
              <button key={s.start} type="button" className="filter-chip" aria-pressed={slot?.start === s.start} onClick={() => setSlot(s)}>
                {formatInZone(s.start, viewerTz, { hour: "numeric", minute: "2-digit" })}
              </button>
            ))}
          </div>
          <p className="xs muted" style={{ marginTop: 6 }}>
            Times shown in your time zone ({viewerTz}).{!sameZone && ` ${p.name} is in ${p.availability.timezone}.`}
          </p>
        </div>
      )}

      {slot && (
        <form
          className="booking-form"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (preview) return;
            const fd = new FormData(e.currentTarget);
            setStatus({ kind: "sending" });
            track("booking_requested", { minutes });
            const res = await fetch("/api/bookings", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                professional: p.slug,
                start: slot.start,
                minutes,
                mode,
                name: fd.get("name"),
                email: fd.get("email"),
                phone: fd.get("phone"),
                note: fd.get("note"),
                timezone: viewerTz,
                consent: fd.get("consent") === "on",
                attribution: getAttribution(),
              }),
            }).catch(() => null);
            const json = res ? await res.json().catch(() => ({})) : {};
            setStatus(res?.ok ? { kind: "sent", message: json.message } : { kind: "error", message: json.message ?? "We couldn't send your request. Please try again.", errors: json.errors });
          }}
        >
          <p className="booking-summary">
            <strong>{formatInZone(slot.start, viewerTz)}</strong>
            <br />
            {minutes} minutes · {MODE_LABELS[mode]} · about <strong>{fee.display}</strong> at {p.name}&apos;s rate of {sessionFee(p.hourlyRate, 60).display} per hour
          </p>
          {p.modes.length > 1 && (
            <div className="field">
              <span className="label">How would you like to meet?</span>
              <div className="chip-row" role="group" aria-label="Consultation type">
                {p.modes.map((m) => (
                  <button key={m} type="button" className="filter-chip" aria-pressed={mode === m} onClick={() => setMode(m)}>
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-2" style={{ gap: "0 1rem" }}>
            <div className="field">
              <label htmlFor={`b-name-${p.slug}`}>Your name</label>
              <input id={`b-name-${p.slug}`} name="name" className="input" required autoComplete="name" />
              {status.errors?.name && <span className="error">{status.errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor={`b-email-${p.slug}`}>Email</label>
              <input id={`b-email-${p.slug}`} name="email" type="email" className="input" required autoComplete="email" />
              {status.errors?.email && <span className="error">{status.errors.email}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor={`b-phone-${p.slug}`}>Phone (optional)</label>
            <input id={`b-phone-${p.slug}`} name="phone" type="tel" className="input" autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor={`b-note-${p.slug}`}>What would you like help with? (optional)</label>
            <span className="hint">A sentence is enough. Please don&apos;t include detailed medical information — you&apos;ll discuss that privately with {p.name}.</span>
            <textarea id={`b-note-${p.slug}`} name="note" className="textarea" maxLength={600} rows={3} />
          </div>
          <label className="checkbox small">
            <input type="checkbox" name="consent" required />
            <span>
              I understand this is a request: {p.name} will confirm the time by email, and I&apos;ll pay {p.name} directly — not NourishWell. NourishWell shares my details with {p.name} only to arrange this
              appointment (<Link href="/privacy">privacy policy</Link>).
            </span>
          </label>
          {status.errors?.consent && <p className="error">{status.errors.consent}</p>}
          {status.kind === "error" && (
            <p className="callout callout-warning small" role="alert">
              {status.message}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={preview || status.kind === "sending"} style={{ marginTop: 12 }}>
            {preview ? "Preview only — requests can't be sent" : status.kind === "sending" ? "Sending…" : "Send booking request"}
          </button>
        </form>
      )}
    </div>
  );
}
