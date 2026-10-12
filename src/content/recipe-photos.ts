import type { RecipePhoto } from "@/lib/types";

/**
 * Dish images, keyed by recipe slug. Files live in public/images/recipes/.
 * AI-generated images are labelled as such on the recipe page. Replace them with licensed
 * photography of the tested recipes when available (set kind: "photograph").
 */
export const recipePhotos: Record<string, RecipePhoto> = {};
