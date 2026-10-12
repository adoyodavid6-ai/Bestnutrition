import type { Metadata } from "next";
import Link from "next/link";
import { auditContent, referenceUsage } from "@/lib/content-audit";
import { professionals, businesses } from "@/content/directory";
import { ALL_FEATURES, FEATURE_LABELS, plans } from "@/lib/plans";
import { primaryNav } from "@/lib/site";
import { formatDate } from "@/components/Editorial";
import { WEBHOOK_ENV } from "@/lib/forms";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_CHIP: Record<string, string> = {
  draft: "chip-outline",
  "in-review": "chip-warning",
  approved: "chip-violet",
  published: "chip-success",
  "needs-update": "chip-danger",
  archived: "chip-outline",
};

export default function AdminPage() {
  const rows = auditContent();
  const refs = referenceUsage();
  const byStatus = rows.reduce<Record<string, number>>((acc, r) => ((acc[r.review.status] = (acc[r.review.status] ?? 0) + 1), acc), {});
  const pendingClinical = rows.filter((r) => r.requiresClinicalReview && !r.review.reviewer).length;
  const integrations = [
    { name: "Newsletter delivery", env: WEBHOOK_ENV.newsletter },
    { name: "Contact form delivery", env: WEBHOOK_ENV.contact },
    { name: "Listing applications", env: WEBHOOK_ENV.listing },
    { name: "Database / auth (Supabase)", env: "NEXT_PUBLIC_SUPABASE_URL" },
  ].map((i) => ({ ...i, configured: Boolean(process.env[i.env]) }));

  return (
    <div className="container" style={{ padding: "32px var(--gutter) 64px" }}>
      <span className="eyebrow">Administration</span>
      <h1>Content &amp; operations dashboard</h1>
      <div className="callout callout-info" style={{ marginBottom: 24 }}>
        <p className="small">
          This dashboard reads content directly from the repository (<code>src/content</code>). Editing, approvals and moderation through the browser require the database layer described in{" "}
          <code>docs/ARCHITECTURE.md</code>. Until then, content changes are made by pull request so every edit has a reviewable history.
        </p>
      </div>

      <div className="kpi" style={{ marginBottom: 32 }}>
        <div className="card">
          <strong>{rows.length}</strong>
          <span className="xs muted">content items</span>
        </div>
        <div className="card">
          <strong>{byStatus.published ?? 0}</strong>
          <span className="xs muted">published</span>
        </div>
        <div className="card">
          <strong>{pendingClinical}</strong>
          <span className="xs muted">awaiting clinical review</span>
        </div>
        <div className="card">
          <strong>{refs.length}</strong>
          <span className="xs muted">references</span>
        </div>
      </div>

      <section aria-labelledby="integrations-h" style={{ marginBottom: 32 }}>
        <h2 id="integrations-h" style={{ fontSize: "var(--fs-xl)" }}>
          Integrations
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Integration</th>
                <th>Environment variable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((i) => (
                <tr key={i.env}>
                  <td>{i.name}</td>
                  <td>
                    <code>{i.env}</code>
                  </td>
                  <td>
                    <span className={`status-dot ${i.configured ? "ok" : "warn"}`} />
                    {i.configured ? "Configured" : "Not configured"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="content-h" style={{ marginBottom: 32 }}>
        <h2 id="content-h" style={{ fontSize: "var(--fs-xl)" }}>
          Content inventory &amp; review workflow
        </h2>
        <div className="table-scroll" style={{ maxHeight: 640, overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Reviewer</th>
                <th>Published</th>
                <th>Last reviewed</th>
                <th className="num">Refs</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.href}>
                  <td>{r.kind}</td>
                  <td>
                    <Link href={r.href}>{r.title}</Link>
                  </td>
                  <td>
                    <span className={`chip ${STATUS_CHIP[r.review.status]}`}>{r.review.status}</span>
                  </td>
                  <td>{r.review.author}</td>
                  <td>{r.review.reviewer ? `${r.review.reviewer.name}, ${r.review.reviewer.credential}` : "—"}</td>
                  <td>{formatDate(r.review.published)}</td>
                  <td>{r.review.lastReviewed ? formatDate(r.review.lastReviewed) : "—"}</td>
                  <td className="num">{r.references}</td>
                  <td>
                    {r.issues.length === 0 ? (
                      <span>
                        <span className="status-dot ok" />
                        OK
                      </span>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {r.issues.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="directory-h" style={{ marginBottom: 32 }}>
        <h2 id="directory-h" style={{ fontSize: "var(--fs-xl)" }}>
          Directory moderation
        </h2>
        <p className="small">
          {professionals.length} professional and {businesses.length} business records. Applications arrive through the listing form webhook; record verification outcomes in the <code>listings</code>{" "}
          table once the database is connected.
        </p>
      </section>

      <section aria-labelledby="refs-h" style={{ marginBottom: 32 }}>
        <h2 id="refs-h" style={{ fontSize: "var(--fs-xl)" }}>
          Reference library
        </h2>
        <div className="table-scroll" style={{ maxHeight: 420, overflowY: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Publisher</th>
                <th>Kind</th>
                <th className="num">Used</th>
              </tr>
            </thead>
            <tbody>
              {refs.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code>{r.id}</code>
                  </td>
                  <td>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      {r.title}
                    </a>
                  </td>
                  <td>{r.publisher}</td>
                  <td>{r.kind}</td>
                  <td className="num">{r.uses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="subs-h" style={{ marginBottom: 32 }}>
        <h2 id="subs-h" style={{ fontSize: "var(--fs-xl)" }}>
          Subscription configuration
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                {plans.map((p) => (
                  <th key={p.id}>
                    {p.name} {p.available ? "" : "(not live)"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((f) => (
                <tr key={f}>
                  <td>{FEATURE_LABELS[f]}</td>
                  {plans.map((p) => (
                    <td key={p.id}>{p.features.includes(f) ? "✓" : "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xs muted">Configured in src/lib/plans.ts. Premium price: not set. Payments: not configured.</p>
      </section>

      <section aria-labelledby="nav-h">
        <h2 id="nav-h" style={{ fontSize: "var(--fs-xl)" }}>
          Navigation
        </h2>
        <ol className="small">
          {primaryNav.map((n) => (
            <li key={n.href}>
              {n.label} — <code>{n.href}</code>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
