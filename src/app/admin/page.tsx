import type { Metadata } from "next";
import Link from "next/link";
import { auditContent, referenceUsage } from "@/lib/content-audit";
import { professionals, businesses } from "@/content/directory";
import { ALL_FEATURES, FEATURE_LABELS, FEATURE_STATUS, plans } from "@/lib/plans";
import { absoluteUrl, site } from "@/lib/site";
import { billingConfig, billingStatus } from "@/lib/billing/config";
import { signListing } from "@/lib/billing/entitlement";
import { featuredListingOffer, premiumOffers } from "@/lib/billing/offers";
import { UtmBuilder } from "@/components/marketing/UtmBuilder";
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

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing = "" } = await searchParams;
  const config = billingConfig();
  const status = billingStatus(config);
  const [offers, featured] = await Promise.all([premiumOffers(config), featuredListingOffer(config)]);
  const listingSlug = listing.trim().toLowerCase();
  const listingValid = /^[a-z0-9-]{2,80}$/.test(listingSlug);
  const paymentLink = listingValid && config.entitlementSecret ? absoluteUrl(`/for-businesses/upgrade?listing=${listingSlug}&sig=${signListing(listingSlug, config.entitlementSecret)}`) : null;
  const verifiedSlugs = [...professionals, ...businesses].filter((x) => x.verification === "verified").map((x) => x.slug);
  const rows = auditContent();
  const refs = referenceUsage();
  const byStatus = rows.reduce<Record<string, number>>((acc, r) => ((acc[r.review.status] = (acc[r.review.status] ?? 0) + 1), acc), {});
  const pendingClinical = rows.filter((r) => r.requiresClinicalReview && !r.review.reviewer).length;
  const integrations = [
    { name: "Newsletter delivery", env: WEBHOOK_ENV.newsletter },
    { name: "Contact form delivery", env: WEBHOOK_ENV.contact },
    { name: "Listing applications", env: WEBHOOK_ENV.listing },
    { name: "Analytics (Plausible, consent-gated)", env: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN" },
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
          Monetization
        </h2>
        <div className="grid grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div className="card">
            <h3 style={{ fontSize: "var(--fs-lg)" }}>Billing configuration</h3>
            <ul className="status-list">
              {status.map((s) => (
                <li key={s.env}>
                  <span>
                    {s.label}
                    <br />
                    <code className="xs">{s.env}</code>
                  </span>
                  <span className={s.ok ? "status-ok" : "status-missing"}>{s.ok ? `✓ ${s.note ?? "Set"}` : "Not set"}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "var(--fs-lg)" }}>Live prices (read from Stripe)</h3>
            <ul className="status-list">
              <li>
                <span>Premium monthly</span>
                <span>{offers.month ? `${offers.month.display} / month` : "—"}</span>
              </li>
              <li>
                <span>Premium yearly</span>
                <span>{offers.year ? `${offers.year.display} / year` : "—"}</span>
              </li>
              <li>
                <span>Featured listing</span>
                <span>{featured ? `${featured.display} / ${featured.interval}` : "—"}</span>
              </li>
              <li>
                <span>Free trial</span>
                <span>{offers.trialDays ? `${offers.trialDays} days` : "None"}</span>
              </li>
            </ul>
            <p className="xs muted" style={{ marginBottom: 0 }}>
              {offers.sellable ? "Premium checkout is live on /pricing." : "Premium shows “Coming soon” with a waitlist until Stripe, a Premium price and ENTITLEMENT_SECRET are set."} Prices are changed in the Stripe dashboard, never in code. See docs/MONETIZATION.md.
            </p>
          </div>
        </div>

        <div className="table-scroll" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                {plans.map((p) => (
                  <th key={p.id}>{p.name}</th>
                ))}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((f) => (
                <tr key={f}>
                  <td>{FEATURE_LABELS[f]}</td>
                  {plans.map((p) => (
                    <td key={p.id}>{p.features.includes(f) ? "✓" : "—"}</td>
                  ))}
                  <td>{FEATURE_STATUS[f] === "live" ? "Live" : "Planned (not sold)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xs muted">Plans and limits: src/lib/plans.ts. Premium is enforced on the server by the signed entitlement cookie (exports via /api/premium/export).</p>
      </section>

      <section aria-labelledby="listing-pay-h" style={{ marginBottom: 32 }}>
        <h2 id="listing-pay-h" style={{ fontSize: "var(--fs-xl)" }}>
          Featured listing payment links
        </h2>
        <p className="small muted">Generate a personal payment link only after a listing has been verified. The link is signed, so it can&apos;t be edited to upgrade a different listing.</p>
        <form method="get" action="/admin#listing-pay-h" className="row" style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ margin: 0, flex: "1 1 260px" }}>
            <label htmlFor="listing">Listing slug</label>
            <input id="listing" name="listing" className="input" defaultValue={listingSlug} list="verified-listings" placeholder="e.g. green-table-kitchen" />
            <datalist id="verified-listings">
              {verifiedSlugs.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
          <button className="btn btn-primary btn-sm" type="submit">
            Generate link
          </button>
        </form>
        {listing && !listingValid && <p className="error">Use lowercase letters, numbers and hyphens only.</p>}
        {listing && listingValid && !config.entitlementSecret && <p className="error">Set ENTITLEMENT_SECRET (32+ characters) to sign payment links.</p>}
        {paymentLink && (
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="pay-link">Payment link for {listingSlug}</label>
            <input id="pay-link" className="input" readOnly value={paymentLink} />
            {!featured && <p className="xs muted">Payments aren&apos;t switched on yet (STRIPE_PRICE_LISTING_FEATURED), so this page will say so instead of taking payment.</p>}
          </div>
        )}
      </section>

      <section aria-labelledby="campaign-h" style={{ marginBottom: 32 }}>
        <h2 id="campaign-h" style={{ fontSize: "var(--fs-xl)" }}>
          Campaign links
        </h2>
        <p className="small muted">
          Tag every link you share. The first campaign a visitor arrives from is stored in their browser and sent with newsletter sign-ups, listing applications and checkouts (see the <code>attribution</code> field in
          webhook payloads and <code>attr_*</code> metadata in Stripe). No advertising pixels are used.
        </p>
        <UtmBuilder baseUrl={site.url} />
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
