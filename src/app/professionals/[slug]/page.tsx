import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isFeatured, publishedProfessionals } from "@/content/directory";
import { FeaturedExtras } from "@/components/FeaturedExtras";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatDate } from "@/components/Editorial";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedProfessionals().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = publishedProfessionals().find((x) => x.slug === slug);
  return p ? { title: `${p.name}, ${p.profession}`, description: p.bio.slice(0, 155) } : { title: "Professional not found" };
}

export default async function ProfessionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = publishedProfessionals().find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <>
      <Breadcrumbs items={[{ href: "/professionals", label: "Professionals" }, { href: `/professionals/${p.slug}`, label: p.name }]} />
      <article className="container" style={{ paddingBottom: 48 }}>
        <header className="page-head" style={{ paddingLeft: 0 }}>
          {p.promoted && <span className="chip chip-warning">Promoted listing</span>}
          <h1>{p.name}</h1>
          <p className="lede">{p.profession}</p>
        </header>
        <div className="article-layout">
          <div className="prose">
            <p>{p.bio}</p>
            <h2>Specialties</h2>
            <ul>
              {p.specialties.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {isFeatured(p) && <FeaturedExtras listing={p} name={p.name} />}
            <h2>Languages</h2>
            <p>{p.languages.join(", ")}</p>
            <h2>Locations</h2>
            <p>
              {p.locations.map((l) => `${l.city}, ${l.country}`).join(" · ")}
              {p.remote ? " · Remote consultations available" : ""}
            </p>
          </div>
          <aside className="card">
            <h2 style={{ fontSize: "1rem" }}>Verified credentials</h2>
            <ul className="small">
              {p.credentials.map((c) => (
                <li key={c.registrationNumber}>
                  {c.body} — {c.registrationNumber} (verified {formatDate(c.verifiedAt)})
                </li>
              ))}
            </ul>
            {p.bookingUrl && (
              <a href={p.bookingUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                Request an appointment
              </a>
            )}
            <p className="xs muted" style={{ marginTop: 12 }}>
              <Link href="/contact?topic=correction">Report this listing</Link>
            </p>
          </aside>
        </div>
      </article>
    </>
  );
}
