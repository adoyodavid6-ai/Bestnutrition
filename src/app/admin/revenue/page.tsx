import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { loadRevenue } from "@/lib/billing/revenue";
import { formatMoney } from "@/lib/billing/stripe";
import { publishedBusinesses, publishedProfessionals } from "@/content/directory";
import { loadTraffic } from "@/lib/traffic";
import { productBySlug } from "@/lib/commerce/products";

export const metadata: Metadata = { title: "Revenue", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90, 365];
type Money = Record<string, number>;

function M({ m }: { m: Money | undefined }) {
  const entries = Object.entries(m ?? {}).filter(([, v]) => Math.round(v) !== 0);
  if (!entries.length) return <>—</>;
  return (
    <>
      {entries.map(([cur, v], i) => (
        <span key={cur}>
          {i > 0 && " · "}
          {formatMoney(Math.round(v), cur)}
        </span>
      ))}
    </>
  );
}

const pct = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "—" : `${(v * 100).toFixed(1)}%`);
const minus = (a: Money = {}, b: Money = {}) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [k, (a[k] ?? 0) - (b[k] ?? 0)]));

function Kpi({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="card">
      <span className="xs muted">{label}</span>
      <strong style={{ display: "block", fontSize: "1.35rem", margin: "4px 0" }}>{value}</strong>
      {note && <span className="xs muted">{note}</span>}
    </div>
  );
}

