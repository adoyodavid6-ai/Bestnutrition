"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formToObject, useFormSubmit } from "./useFormSubmit";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "correction", label: "Report an error or correction" },
  { value: "privacy", label: "Privacy or data request" },
  { value: "accessibility", label: "Accessibility issue" },
  { value: "partnership", label: "Partnerships and advertising" },
  { value: "workplace", label: "Workplace or organisation programmes" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const params = useSearchParams();
  const initialTopic = TOPICS.some((t) => t.value === params.get("topic")) ? params.get("topic")! : "general";
  const { state, submit } = useFormSubmit("contact");
  const err = state.errors;

  if (state.status === "success") return <div className="callout callout-success" role="status">{state.message}</div>;

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        await submit(formToObject(e.currentTarget));
      }}
    >
      <div className="field">
        <label htmlFor="c-name">Your name</label>
        <input id="c-name" name="name" className="input" autoComplete="name" required aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "c-name-err" : undefined} />
        {err.name && <span id="c-name-err" className="error">{err.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" name="email" type="email" className="input" autoComplete="email" required aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "c-email-err" : undefined} />
        {err.email && <span id="c-email-err" className="error">{err.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="c-topic">Topic</label>
        <select id="c-topic" name="topic" className="select" defaultValue={initialTopic}>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="c-message">Message</label>
        <span className="hint" id="c-message-hint">
          Please don&apos;t include personal medical details. We can&apos;t give individual medical advice.
        </span>
        <textarea id="c-message" name="message" className="textarea" required aria-invalid={err.message ? true : undefined} aria-describedby={`c-message-hint${err.message ? " c-message-err" : ""}`} />
        {err.message && <span id="c-message-err" className="error">{err.message}</span>}
      </div>
      <div className="hp-field" aria-hidden="true">
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="checkbox">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to NourishWell using these details to respond, as described in the <Link href="/privacy">privacy policy</Link>.
        </span>
      </label>
      {err.consent && <p className="error">{err.consent}</p>}
      <div role="status" aria-live="polite">
        {state.status === "error" && <p className="callout callout-warning small" style={{ marginTop: 16 }}>{state.message}</p>}
      </div>
      <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }} disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
