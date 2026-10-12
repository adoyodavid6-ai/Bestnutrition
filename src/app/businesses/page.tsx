import type { Metadata } from "next";
import Link from "next/link";
import { publishedBusinesses } from "@/content/directory";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";

export const metadata: Metadata = {
  title: "Healthy Business Directory",
  description: "Verified healthy meal providers, gyms, clinics and wellness businesses.",
  alternates: { canonical: "/businesses" },
};

export default function BusinessesPage() {
  const list = publishedBusinesses();
  return (
    <>
      <Breadcrumbs items={[{ href: "/businesses", label: "Businesses" }]} />
      <PageHead eyebrow="Business directory" title="Healthy businesses near you" lede="Healthy meal providers, gyms, studios, clinics and wellness brands — each checked before listing." />
      <div className="container" style={{ paddingBottom: 48 }}>
        {list.length === 0 ? (
          <div className="empty-state">
            <h2>No verified businesses listed yet</h2>
            <p className="muted" style={{ maxWidth: "58ch", margin: "0 auto 20px" }}>
              We&apos;re reviewing the first applications. Listings appear only once a business has been verified — we won&apos;t fill this page with placeholders.
            </p>
            <Link href="/for-businesses#apply" className="btn btn-primary">
              List your business
            </Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {list.map((b) => (
              <Link key={b.slug} href={`/businesses/${b.slug}`} className="card card-link">
                {b.promoted && <span className="chip chip-warning">Promoted</span>}
                <h2 style={{ fontSize: "1.2rem" }}>{b.name}</h2>
                <p className="small muted">{b.category}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
