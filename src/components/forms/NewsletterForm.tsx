"use client";

import Link from "next/link";
import { useId } from "react";
import { formToObject, useFormSubmit } from "./useFormSubmit";

export function NewsletterForm({
  variant = "light",
  compact = false,
  source = "site",
  heading = "The NourishWell weekly",
  consentText = "Send me weekly recipes and nutrition tips.",
  button = "Subscribe",
}: {
  variant?: "light" | "dark";
  compact?: boolean;
  /** Where the sign-up happened, sent with the subscription so campaigns can be measured. */
  source?: string;
  heading?: string;
  consentText?: string;
  button?: string;
}) {
  const id = useId();
  const { state, submit } = useFormSubmit("newsletter");
  const dark = variant === "dark";

  if (state.status === "success") {
    return (
      <p role="status" className="form-status" style={{ background: dark ? "rgba(255,255,255,.08)" : "var(--success-bg)" }}>
        {state.message}
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        await submit(formToObject(e.currentTarget));
      }}
      aria-describedby={`${id}-status`}
    >
      {!compact && heading && <h3 style={{ color: dark ? "#fff" : undefined }}>{heading}</h3>}
      <input type="hidden" name="source" value={source} />
      <label htmlFor={`${id}-email`} className={compact ? "sr-only" : "label"} style={dark ? { color: "#fff" } : undefined}>
        Email address
      </label>
      <div className="row" style={{ flexWrap: "nowrap", marginTop: compact ? 0 : 6 }}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@example.com"
          aria-invalid={state.errors.email ? true : undefined}
          aria-describedby={state.errors.email ? `${id}-email-err` : undefined}
        />
        <button className={`btn ${dark ? "btn-light" : "btn-primary"}`} type="submit" disabled={state.status === "submitting"}>
          {state.status === "submitting" ? "Sending…" : button}
        </button>
      </div>
      {state.errors.email && (
        <p id={`${id}-email-err`} className="error" style={{ marginTop: 6 }}>
          {state.errors.email}
        </p>
      )}
      <div className="hp-field" aria-hidden="true">
        <label>
          Leave this empty
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="checkbox xs" style={{ marginTop: 10, color: dark ? "#d8cfe0" : undefined }}>
        <input type="checkbox" name="consent" required />
        <span>
          {consentText} Unsubscribe any time. See our{" "}
          <Link href="/privacy" style={dark ? { color: "#fff" } : undefined}>
            privacy policy
          </Link>
          .
        </span>
      </label>
      {state.errors.consent && <p className="error">{state.errors.consent}</p>}
      <div id={`${id}-status`} role="status" aria-live="polite">
        {state.status === "error" && (
          <p className="form-status" style={{ marginTop: 8, background: dark ? "rgba(255,255,255,.08)" : "var(--warning-bg)", color: dark ? "#fff" : "var(--warning)" }}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
