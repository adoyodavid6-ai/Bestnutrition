import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ALL_FEATURES, FEATURE_LABELS, plans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Free & Premium Plans",
  description: "NourishWell is free to use. See what's included for free and what Premium will add.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const [free, premium] = plans;
  return (
    <>
      <Breadcrumbs items={[{ href: "/pricing", label: "Free & Premium" }]} />
      <PageHead
        eyebrow="Plans"
        title="Genuinely useful for free"
        lede="Recipes, nutrition and health education, a seven-day meal planner and shopping lists are free for everyone. Premium will add convenience for busy households — never paywalled health information."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="pricing-grid">
          <div className="price-card">
            <h2>{free.name}</h2>
            <p className="serif" style={{ fontSize: "2.4rem", color: "var(--violet)", margin: "8px 0" }}>
              Free
            </p>
            <p className="muted">{free.tagline}</p>
            <Link href="/meal-planner" className="btn btn-primary" style={{ margin: "8px 0 16px" }}>
              Start planning
            </Link>
            <ul className="check-list">
              {free.features.map((f) => (
                <li key={f}>{FEATURE_LABELS[f]}</li>
              ))}
              <li>Up to {free.limits.savedPlans} saved weekly plans</li>
            </ul>
          </div>
          <div className="price-card featured">
            <h2>
              {premium.name} <span className="chip" style={{ verticalAlign: "middle" }}>Coming soon</span>
            </h2>
            <p className="serif" style={{ fontSize: "1.6rem", margin: "8px 0", color: "#fff" }}>
              Pricing to be announced
            </p>
            <p>{premium.tagline}</p>
            <button className="btn btn-light" disabled aria-disabled="true" style={{ margin: "8px 0 16px" }}>
              Not yet available
            </button>
            <ul className="check-list">
              <li>Everything in Free</li>
              {premium.features
                .filter((f) => !free.features.includes(f))
                .map((f) => (
                  <li key={f}>{FEATURE_LABELS[f]}</li>
                ))}
            </ul>
          </div>
        </div>

        <section className="section-tight" aria-labelledby="compare-h" style={{ marginTop: 32 }}>
          <h2 id="compare-h" style={{ fontSize: "var(--fs-xl)" }}>
            Feature comparison
          </h2>
          <div className="table-scroll">
            <table className="data-table" style={{ fontSize: "var(--fs-sm)" }}>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Free</th>
                  <th scope="col">Premium</th>
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((f) => (
                  <tr key={f}>
                    <th scope="row" style={{ background: "transparent", position: "static", fontWeight: 500 }}>
                      {FEATURE_LABELS[f]}
                    </th>
                    <td>{free.features.includes(f) ? "✓ Included" : "—"}</td>
                    <td>{premium.features.includes(f) ? "✓ Included" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section-tight two-col-list" aria-label="Billing information">
          <div className="card">
            <h3>Our promises</h3>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>Health and condition guidance will always be free.</li>
              <li>We will never use health information for targeted advertising.</li>
              <li>Prices, renewal terms and cancellation will be shown clearly before you pay, in supported local currencies where possible.</li>
              <li>You&apos;ll be able to cancel at any time and access receipts and billing history.</li>
            </ul>
          </div>
          <div className="card card-muted">
            <h3>Why isn&apos;t Premium available yet?</h3>
            <p className="small" style={{ marginBottom: 0 }}>
              We&apos;re focusing on making the free experience excellent first. Premium will launch once accounts and a payment provider are in place and fully tested. Join the{" "}
              <Link href="/#news-h">newsletter</Link> to hear when it opens.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
