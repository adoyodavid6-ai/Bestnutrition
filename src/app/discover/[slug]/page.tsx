import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, collectionRecipes, getCollection } from "@/content/collections";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { RecipeCard } from "@/components/RecipeCard";
import { SponsorLabel } from "@/components/marketing/Disclosure";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/discover/${c.slug}` } };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();
  const items = collectionRecipes(c);
  return (
    <>
      <Breadcrumbs items={[{ href: "/discover", label: "Discover" }, { href: `/discover/${c.slug}`, label: c.title }]} />
      <PageHead eyebrow={`${items.length} recipes`} title={c.title} lede={c.description}>
        {c.sponsor && <SponsorLabel sponsor={c.sponsor} />}
      </PageHead>
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="grid grid-3">
          {items.map((r) => (
            <RecipeCard key={r.slug} recipe={r} headingLevel={2} />
          ))}
        </div>
      </div>
    </>
  );
}
