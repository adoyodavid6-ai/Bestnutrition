import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { SearchTracker } from "@/components/SearchTracker";
import { buildSearchIndex, searchDocs } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search NourishWell recipes, nutrition guides, health-condition guides, supplements and fitness resources.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

const index = buildSearchIndex();
const SUGGESTIONS = ["chili", "curry", "breakfast", "salmon", "Thai", "high blood pressure", "fibre", "vitamin D", "walking", "budget"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q = "", type } = await searchParams;
  const query = q.slice(0, 120);
  const all = query ? searchDocs(index, query) : [];
  const types = Array.from(new Set(all.map((r) => r.type)));
  const results = type ? all.filter((r) => r.type === type) : all;

  return (
    <>
      <Breadcrumbs items={[{ href: "/search", label: "Search" }]} />
      <PageHead eyebrow="Search" title={query ? `Results for “${query}”` : "Search NourishWell"} />
      <div className="container container-narrow" style={{ paddingBottom: 48, marginLeft: "auto", marginRight: "auto" }}>
        <form role="search" action="/search" className="search-form" style={{ marginBottom: 24 }}>
          <label htmlFor="search-q" className="sr-only">
            Search
          </label>
          <input id="search-q" name="q" type="search" className="input" defaultValue={query} placeholder="Recipes, ingredients, health topics…" autoFocus={!query} />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
        {query && <SearchTracker />}

        {!query && (
          <div>
            <p className="muted">Popular searches:</p>
            <div className="chip-row">
              {SUGGESTIONS.map((s) => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="chip chip-outline" style={{ textDecoration: "none" }}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
        )}

        {query && types.length > 1 && (
          <nav aria-label="Filter results by type" className="chip-row" style={{ marginBottom: 16 }}>
            <Link href={`/search?q=${encodeURIComponent(query)}`} className={`chip ${!type ? "chip-violet" : "chip-outline"}`} style={{ textDecoration: "none" }} aria-current={!type ? "page" : undefined}>
              All ({all.length})
            </Link>
            {types.map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(t)}`}
                className={`chip ${type === t ? "chip-violet" : "chip-outline"}`}
                style={{ textDecoration: "none" }}
                aria-current={type === t ? "page" : undefined}
              >
                {t} ({all.filter((r) => r.type === t).length})
              </Link>
            ))}
          </nav>
        )}

        {query && (
          <p role="status" className="muted">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        )}

        {query && results.length === 0 && (
          <div className="empty-state">
            <h2>Nothing found for “{query}”</h2>
            <p className="muted">Check the spelling, try a broader word (such as “beans” instead of “rosecoco beans”), or browse the recipe library.</p>
            <Link className="btn btn-primary" href="/recipes">
              Browse recipes
            </Link>
          </div>
        )}

        <ol style={{ listStyle: "none", padding: 0 }}>
          {results.map((r) => (
            <li key={r.href} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)", margin: 0 }}>
              <span className="eyebrow" style={{ marginBottom: 4 }}>
                {r.type}
              </span>
              <h2 style={{ fontSize: "1.25rem", marginBottom: 6 }}>
                <Link href={r.href}>{r.title}</Link>
              </h2>
              <p className="small muted" style={{ margin: 0 }}>
                {r.summary}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
