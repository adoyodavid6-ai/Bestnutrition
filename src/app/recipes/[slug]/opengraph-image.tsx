import { getRecipe, recipes } from "@/content/recipes";
import { OG_SIZE, ogCard } from "@/lib/og";
import { calculateRecipeNutrition } from "@/lib/nutrition";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "NourishWell recipe";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRecipe(slug);
  if (!r) return ogCard({ eyebrow: "Recipe", title: "NourishWell recipes" });
  const n = calculateRecipeNutrition(r).perServing;
  return ogCard({
    eyebrow: `${r.cuisine} recipe`,
    title: r.title,
    facts: [`${r.prepMin + r.cookMin} min`, `≈${Math.round(n.kcal / 10) * 10} kcal`, `${Math.round(n.protein)} g protein`],
    footer: "Nutrition is estimated from the ingredients — see the recipe for details.",
  });
}
