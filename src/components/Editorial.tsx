import Link from "next/link";
import { getReferences } from "@/content/references";
import type { ContentReview } from "@/lib/types";
import { Icon } from "./Icon";

const STATUS_LABEL: Record<ContentReview["status"], string> = {
  draft: "Draft",
  "in-review": "Clinical review pending",
  approved: "Approved",
  published: "Published",
  "needs-update": "Needs update",
  archived: "Archived",
};

export function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

export function ReviewBadge({ review }: { review: ContentReview }) {
  const cls = review.reviewer ? "chip-success" : review.status === "in-review" ? "chip-warning" : "chip-violet";
  return (
    <span className={`chip ${cls}`}>
      <Icon name="shield" size={13} /> {review.reviewer ? `Reviewed by ${review.reviewer.name}` : STATUS_LABEL[review.status]}
    </span>
  );
}

export function ReviewPanel({ review, title = "Editorial information" }: { review: ContentReview; title?: string }) {
  return (
    <div className="card card-muted">
      <h3 style={{ fontSize: "1rem" }}>{title}</h3>
      <dl className="review-panel">
        <div>
          <dt>Written by</dt>
          <dd>{review.author}</dd>
        </div>
        <div>
          <dt>Professional review</dt>
          <dd>{review.reviewer ? `${review.reviewer.name}, ${review.reviewer.credential}` : "Not yet reviewed by a qualified professional"}</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{formatDate(review.published)}</dd>
        </div>
        <div>
          <dt>Last reviewed</dt>
          <dd>{review.lastReviewed ? formatDate(review.lastReviewed) : "Pending"}</dd>
        </div>
      </dl>
      {review.note && <p className="xs muted">{review.note}</p>}
      <p className="xs" style={{ marginBottom: 0 }}>
        <Link href="/editorial-policy">Our editorial standards</Link> · <Link href="/contact?topic=correction">Report an error</Link>
      </p>
    </div>
  );
}

export function ReferenceList({ ids, heading = "References" }: { ids: string[]; heading?: string }) {
  const refs = getReferences(ids);
  if (refs.length === 0) return null;
  return (
    <section aria-labelledby="refs-heading">
      <h2 id="refs-heading" style={{ fontSize: "var(--fs-xl)" }}>
        {heading}
      </h2>
      <ol className="reference-list">
        {refs.map((r) => (
          <li key={r.id}>
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              {r.title}
            </a>
            . {r.publisher}
            {r.year ? `, ${r.year}` : ""}.
          </li>
        ))}
      </ol>
      <p className="xs muted">Links open the publisher&apos;s website. Sources are re-checked at each content review.</p>
    </section>
  );
}

export function MedicalNotice({ specialized = false }: { specialized?: boolean }) {
  return (
    <div className={`callout ${specialized ? "callout-warning" : "callout-info"}`} role="note">
      <span className="callout-title">{specialized ? "This condition needs individual clinical guidance" : "General information, not medical advice"}</span>
      <p className="small">
        {specialized
          ? "Dietary changes for this condition can interact with treatment and medication. Use this page to prepare questions — not to change your treatment. Your care team and a registered dietitian should set your individual plan."
          : "This guide explains how eating patterns relate to this condition. It cannot diagnose or treat you. Don't stop or change prescribed medicine without speaking to your clinician."}{" "}
        <Link href="/medical-disclaimer">Read our medical disclaimer</Link>.
      </p>
    </div>
  );
}

export function PageHead({ eyebrow, title, lede, children }: { eyebrow?: string; title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head container">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </header>
  );
}
