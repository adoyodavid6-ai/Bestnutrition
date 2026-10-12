import Link from "next/link";
import { getRecipe } from "@/content/recipes";
import type { Article } from "@/lib/types";
import { MedicalNotice, ReferenceList, ReviewBadge, ReviewPanel, formatDate } from "./Editorial";
import { RecipeCard } from "./RecipeCard";
import { SaveButton, ShareButton } from "./SaveButton";
import { JsonLd } from "./JsonLd";
import { absoluteUrl } from "@/lib/site";

const anchor = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function ArticleView({ article, basePath }: { article: Article; basePath: string }) {
  const related = (article.relatedRecipes ?? []).map(getRecipe).filter(Boolean);
  const href = `${basePath}/${article.slug}`;
  return (
    <article>
      <header className="page-head container">
        <span className="eyebrow">
          {article.category} · {article.readMin} min read
        </span>
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="row" style={{ marginTop: 16 }}>
          <ReviewBadge review={article.review} />
          <span className="xs muted">Published {formatDate(article.review.published)}</span>
        </div>
        <div className="row no-print" style={{ marginTop: 16 }}>
          <SaveButton id={href} kind="article" label={article.title} />
          <ShareButton title={article.title} />
        </div>
      </header>
      <div className="container article-layout">
        <div className="prose">
          <div className="callout callout-success" style={{ marginBottom: 32 }}>
            <span className="callout-title">Key takeaways</span>
            <ul style={{ marginBottom: 0 }}>
              {article.keyTakeaways.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
          {article.sections.map((s) => (
            <section key={s.heading} aria-labelledby={anchor(s.heading)}>
              <h2 id={anchor(s.heading)}>{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div style={{ marginTop: 40 }}>
            <MedicalNotice />
          </div>
          <div style={{ marginTop: 40 }}>
            <ReferenceList ids={article.references} />
          </div>
        </div>
        <aside className="stack">
          <nav aria-label="On this page" className="card">
            <h2 style={{ fontSize: "1rem", fontFamily: "var(--font-body)", fontWeight: 700 }}>On this page</h2>
            <ul className="toc">
              {article.sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${anchor(s.heading)}`}>{s.heading}</a>
                </li>
              ))}
              <li>
                <a href="#refs-heading">References</a>
              </li>
            </ul>
          </nav>
          <ReviewPanel review={article.review} />
        </aside>
      </div>
      {related.length > 0 && (
        <section className="section container" aria-labelledby="related-recipes">
          <div className="section-head">
            <h2 id="related-recipes">Put it into practice</h2>
            <Link href="/recipes" className="link-arrow">
              All recipes
            </Link>
          </div>
          <div className="grid grid-3">
            {related.map((r) => (
              <RecipeCard key={r!.slug} recipe={r!} />
            ))}
          </div>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.summary,
          datePublished: article.review.published,
          ...(article.review.lastReviewed ? { dateModified: article.review.lastReviewed } : {}),
          author: { "@type": "Organization", name: article.review.author },
          publisher: { "@type": "Organization", name: "NourishWell" },
          mainEntityOfPage: absoluteUrl(href),
        }}
      />
    </article>
  );
}
