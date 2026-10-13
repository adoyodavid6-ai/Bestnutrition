import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupplement, supplements } from "@/content/supplements";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterCTA } from "@/components/marketing/NewsletterCTA";
import { MedicalNotice, ReferenceList, ReviewBadge, ReviewPanel } from "@/components/Editorial";
import { SaveButton } from "@/components/SaveButton";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return supplements.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSupplement(slug);
  if (!s) return {};
  return { title: `${s.name}: Evidence, Risks & Interactions`, description: s.summary, alternates: { canonical: `/supplements/${s.slug}` } };
}

const Block = ({ id, title, items, tone }: { id: string; title: string; items: string[]; tone?: "warning" | "danger" | "info" }) => (
  <section aria-labelledby={id} style={{ marginTop: 32 }}>
    <h2 id={id} style={{ fontSize: "var(--fs-xl)" }}>
      {title}
    </h2>
    <div className={tone ? `callout callout-${tone}` : undefined}>
      <ul style={{ marginBottom: 0 }}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default async function SupplementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSupplement(slug);
  if (!s) notFound();
  const href = `/supplements/${s.slug}`;
  return (
    <>
      <Breadcrumbs items={[{ href: "/supplements", label: "Supplements" }, { href, label: s.name }]} />
      <article>
        <header className="page-head container">
          <span className="eyebrow">{s.type}</span>
          <h1>{s.name}</h1>
          <p className="lede">{s.summary}</p>
          <div className="row" style={{ marginTop: 16 }}>
            <ReviewBadge review={s.review} />
            <span className="chip chip-outline">Evidence: {s.evidence.strength}</span>
            <SaveButton id={href} kind="article" label={s.name} />
          </div>
        </header>
        <div className="container article-layout">
          <div className="prose">
            <MedicalNotice />
            <Block id="role" title="What it does" items={s.role} />
            <Block id="food" title="Food sources" items={s.foodSources} />
            <section aria-labelledby="evidence" style={{ marginTop: 32 }}>
              <h2 id="evidence" style={{ fontSize: "var(--fs-xl)" }}>
                Strength of evidence: {s.evidence.strength.toLowerCase()}
              </h2>
              <ul>
                {s.evidence.summary.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
            <Block id="uses" title="When it may be useful" items={s.useCases} />
            <Block id="risks" title="Risks and side effects" items={s.risks} tone="warning" />
            <Block id="interactions" title="Drug interactions and contraindications" items={s.interactions} tone="warning" />
            <Block id="limits" title="Safety limits" items={s.safetyLimits} tone="info" />
            <Block id="quality" title="Choosing a quality product" items={s.quality} />
            <Block id="ask" title="Talk to a professional first if" items={s.askProfessional} tone="danger" />
            <div style={{ marginTop: 40 }}>
              <ReferenceList ids={s.references} />
            </div>
          </div>
          <aside>
            <ReviewPanel review={s.review} />
          </aside>
        </div>
      </article>
      {/* Generic source: sign-ups never record which guide someone read. */}
      <div className="container">
        <NewsletterCTA source="article" heading="Practical nutrition, once a week" text="A seasonal meal plan, new recipes and one evidence-informed tip. No miracle claims." />
      </div>
    </>
  );
}
