import type { RecipePhoto } from "@/lib/types";
import data from "./recipe-photos.json";

/**
 * Dish images, keyed by recipe slug. Files live in public/images/recipes/; entries are kept in
 * recipe-photos.json. AI-generated images are labelled as such on the recipe page. Recipes
 * without an entry show their ingredient illustration.
 */
export const recipePhotos: Record<string, RecipePhoto> = data as Record<string, RecipePhoto>;
