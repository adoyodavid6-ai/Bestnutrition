"use client";

import Link from "next/link";
import { useState } from "react";
import { formToObject, useFormSubmit } from "./useFormSubmit";

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
  const err = state.errors;

  if (state.status === "success") return <div className="callout callout-success" role="status">{state.message}</div>;

  const a = (id: string) => ({ id: `l-${id}`, name: id, "aria-invalid": err[id] ? true : undefined, "aria-describedby": err[id] ? `l-${id}-err` : undefined });

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        await submit(formToObject(e.currentTarget));
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
