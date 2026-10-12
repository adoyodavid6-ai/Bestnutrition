import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fitnessGuides, getFitnessGuide } from "@/content/fitness";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReferenceList, ReviewBadge, ReviewPanel } from "@/components/Editorial";
import { PrintButton, SaveButton } from "@/components/SaveButton";
import { RecentTracker } from "@/components/RecentTracker";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return fitnessGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getFitnessGuide(slug);
  if (!g) return {};
  return { title: g.title, description: g.summary, alternates: { canonical: `/fitness/${g.slug}` } };
}

export default async function FitnessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getFitnessGuide(slug);
  if (!g) notFound();
  const href = `/fitness/${g.slug}`;
  return (
    <>
      <RecentTracker href={href} title={g.title} kind="Fitness guide" />
      <Breadcrumbs items={[{ href: "/fitness", label: "Fitness & wellness" }, { href, label: g.title }]} />
      <article>
        <header className="page-head container">
          <span className="eyebrow">{g.category}</span>
          <h1>{g.title}</h1>
          <p className="lede">{g.summary}</p>
          <div className="recipe-facts" style={{ maxWidth: 720 }}>
            <div>
              <strong>{g.durationMin} min</strong>Duration
            </div>
            <div>
              <strong>{g.difficulty}</strong>Level
            </div>
            <div>
              <strong style={{ fontSize: "1rem" }}>{g.equipment.join(", ")}</strong>Equipment
            </div>
          </div>
          <div className="row no-print">
            <ReviewBadge review={g.review} />
            <SaveButton id={href} kind="article" label={g.title} />
            <PrintButton />
          </div>
        </header>
        <div className="container article-layout">
          <div className="prose">
            <p>
              <strong>Who it&apos;s for:</strong> {g.audience}.
            </p>
            <h2>How to do it</h2>
            <ol className="steps">
              {g.steps.map((s) => (
                <li key={s.title}>
                  <div>
                    <strong style={{ color: "var(--violet)" }}>{s.title}</strong>
                    <p style={{ margin: "4px 0 0" }}>{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <h2>Modifications</h2>
            <ul>
              {g.modifications.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <div className="callout callout-warning" style={{ marginTop: 24 }}>
              <span className="callout-title">Safety</span>
              <ul style={{ marginBottom: 0 }}>
                {g.safety.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <p className="small muted" style={{ marginTop: 24 }}>
              Exercise supports health alongside — not instead of — balanced eating, sleep and medical care. Routines here are general and may not suit everyone.
            </p>
            <div style={{ marginTop: 32 }}>
              <ReferenceList ids={g.references} />
            </div>
          </div>
          <aside>
            <ReviewPanel review={g.review} />
          </aside>
        </div>
      </article>
    </>
  );
}
