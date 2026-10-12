import Link from "next/link";
import { RecipeImage } from "./RecipeImage";
import { Icon } from "./Icon";
import { COST_LABELS, DIET_LABELS, deriveRecipeMeta } from "@/lib/recipe-meta";
import { roundNutrient } from "@/lib/nutrition";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ recipe, headingLevel = 3 }: { recipe: Recipe; headingLevel?: 2 | 3 }) {
  const meta = deriveRecipeMeta(recipe);
  const H = `h${headingLevel}` as "h2" | "h3";
  const diet = meta.diets.includes("vegan") ? "vegan" : meta.diets.includes("vegetarian") ? "vegetarian" : meta.diets.includes("pescatarian") ? "pescatarian" : null;
  return (
    <Link href={`/recipes/${recipe.slug}`} className="recipe-card">
      <div className="art">
        <RecipeImage recipe={recipe} decorative />
      </div>
      <div className="body">
        <span className="cuisine">{recipe.cuisine}</span>
        <H>{recipe.title}</H>
        <div className="chip-row">
          {diet && <span className="chip chip-success">{DIET_LABELS[diet]}</span>}
          {meta.cost === 1 && <span className="chip">{COST_LABELS[1]}</span>}
          {meta.characteristics.includes("high-fibre") && <span className="chip chip-outline">High fibre</span>}
        </div>
        <div className="meta">
          <span className="row" style={{ gap: 4 }}>
            <Icon name="clock" size={14} /> {meta.totalMin} min
          </span>
          <span className="row" style={{ gap: 4 }}>
            <Icon name="users" size={14} /> Serves {recipe.servings}
          </span>
          <span>≈ {roundNutrient("kcal", meta.perServing.kcal)} kcal</span>
        </div>
      </div>
    </Link>
  );
}
