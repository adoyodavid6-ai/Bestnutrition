# Content & nutrition data guide

All content is typed TypeScript in `src/content/`. Every change goes through a pull request, which gives an auditable history until the database CMS arrives.

## Adding a recipe

1. Make sure every ingredient exists in `src/content/ingredients.ts`. A new ingredient needs:
   - Per-100 g values (kcal, protein, carbohydrate, fat, saturated fat, fibre, sodium) from **USDA FoodData Central** or a national food composition table (FAO/INFOODS). Put the exact entry name in `source.description`.
   - A `proxy` note if you're using a similar food (e.g. plantain for matoke).
   - `allergens`, `animal`, a relative `cost` (1–3), regional `altNames`, and a display `color`.
2. Add the recipe to `src/content/recipes.ts`. Every line needs `qty`, `unit` and **`grams`** (the weight used for nutrition). Mark garnishes as `optional: true`.
3. Include: equipment, numbered steps, tips, substitutions, storage and reheating, `foodSafety` wherever there's a real risk (poultry, eggs, rice, raw beans, fish), `goals`, and `review`.
4. Don't write health claims in the intro unless you add `references` that support them.
5. Run `npm test`. The tests check that ingredients resolve, recipes are complete, per-serving energy is plausible, references resolve, and there's no cure language.

Dietary tags, allergens, nutrition and cost are **calculated automatically**. Never type them by hand.

## Nutrition data status

Every value is currently a **calculated estimate**. Before changing a recipe's data status to verified:

- Re-check each ingredient against the current FoodData Central entry and record the FDC ID (the `ingredient_nutrients.source_id` column in the schema).
- For laboratory-verified values, store them separately with `data_status = 'verified_measurement'`. Never overwrite the estimate silently.

## Photography

The site currently uses illustrations generated from each recipe's real ingredients (`components/FoodArt.tsx`). To add photography:

- Use only images you own or have licensed, and keep the licence on file.
- Shoot in natural daylight with tactile ingredients and diverse hands and people. Avoid before-and-after or fear imagery.
- Set `recipe.photo = { src, alt, credit, width, height }`, with descriptive alt text (what the dish looks like, not "image of food").
- Adding a photo also enables `Recipe` structured data for that recipe.

## Writing health guides

Follow the editorial policy (`/editorial-policy`). In short:

- **Condition guides** must fill all 12 parts: what it is; what nutrition can contribute; what it cannot do; established evidence and uncertainties; eating patterns; practical choices; special considerations; medication cautions; when to seek care (plus urgent signs); questions for a clinician; references; review status.
- Mark `specialized: true` for conditions that need clinical supervision (kidney disease, diabetes on medication, cancer treatment, pregnancy, coeliac disease, eating disorders).
- **Never** record a `reviewer` unless that person actually reviewed the page, and always add `lastReviewed` with it.
- Cite only sources you have opened. Prefer public-health agencies, national health services, clinical guidelines and systematic reviews.

## References

Add sources to `src/content/references.ts` (HTTPS only), then cite them by `id`. `/admin` lists every reference and how many pages use it. Re-check URLs at each review.
