import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes, getRecipe } from "@/content/recipes";
import { getIngredient } from "@/content/ingredients";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RecipeImage } from "@/components/RecipeImage";
import { RecipeCard } from "@/components/RecipeCard";
import { ReferenceList, ReviewPanel } from "@/components/Editorial";
import { JsonLd } from "@/components/JsonLd";
import { PrintButton, SaveButton, ShareButton } from "@/components/SaveButton";
import { RecentTracker } from "@/components/RecentTracker";
import { RecipeIngredients } from "@/components/recipe/RecipeIngredients";
import { AddToPlan } from "@/components/recipe/AddToPlan";
import { NutritionPanel } from "@/components/recipe/NutritionPanel";
import { ALLERGEN_LABELS, COST_LABELS, DIET_LABELS, deriveRecipeMeta } from "@/lib/recipe-meta";
import { CHARACTERISTIC_LABELS, roundNutrient } from "@/lib/nutrition";
import { absoluteUrl } from "@/lib/site";
import { formatQuantity } from "@/lib/units";

// Only prerendered slugs exist; unknown slugs return a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRecipe(slug);
  if (!r) return {};
  const description = r.intro.length > 155 ? `${r.intro.slice(0, 152).trimEnd()}…` : r.intro;
  return {
    title: `${r.title} Recipe`,
    description,
    alternates: { canonical: `/recipes/${r.slug}` },
    openGraph: { type: "article", title: r.title, description, url: `/recipes/${r.slug}` },
  };
}

const iso = (min: number) => `PT${Math.floor(min / 60) ? `${Math.floor(min / 60)}H` : ""}${min % 60 ? `${min % 60}M` : min === 0 ? "0M" : ""}`;