export default async function RevenuePage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: d } = await searchParams;
  const days = PERIODS.includes(Number(d)) ? Number(d) : 30;
  const [r, traffic] = await Promise.all([loadRevenue(days), loadTraffic(days)]);
  const approved = publishedProfessionals().length + publishedBusinesses().length;

  return (
    <div className="container" style={{ padding: "32px var(--gutter) 64px" }}>
      <span className="eyebrow">Administration</span>
      <h1>Revenue</h1>
      <AdminNav current="/admin/revenue" />

      <div className="spread" style={{ marginBottom: 16 }}>
        <nav className="seg" aria-label="Period">
          {PERIODS.map((p) => (
            <Link key={p} href={`/admin/revenue?days=${p}`} aria-current={p === days ? "page" : undefined} className={p === days ? "seg-on" : undefined}>
              {p === 365 ? "12 months" : `${p} days`}
            </Link>
          ))}
        </nav>
        <span className="xs muted">Source: Stripe API, read live at {new Date(r.generatedAt).toUTCString()}</span>
      </div>

      {!r.configured ? (
        <div className="callout callout-info">
          <span className="callout-title">Stripe isn&apos;t connected</span>
          <p className="small" style={{ marginBottom: 0 }}>
            No revenue figures are shown because there is no payment data to read. Set <code>STRIPE_SECRET_KEY</code> (see docs/MONETIZATION.md). Nothing on this page is ever estimated or invented.
          </p>
        </div>
      ) : r.error ? (
        <div className="callout callout-warning" role="alert">
          <span className="callout-title">Couldn&apos;t read Stripe</span>
          <p className="small" style={{ marginBottom: 0 }}>{r.error}</p>
        </div>
      ) : (
        <>
          {r.truncated.length > 0 && (
            <p className="callout callout-warning small">Some lists hit the reading limit ({r.truncated.join(", ")}); totals for this period may be incomplete. Use Stripe Sigma or exports for full reconciliation.</p>
          )}

          <section aria-labelledby="money-h" style={{ marginBottom: 32 }}>
            <h2 id="money-h" style={{ fontSize: "var(--fs-xl)" }}>
              Money in (last {days} days)
            </h2>
            <div className="kpi-grid">
              <Kpi label="Gross sales" value={<M m={r.balance?.gross} />} note="Charged to customers, incl. any tax" />
              <Kpi label="Refunds" value={<M m={r.balance?.refunds} />} />
              <Kpi label="Stripe fees" value={<M m={r.balance?.fees} />} />
              <Kpi label="Net receipts" value={<M m={r.balance?.net} />} note="After refunds and fees; still includes tax" />
              <Kpi label="Tax collected" value={<M m={r.invoices?.tax} />} note="On subscription invoices; owed to tax authorities" />
              <Kpi label="Net receipts excl. tax" value={<M m={minus(r.balance?.net, r.invoices?.tax)} />} note="Not profit: excludes your costs" />
            </div>
          </section>

          <section aria-labelledby="subs-h" style={{ marginBottom: 32 }}>
            <h2 id="subs-h" style={{ fontSize: "var(--fs-xl)" }}>
              Subscriptions
            </h2>
            <div className="kpi-grid">
              <Kpi label="Premium MRR" value={<M m={r.subscriptions?.premium.mrr} />} note="Paying subscriptions, normalised to a month; trials excluded" />
              <Kpi label="Active Premium" value={r.subscriptions?.premium.active ?? 0} note={`${r.subscriptions?.premium.trialing ?? 0} trialing · ${r.subscriptions?.premium.pastDue ?? 0} past due`} />
              <Kpi label="New Premium" value={r.subscriptions?.premium.newInPeriod ?? 0} />
              <Kpi label="Premium churn" value={pct(r.subscriptions?.premiumChurn)} note={`${r.subscriptions?.premium.canceledInPeriod ?? 0} cancelled ÷ ${r.subscriptions?.premium.activeAtStart ?? 0} active at start`} />
              <Kpi label="Avg revenue per paying customer" value={<M m={r.invoices?.arppu} />} note={`${r.invoices?.payingCustomers ?? 0} paying customers this period`} />
              <Kpi label="Featured listing MRR" value={<M m={r.subscriptions?.listing.mrr} />} note={`${r.subscriptions?.listing.active ?? 0} active · churn ${pct(r.subscriptions?.listingChurn)}`} />
            </div>
          </section>

          <div className="grid grid-2" style={{ gap: 16, alignItems: "start", marginBottom: 32 }}>
            <section className="card" aria-labelledby="prod-h">
              <h2 id="prod-h" style={{ fontSize: "var(--fs-lg)" }}>
                Revenue by product
              </h2>
              <ul className="status-list">
                {Object.entries(r.invoices?.byProduct ?? {}).map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>
                      <M m={v} />
                    </span>
                  </li>
                ))}
                {Object.entries(r.checkouts?.products ?? {}).map(([k, v]) => (
                  <li key={k}>
                    <span>
                      {productBySlug(k)?.name ?? k} ({v.sold} sold)
                    </span>
                    <span>
                      <M m={v.amount} />
                    </span>
                  </li>
                ))}
                <li>
                  <span>Affiliate commissions</span>
                  <span className="muted">Not connected (reported by each affiliate network)</span>
                </li>
                <li>
                  <span>Advertising & sponsorship</span>
                  <span className="muted">Invoiced outside Stripe — not tracked here</span>
                </li>
              </ul>
            </section>
            <section className="card" aria-labelledby="country-h">
              <h2 id="country-h" style={{ fontSize: "var(--fs-lg)" }}>
                Revenue by market
              </h2>
              <ul className="status-list">
                {Object.entries(r.invoices?.byCountry ?? {}).map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>
                      <M m={v} />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="xs muted">Billing-address country on paid subscription invoices; currencies are never converted or added together.</p>
            </section>
          </div>

          <div className="grid grid-2" style={{ gap: 16, alignItems: "start", marginBottom: 32 }}>
            <section className="card" aria-labelledby="funnel-h">
              <h2 id="funnel-h" style={{ fontSize: "var(--fs-lg)" }}>
                Checkout funnel
              </h2>
              <ul className="status-list">
                {Object.entries(r.checkouts?.funnel ?? {}).map(([k, f]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>
                      {f.completed} of {f.started} completed · abandonment {pct(f.started ? 1 - f.completed / f.started : null)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="card" aria-labelledby="src-h">
              <h2 id="src-h" style={{ fontSize: "var(--fs-lg)" }}>
                Acquisition source of purchases
              </h2>
              <ul className="status-list">
                {Object.entries(r.checkouts?.sources ?? {}).map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>
                      {v.completed} · <M m={v.amount} />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="xs muted">First-touch campaign recorded in the buyer&apos;s browser and attached to Checkout.</p>
            </section>
          </div>

          <section aria-labelledby="exp-h" style={{ marginBottom: 32 }}>
            <h2 id="exp-h" style={{ fontSize: "var(--fs-xl)" }}>
              Experiments (checkout completion by variant)
            </h2>
            <div className="table-scroll">
              <table className="data-table" style={{ fontSize: "var(--fs-sm)" }}>
                <thead>
                  <tr>
                    <th>Experiment</th>
                    <th>Variants (completed / started)</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {r.checkouts?.experiments.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.arms.map((a) => `${a.variant}: ${a.conversions}/${a.n}`).join(" · ")}</td>
                      <td>{e.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="xs muted">A winner is only suggested when each variant has at least 200 checkouts and the difference is significant (two-proportion z-test, 95%). Always check refunds and cancellations before adopting a variant.</p>
          </section>
        </>
      )}

      <section aria-labelledby="biz-h" style={{ marginBottom: 32 }}>
        <h2 id="biz-h" style={{ fontSize: "var(--fs-xl)" }}>
          Business listings
        </h2>
        <ul className="status-list">
          <li>
            <span>Listing applications submitted</span>
            <span className="muted">Delivered to your inbox via LISTINGS_WEBHOOK_URL — count them there until the database is connected</span>
          </li>
          <li>
            <span>Approved (published) listings</span>
            <span>{approved}</span>
          </li>
          <li>
            <span>Paid featured listings</span>
            <span>{r.subscriptions ? `${r.subscriptions.listing.active} (${approved ? pct(r.subscriptions.listing.active / approved) : "—"} of approved)` : "—"}</span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="traffic-h">
        <h2 id="traffic-h" style={{ fontSize: "var(--fs-xl)" }}>
          Traffic and landing pages
        </h2>
        {!traffic.configured ? (
          <p className="small muted">Connect the Plausible Stats API (PLAUSIBLE_API_KEY and NEXT_PUBLIC_PLAUSIBLE_DOMAIN) to see visitors, landing-page conversion and revenue per visit here.</p>
        ) : "error" in traffic ? (
          <p className="callout callout-warning small">{traffic.error}</p>
        ) : (
          <>
            <div className="kpi-grid">
              <Kpi label="Visitors (consenting)" value={traffic.visitors.toLocaleString("en")} note="Only visitors who allowed analytics are counted" />
              <Kpi label="Net receipts per visit" value={<M m={Object.fromEntries(Object.entries(r.balance?.net ?? {}).map(([k, v]) => [k, traffic.visits ? v / traffic.visits : 0]))} />} note="Upper bound: undercounted visits" />
            </div>
            <div className="table-scroll" style={{ marginTop: 16 }}>
              <table className="data-table" style={{ fontSize: "var(--fs-sm)" }}>
                <thead>
                  <tr>
                    <th>Landing page</th>
                    <th>Visitors</th>
                    <th>Newsletter sign-ups</th>
                    <th>Checkouts started</th>
                  </tr>
                </thead>
                <tbody>
                  {traffic.landing.map((l) => (
                    <tr key={l.page}>
                      <td>
                        <code>{l.page}</code>
                      </td>
                      <td>{l.visitors}</td>
                      <td>
                        {l.signups} ({pct(l.visitors ? l.signups / l.visitors : null)})
                      </td>
                      <td>
                        {l.checkouts} ({pct(l.visitors ? l.checkouts / l.visitors : null)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
