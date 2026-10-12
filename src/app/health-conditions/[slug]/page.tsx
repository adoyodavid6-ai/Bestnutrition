import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { conditions, getCondition } from "@/content/conditions";
import { getRecipe } from "@/content/recipes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalNotice, ReferenceList, ReviewBadge, ReviewPanel, formatDate } from "@/components/Editorial";
import { RecipeCard } from "@/components/RecipeCard";
import { SaveButton, ShareButton } from "@/components/SaveButton";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return conditions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCondition(slug);
  if (!c) return {};
  return { title: `${c.title}: Nutrition Guide`, description: c.summary, alternates: { canonical: `/health-conditions/${c.slug}` } };
}

const List = ({ items }: { items: string[] }) => (
  <ul>
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

const SECTIONS = [
  ["what", "1. What it is"],
  ["can", "2. What nutrition can contribute"],
  ["cannot", "3. What nutrition cannot do"],
  ["evidence", "4. Evidence and uncertainties"],
  ["patterns", "5. Relevant eating patterns"],
  ["practical", "6. Practical food choices and recipes"],
  ["considerations", "7. Special considerations"],
  ["interactions", "8. Medication and nutrient cautions"],
  ["care", "9. When professional care is necessary"],
  ["questions", "10. Questions to ask your clinician"],
] as const;

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCondition(slug);
  if (!c) notFound();
  const recipes = c.relatedRecipes.map(getRecipe).filter(Boolean);
  const href = `/health-conditions/${c.slug}`;

  return (
    <>
      <Breadcrumbs items={[{ href: "/health-conditions", label: "Health conditions" }, { href, label: c.title }]} />
      <article>
        <header className="page-head container">
          <span className="eyebrow">{c.group}</span>
          <h1>{c.title}</h1>
          <p className="lede">{c.summary}</p>
          <div className="row" style={{ marginTop: 16 }}>
            <ReviewBadge review={c.review} />
            <span className="xs muted">Published {formatDate(c.review.published)}</span>
          </div>
          <div className="row no-print" style={{ marginTop: 16 }}>
            <SaveButton id={href} kind="article" label={c.title} />
            <ShareButton title={c.title} />
          </div>
        </header>

        <div className="container article-layout">
          <div className="prose">
            <MedicalNotice specialized={c.specialized} />
            {c.urgent && (
              <div className="callout callout-danger" style={{ marginTop: 16 }} role="note">
                <span className="callout-title">Get urgent help if you notice</span>
                <ul style={{ marginBottom: 0 }}>
                  {c.urgent.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </div>
            )}

            <section aria-labelledby="what">
              <h2 id="what">{SECTIONS[0][1]}</h2>
              {c.whatItIs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
            <section aria-labelledby="can">
              <h2 id="can">{SECTIONS[1][1]}</h2>
              <List items={c.nutritionCanHelp} />
            </section>
            <section aria-labelledby="cannot">
              <h2 id="cannot">{SECTIONS[2][1]}</h2>
              <List items={c.nutritionCannot} />
            </section>
            <section aria-labelledby="evidence">
              <h2 id="evidence">{SECTIONS[3][1]}</h2>
              <div className="two-col-list">
                <div className="card">
                  <h3>Well established</h3>
                  <List items={c.evidence.established} />
                </div>
                <div className="card card-muted">
                  <h3>Uncertain or debated</h3>
                  <List items={c.evidence.uncertain} />
                </div>
              </div>
            </section>
            <section aria-labelledby="patterns">
              <h2 id="patterns">{SECTIONS[4][1]}</h2>
              <List items={c.patterns} />
            </section>
            <section aria-labelledby="practical">
              <h2 id="practical">{SECTIONS[5][1]}</h2>
              <List items={c.practical} />
              {recipes.length > 0 && <p className="small muted">Recipes that fit these principles are shown below. They are general suggestions, not a treatment plan.</p>}
            </section>
            <section aria-labelledby="considerations">
              <h2 id="considerations">{SECTIONS[6][1]}</h2>
              <List items={c.considerations} />
            </section>
            <section aria-labelledby="interactions">
              <h2 id="interactions">{SECTIONS[7][1]}</h2>
              <div className="callout callout-warning">
                <List items={c.interactions} />
                <p className="small" style={{ marginBottom: 0 }}>
                  Never stop or change prescribed medicine because of something you read here. Ask your pharmacist about interactions with any supplement or diet change.
                </p>
              </div>
            </section>
            <section aria-labelledby="care">
              <h2 id="care">{SECTIONS[8][1]}</h2>
              <List items={c.seekCare} />
            </section>
            <section aria-labelledby="questions">
              <h2 id="questions">{SECTIONS[9][1]}</h2>
              <List items={c.askClinician} />
            </section>
            <div style={{ marginTop: 40 }}>
              <ReferenceList ids={c.references} heading="11. Authoritative references" />
            </div>
            <section aria-labelledby="review-status" style={{ marginTop: 32 }}>
              <h2 id="review-status" style={{ fontSize: "var(--fs-xl)" }}>
                12. Review status
              </h2>
              <ReviewPanel review={c.review} title="Who wrote and reviewed this guide" />
            </section>
          </div>
          <aside className="stack">
            <nav aria-label="On this page" className="card">
              <h2 style={{ fontSize: "1rem", fontFamily: "var(--font-body)", fontWeight: 700 }}>On this page</h2>
              <ul className="toc">
                {SECTIONS.map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`}>{label}</a>
                  </li>
                ))}
                <li>
                  <a href="#refs-heading">11. References</a>
                </li>
                <li>
                  <a href="#review-status">12. Review status</a>
                </li>
              </ul>
            </nav>
            <div className="card card-muted">
              <h2 style={{ fontSize: "1rem", fontFamily: "var(--font-body)", fontWeight: 700 }}>Find qualified support</h2>
              <p className="small">A registered dietitian can create a plan for your situation.</p>
              <Link href="/professionals" className="link-arrow">
                Professional directory
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {recipes.length > 0 && (
        <section className="section container" aria-labelledby="cond-recipes">
          <div className="section-head">
            <h2 id="cond-recipes">Recipes in line with these principles</h2>
          </div>
          <div className="grid grid-4">
            {recipes.map((r) => (
              <RecipeCard key={r!.slug} recipe={r!} />
            ))}
          </div>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: c.title,
          description: c.summary,
          url: absoluteUrl(href),
          about: { "@type": "MedicalCondition", name: c.title },
          datePublished: c.review.published,
          ...(c.review.lastReviewed ? { lastReviewed: c.review.lastReviewed } : {}),
          ...(c.review.reviewer ? { reviewedBy: { "@type": "Person", name: c.review.reviewer.name } } : {}),
        }}
      />
    </>
  );
}
