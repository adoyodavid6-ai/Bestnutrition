import Image from "next/image";
import { FoodArt } from "./FoodArt";
import type { Recipe } from "@/lib/types";

/**
 * The image for a recipe: its photo when one exists, otherwise the ingredient illustration.
 * The parent must be positioned and sized (e.g. .art, .art-frame, .thumb).
 */
export function RecipeImage({ recipe, decorative = false, priority = false, sizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" }: { recipe: Recipe; decorative?: boolean; priority?: boolean; sizes?: string }) {
  if (!recipe.photo) return <FoodArt recipe={recipe} decorative={decorative} />;
  return <Image src={recipe.photo.src} alt={decorative ? "" : recipe.photo.alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />;
}
