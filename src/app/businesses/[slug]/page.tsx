import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isFeatured, publishedBusinesses } from "@/content/directory";
import { FeaturedExtras } from "@/components/FeaturedExtras";
import { Breadcrumbs } from "@/components/Breadcrumbs";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedBusinesses().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = publishedBusinesses().find((x) => x.slug === slug);
  return b ? { title: b.name, description: b.description.slice(0, 155) } : { title: "Business not found" };
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = publishedBusinesses().find((x) => x.slug === slug);
  if (!b) notFound();
  return (
    <>
      <Breadcrumbs items={[{ href: "/businesses", label: "Businesses" }, { href: `/businesses/${b.slug}`, label: b.name }]} />
      <article className="container" style={{ paddingBottom: 48 }}>
        <header className="page-head" style={{ paddingLeft: 0 }}>
          {b.promoted && <span className="chip chip-warning">Promoted listing</span>}
          <span className="eyebrow">{b.category}</span>
          <h1>{b.name}</h1>
          <p className="lede">{b.description}</p>
          {isFeatured(b) && <FeaturedExtras listing={b} name={b.name} />}
        </header>
        <div className="two-col-list">
          <div className="card">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Services</h2>
            <ul>
              {b.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {b.priceInfo && <p className="small">Pricing: {b.priceInfo}</p>}
          </div>
          <div className="card card-muted">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Contact</h2>
            <p className="small">Service areas: {b.serviceAreas.join(", ")}</p>
            <p className="small">Languages: {b.languages.join(", ")}</p>
            {b.website && (
              <a href={b.website} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                Visit website
              </a>
            )}
            <p className="xs muted" style={{ marginTop: 12 }}>
              <Link href="/contact?topic=correction">Report this listing</Link>
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
