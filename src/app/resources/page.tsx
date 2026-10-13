import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { oneTimeOffer } from "@/lib/billing/offers";
import { PRODUCTS, productPriceId, productSellable } from "@/lib/commerce/products";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Printable Planning Resources",
  description: "Original, printable NourishWell resources for planning meals on paper — sold separately to support the free site.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage() {
  const items = await Promise.all(
    PRODUCTS.filter((p) => p.status === "published").map(async (p) => ({ p, offer: productSellable(p) ? await oneTimeOffer(productPriceId(p)) : null })),
  );
  return (
    <>
      <Breadcrumbs items={[{ href: "/resources", label: "Resources" }]} />
      <PageHead eyebrow="Resources" title="Plan on paper" lede="Original printable resources from NourishWell. Everything on the website stays free — these are optional extras that help fund it." />
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="grid grid-2" style={{ gap: 16 }}>
          {items.map(({ p, offer }) => (
            <article key={p.slug} className="card">
              <span className="eyebrow">{p.format}</span>
              <h2 style={{ fontSize: "var(--fs-xl)" }}>
                <Link href={`/resources/${p.slug}`}>{p.name}</Link>
              </h2>
              <p className="small">{p.summary}</p>
              <p className="small" style={{ marginBottom: 0 }}>
                <strong>{offer ? offer.display : "Coming soon"}</strong>
                {offer && <span className="muted"> · one-time purchase</span>}
              </p>
            </article>
          ))}
        </div>
        <p className="xs muted" style={{ marginTop: 24 }}>
          Looking for something free? Try the <Link href="/free-meal-plan">free 7-day meal plan</Link> or the <Link href="/meal-planner">meal planner</Link>.
        </p>
      </div>
    </>
  );
}
