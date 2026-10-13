import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { JsonLd } from "@/components/JsonLd";
import { CheckoutNotice, PricingPlans } from "@/components/billing/PricingPlans";
import { premiumOffers, yearlySaving } from "@/lib/billing/offers";
import { ALL_FEATURES, FEATURE_LABELS, FEATURE_STATUS, planById, premiumLiveExtras, premiumPlannedExtras } from "@/lib/plans";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free & Premium Plans",
  description: "NourishWell is free to use: recipes, nutrition guides, a weekly meal planner, shopping lists and a shopping calendar. Premium adds more saved plans and exports.",
  alternates: { canonical: "/pricing" },
};

const FAQ = [
  { q: "Is NourishWell really free?", a: "Yes. Recipes, all nutrition and health guides, the weekly meal planner, shopping lists and the shopping calendar are free, with no card and no time limit." },
  { q: "What does Premium add today?", a: "More saved weekly plans (up to 50 instead of 3) and exports: your meal plan as a spreadsheet or calendar file, and your shopping list as a spreadsheet. Planned features are listed separately and aren't charged for until they exist." },
  { q: "Will I be charged automatically?", a: "Premium renews automatically each month or year until you cancel. The price and renewal period are shown before you pay, and Stripe emails a receipt for every payment." },
  { q: "Which currency will I pay in?", a: "Prices are set in US dollars. At checkout you can usually pay in your local currency — Stripe shows the converted amount before you confirm. If your currency isn't offered, any card can pay the US-dollar amount and your card provider converts it." },
  { q: "How do I cancel?", a: "Go to Account → Billing and choose Manage billing. You can cancel, change plan, update your card and download receipts there. After cancelling you keep Premium until the end of the period you've paid for." },
  { q: "Does Premium work on all my devices?", a: "Premium is turned on per browser until accounts launch. To add another browser or device, go to Account → Billing and ask for a sign-in link to be emailed to the address you used at checkout." },
  { q: "Will health information ever be paywalled?", a: "No. Health-condition guides, nutrition education and basic planning will always be free, and we never use health information for advertising." },
];

export default async function PricingPage() {
  const offers = await premiumOffers();
  const free = planById("free");
  const premium = planById("premium");
  const freeItems = [...free.features.map((f) => FEATURE_LABELS[f]), `Up to ${free.limits.savedPlans} saved weekly plans`];
  const premiumItems = [`Up to ${premium.limits.savedPlans} saved weekly plans`, ...premiumLiveExtras().filter((f) => f !== "planner.saved-plans.multiple").map((f) => FEATURE_LABELS[f])];
  const plannedItems = premiumPlannedExtras().map((f) => FEATURE_LABELS[f]);

  return (
    <>
      <Breadcrumbs items={[{ href: "/pricing", label: "Free & Premium" }]} />
      <PageHead
        eyebrow="Plans"
        title="Genuinely useful for free"
        lede="Recipes, nutrition and health education, a seven-day meal planner, shopping lists and a shopping calendar are free for everyone. Premium adds convenience for busy households — never paywalled health information."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <Suspense>
          <CheckoutNotice />
        </Suspense>
        <PricingPlans sellable={offers.sellable} month={offers.month} year={offers.year} trialDays={offers.trialDays} saving={yearlySaving(offers.month, offers.year)} adaptivePricing={offers.adaptivePricing} listMonthly={offers.listMonthly} freeItems={freeItems} premiumItems={premiumItems} plannedItems={plannedItems} />

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
                    <td>{premium.features.includes(f) ? (FEATURE_STATUS[f] === "live" ? "✓ Included" : "Planned") : "—"}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" style={{ background: "transparent", position: "static", fontWeight: 500 }}>
                    Saved weekly plans
                  </th>
                  <td>Up to {free.limits.savedPlans}</td>
                  <td>Up to {premium.limits.savedPlans}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section-tight faq" aria-labelledby="faq-h">
          <h2 id="faq-h" style={{ fontSize: "var(--fs-xl)" }}>
            Questions about plans and billing
          </h2>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="small">{f.a}</p>
            </details>
          ))}
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
        </section>

        <section className="section-tight two-col-list" aria-label="Our promises">
          <div className="card">
            <h3>Our promises</h3>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>Health and condition guidance will always be free.</li>
              <li>We will never use health information for targeted advertising.</li>
              <li>The price, renewal period and how to cancel are shown before you pay.</li>
              <li>Cancel any time, with receipts and billing history in Account → Billing.</li>
            </ul>
          </div>
          <div className="card card-muted">
            <h3>How NourishWell is funded</h3>
            <p className="small" style={{ marginBottom: 0 }}>
              Premium subscriptions, verified business listings and clearly labelled partnerships keep the core site free. Read <Link href="/how-we-make-money">how we make money</Link> and our{" "}
              <Link href="/editorial-policy">editorial policy</Link>.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
