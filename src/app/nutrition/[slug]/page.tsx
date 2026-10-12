import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNutritionArticle, nutritionArticles } from "@/content/nutrition";
import { ArticleView } from "@/components/ArticleView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RecentTracker } from "@/components/RecentTracker";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return nutritionArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getNutritionArticle(slug);
  if (!a) return {};
  return { title: a.title, description: a.summary, alternates: { canonical: `/nutrition/${a.slug}` }, openGraph: { type: "article", title: a.title, description: a.summary } };
}

export default async function NutritionArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getNutritionArticle(slug);
  if (!article) notFound();
  return (
    <>
      <RecentTracker href={`/nutrition/${slug}`} title={article.title} kind="Nutrition guide" />
      <Breadcrumbs items={[{ href: "/nutrition", label: "Nutrition" }, { href: `/nutrition/${slug}`, label: article.title }]} />
      <ArticleView article={article} basePath="/nutrition" />
    </>
  );
}
