import type { Metadata } from "next";
import { AdminNav } from "@/components/AdminNav";
import { REVENUE_MATRIX } from "@/lib/commerce/revenue-matrix";
import { LISTING_PACKAGES } from "@/lib/commerce/listings";
import { STATUS_LABELS, STREAMS, streamStatus } from "@/lib/commerce/streams";
import { PRODUCTS, productStatus } from "@/lib/commerce/products";
import { EXPERIMENTS } from "@/lib/experiments";

export const metadata: Metadata = { title: "Monetization map", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function MonetizationAdminPage() {
  return (
    <div className="container" style={{ padding: "32px var(--gutter) 64px" }}>
      <span className="eyebrow">Administration</span>
      <h1>Monetization map</h1>
      <AdminNav current="/admin/monetization" />

      <section aria-labelledby="streams-h" style={{ marginBottom: 32 }}>
        <h2 id="streams-h" style={{ fontSize: "var(--fs-xl)" }}>
          Revenue streams
        </h2>
        <p className="small muted">Streams launch in phases. Status is read from configuration, so nothing shows as live until it can actually take money.</p>
        <div className="table-scroll">
          <table className="data-table" style={{ fontSize: "var(--fs-sm)" }}>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Stream</th>
                <th>Model</th>
                <th>Status</th>
                <th>Needs</th>
              </tr>
            </thead>
            <tbody>
              {STREAMS.map((s) => (
                <tr key={s.id}>
                  <td>{s.phase}</td>
                  <td>
                    <strong>{s.name}</strong>
                    <br />
                    <span className="xs muted">{s.notes}</span>
                  </td>
                  <td>{s.model}</td>
                  <td>{STATUS_LABELS[streamStatus(s.id)]}</td>
                  <td className="xs">{s.requires.join("; ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="matrix-h" style={{ marginBottom: 32 }}>
        <div className="spread">
          <h2 id="matrix-h" style={{ fontSize: "var(--fs-xl)", margin: 0 }}>
            Feature-to-revenue matrix
          </h2>
          <a href="/admin/revenue-matrix.csv" className="btn btn-ghost btn-sm" download>
            Download CSV
          </a>
        </div>
        <p className="small muted">The CSV has every column (problem, audience, value, journey, dependencies, costs, risks, metrics). Source: src/lib/commerce/revenue-matrix.ts.</p>
        <div className="table-scroll">
          <table className="data-table" style={{ fontSize: "var(--fs-xs)" }}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Access</th>
                <th>Monetization</th>
                <th>Success metrics</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_MATRIX.map((r) => (
                <tr key={r.feature}>
                  <td>
                    <strong>{r.feature}</strong>
                    <br />
                    <code className="xs">{r.routes}</code>
                  </td>
                  <td>{r.access}</td>
                  <td>{r.monetization}</td>
                  <td>{r.metrics}</td>
                  <td>{r.priority}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="pkg-h" style={{ marginBottom: 32 }}>
        <h2 id="pkg-h" style={{ fontSize: "var(--fs-xl)" }}>
          Listing packages
        </h2>
        <div className="grid grid-3" style={{ gap: 16 }}>
          {LISTING_PACKAGES.map((p) => (
            <div key={p.id} className="card">
              <h3 style={{ fontSize: "var(--fs-lg)" }}>
                {p.name} {!p.available && <span className="chip">Planned</span>}
              </h3>
              <p className="xs muted">{p.priceEnv ? <code>{p.priceEnv}</code> : "Free"}</p>
              <ul className="small">
                {p.benefits.map((b) => (
                  <li key={b.text}>
                    {b.text} {b.status === "planned" && <em>(planned)</em>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="prod-h" style={{ marginBottom: 32 }}>
        <h2 id="prod-h" style={{ fontSize: "var(--fs-xl)" }}>
          Digital products
        </h2>
        <ul className="status-list">
          {PRODUCTS.map((p) => (
            <li key={p.slug}>
              <span>
                {p.name}
                <br />
                <code className="xs">{p.priceEnv}</code>
              </span>
              <span>{productStatus(p)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="exp-h">
        <h2 id="exp-h" style={{ fontSize: "var(--fs-xl)" }}>
          Experiments
        </h2>
        <ul className="status-list">
          {EXPERIMENTS.map((e) => (
            <li key={e.id}>
              <span>
                <strong>{e.id}</strong> — {e.hypothesis}
                <br />
                <span className="xs muted">Variants: {e.variants.map((v) => `${v.id} (${v.weight}%)`).join(", ")} · primary metric: {e.metric}</span>
              </span>
              <span>{e.status}</span>
            </li>
          ))}
        </ul>
        <p className="xs muted">Results by variant are on the Revenue page (from Stripe Checkout metadata).</p>
      </section>
    </div>
  );
}