function relatedTo(slug: string) {
  const r = getRecipe(slug)!;
  const ids = new Set(r.ingredients.map((l) => l.id));
  return recipes
    .filter((o) => o.slug !== slug)
    .map((o) => ({ o, score: (o.region === r.region ? 2 : 0) + o.ingredients.filter((l) => ids.has(l.id)).length * 0.5 + o.categories.filter((c) => r.categories.includes(c)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.o);
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();
  const meta = deriveRecipeMeta(recipe);
  const related = relatedTo(slug);
  const shownDiets = meta.diets.filter((d) => d !== "egg-free" && d !== "nut-free" && !(d === "vegetarian" && meta.diets.includes("vegan")) && !(d === "pescatarian" && meta.diets.includes("vegetarian")));

  return (
    <>
      <RecentTracker href={`/recipes/${recipe.slug}`} title={recipe.title} kind="Recipe" event="recipe_view" />
      <Breadcrumbs items={[{ href: "/recipes", label: "Recipes" }, { href: `/recipes/${recipe.slug}`, label: recipe.title }]} />
      <article>
        <div className="container recipe-hero">
          <div>
            <span className="eyebrow">
              {recipe.cuisine} · {recipe.region}
            </span>
            <h1 style={{ fontSize: "var(--fs-3xl)" }}>{recipe.title}</h1>
            <p className="lede">{recipe.intro}</p>
            <div className="chip-row" style={{ marginTop: 16 }}>
              {shownDiets.map((d) => (
                <span key={d} className="chip chip-success">
                  {DIET_LABELS[d]}
                </span>
              ))}
              <span className="chip">{COST_LABELS[meta.cost]}</span>
              {meta.characteristics.map((c) => (
                <span key={c} className="chip chip-outline">
                  {CHARACTERISTIC_LABELS[c]}
                </span>
              ))}
            </div>
            <div className="recipe-facts">
              <div>
                <strong>{recipe.prepMin} min</strong>Prep
              </div>
              <div>
                <strong>{recipe.cookMin} min</strong>Cook
              </div>
              <div>
                <strong>{meta.totalMin} min</strong>Total
              </div>
              <div>
                <strong>{recipe.servings}</strong>Servings
              </div>
              <div>
                <strong style={{ textTransform: "capitalize" }}>{recipe.difficulty}</strong>Difficulty
              </div>
              <div>
                <strong>≈ {roundNutrient("kcal", meta.perServing.kcal)}</strong>kcal / serving
              </div>
            </div>
            <div className="row no-print">
              <SaveButton id={recipe.slug} kind="recipe" label={recipe.title} />
              <ShareButton title={recipe.title} text={recipe.intro} />
              <PrintButton />
              <AddToPlan recipe={recipe} />
            </div>
          </div>
          <figure style={{ margin: 0 }}>
            <div className="art-frame" style={{ aspectRatio: "4 / 3", position: "relative" }}>
              <RecipeImage recipe={recipe} priority sizes="(max-width: 960px) 100vw, 50vw" />
            </div>
            <figcaption className="xs muted" style={{ marginTop: 8 }}>
              {!recipe.photo
                ? "Illustration generated from this recipe's ingredients."
                : recipe.photo.kind === "ai-generated"
                  ? `AI-generated image of the dish (${recipe.photo.credit}). Your cooked dish may look different.`
                  : `Photo: ${recipe.photo.credit}`}
            </figcaption>
          </figure>
        </div>

        {recipe.restMin ? (
          <div className="container" style={{ marginBottom: 24 }}>
            <div className="callout callout-info">
              <span className="callout-title">Plan ahead: about {recipe.restMin >= 60 ? `${Math.round(recipe.restMin / 60)} hours` : `${recipe.restMin} minutes`} of hands-off time</span>
              <p className="small">{recipe.restNote}</p>
            </div>
          </div>
        ) : null}

        <div className="container recipe-layout">
          <div className="sticky">
            <div className="card">
              <RecipeIngredients recipe={recipe} />
            </div>
            <div className="card card-muted" style={{ marginTop: 16 }}>
              <h2 style={{ fontSize: "1rem", fontFamily: "var(--font-body)", fontWeight: 700 }}>Allergens</h2>
              {meta.allergens.length ? (
                <p className="small">
                  <strong>Contains:</strong> {meta.allergens.map((a) => ALLERGEN_LABELS[a]).join(", ")}.
                </p>
              ) : (
                <p className="small">None of the major allergens we track appear in the listed ingredients.</p>
              )}
              <p className="xs muted" style={{ marginBottom: 0 }}>
                Derived from the ingredient list (including optional items). Always check the labels of packaged ingredients — products such as stock, spice blends and soy sauce can contain
                allergens or be cross-contaminated. *Oats are flagged for gluten unless certified gluten-free.
              </p>
            </div>
          </div>

          <div>
            <section aria-labelledby="equipment-heading">
              <h2 id="equipment-heading" style={{ fontSize: "var(--fs-xl)" }}>
                Equipment
              </h2>
              <ul>
                {recipe.equipment.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="method-heading">
              <h2 id="method-heading" style={{ fontSize: "var(--fs-xl)", marginTop: 32 }}>
                Method
              </h2>
              <ol className="steps">
                {recipe.steps.map((s, i) => (
                  <li key={i}>
                    <p style={{ margin: 0 }}>{s}</p>
                  </li>
                ))}
              </ol>
            </section>

            {recipe.foodSafety && (
              <div className="callout callout-warning" style={{ marginBottom: 32 }}>
                <span className="callout-title">Food safety</span>
                <p className="small">{recipe.foodSafety}</p>
              </div>
            )}

            {recipe.tips.length > 0 && (
              <section aria-labelledby="tips-heading">
                <h2 id="tips-heading" style={{ fontSize: "var(--fs-xl)" }}>
                  Cook&apos;s tips
                </h2>
                <ul>
                  {recipe.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="subs-heading" style={{ marginTop: 32 }}>
              <h2 id="subs-heading" style={{ fontSize: "var(--fs-xl)" }}>
                Substitutions
              </h2>
              <div className="table-scroll">
                <table className="data-table" style={{ fontSize: "var(--fs-sm)" }}>
                  <thead>
                    <tr>
                      <th scope="col">Instead of</th>
                      <th scope="col">Use</th>
                      <th scope="col">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.substitutions.map((s) => (
                      <tr key={s.swap + s.with}>
                        <td>{s.swap}</td>
                        <td>{s.with}</td>
                        <td className="muted">{s.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="xs muted" style={{ marginTop: 8 }}>
                Substitutions change the nutrition estimates, allergens and dietary tags shown on this page.
              </p>
            </section>

            <section aria-labelledby="storage-heading" style={{ marginTop: 32 }}>
              <h2 id="storage-heading" style={{ fontSize: "var(--fs-xl)" }}>
                Storage &amp; reheating
              </h2>
              <p>{recipe.storage}</p>
            </section>

            <div style={{ marginTop: 32 }}>
              <NutritionPanel recipe={recipe} />
            </div>

            <div className="row" style={{ marginTop: 16 }}>
              <Link href={`/recipes/compare?a=${recipe.slug}&b=${related[0]?.slug ?? ""}`} className="link-arrow small">
                Compare with another recipe
              </Link>
            </div>

            <div style={{ marginTop: 32 }}>
              <ReviewPanel review={recipe.review} title="Recipe information" />
            </div>

            {recipe.references && (
              <div style={{ marginTop: 32 }}>
                <ReferenceList ids={recipe.references} heading="Sources for health information on this page" />
              </div>
            )}
          </div>
        </div>
      </article>

      <section className="section container no-print" aria-labelledby="related-heading">
        <div className="section-head">
          <h2 id="related-heading">You might also like</h2>
          <Link href="/recipes" className="link-arrow">
            All recipes
          </Link>
        </div>
        <div className="grid grid-3">
          {related.map((r) => (
            <RecipeCard key={r.slug} recipe={r} />
          ))}
        </div>
      </section>

      {/* Recipe rich-result markup requires a real photo of the dish; only emitted once one exists. */}
      {recipe.photo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Recipe",
            name: recipe.title,
            description: recipe.intro,
            image: [absoluteUrl(recipe.photo.src)],
            author: { "@type": "Organization", name: recipe.review.author },
            datePublished: recipe.review.published,
            prepTime: iso(recipe.prepMin),
            cookTime: iso(recipe.cookMin),
            totalTime: iso(meta.totalMin),
            recipeYield: `${recipe.servings} servings`,
            recipeCategory: recipe.categories[0],
            recipeCuisine: recipe.cuisine,
            keywords: [recipe.cuisine, ...meta.diets].join(", "),
            recipeIngredient: recipe.ingredients.map((l) => `${formatQuantity(l.qty, l.unit, "metric")} ${getIngredient(l.id).name}${l.note ? `, ${l.note}` : ""}`),
            recipeInstructions: recipe.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
            nutrition: {
              "@type": "NutritionInformation",
              servingSize: "1 serving",
              calories: `${roundNutrient("kcal", meta.perServing.kcal)} calories`,
              proteinContent: `${roundNutrient("protein", meta.perServing.protein)} g`,
              carbohydrateContent: `${roundNutrient("carbs", meta.perServing.carbs)} g`,
              fatContent: `${roundNutrient("fat", meta.perServing.fat)} g`,
              saturatedFatContent: `${roundNutrient("satFat", meta.perServing.satFat)} g`,
              fiberContent: `${roundNutrient("fiber", meta.perServing.fiber)} g`,
              sodiumContent: `${roundNutrient("sodium", meta.perServing.sodium)} mg`,
            },
          }}
        />
      )}
    </>
  );
}
