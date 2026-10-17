import type { Ingredient, Nutrients } from "@/lib/types";

/**
 * Ingredient reference table.
 *
 * Values are per 100 g, rounded, and compiled from USDA FoodData Central (SR Legacy /
 * Foundation Foods) entries named in `source.description`. Where no direct entry exists
 * for a regional food, a clearly labelled proxy is used. Editors must re-check each value
 * against FoodData Central (or a national food composition table via FAO/INFOODS) before
 * the nutrition panel is marked as verified.
 */
const n = (kcal: number, protein: number, carbs: number, fat: number, satFat: number, fiber: number, sodium: number): Nutrients => ({
  kcal,
  protein,
  carbs,
  fat,
  satFat,
  fiber,
  sodium,
});

const fdc = (description: string, proxy?: string) => ({ database: "USDA FoodData Central" as const, description, proxy });

export const ingredients: Ingredient[] = [
  // ---------- Grains & starches ----------
  { id: "maize-flour", name: "White maize flour (unga)", altNames: ["cornmeal", "unga wa mahindi", "sifted maize meal"], category: "grains", per100g: n(362, 8.1, 76.9, 3.6, 0.5, 7.3, 35), source: fdc("Cornmeal, whole-grain, white"), cost: 1, color: "#efe3c2" },
  { id: "millet-flour", name: "Millet flour", altNames: ["wimbi flour (finger millet)", "bajra"], category: "grains", per100g: n(382, 10.8, 75.1, 4.2, 0.7, 3.5, 4), source: fdc("Millet flour"), cost: 1, color: "#b98d6a" },
  { id: "sorghum-flour", name: "Sorghum flour", altNames: ["mtama", "jowar"], category: "grains", per100g: n(359, 8.4, 76.6, 3.3, 0.6, 6.7, 3), source: fdc("Sorghum flour, whole-grain"), cost: 1, color: "#c9a27b" },
  { id: "wholewheat-flour", name: "Whole-wheat flour", altNames: ["atta", "brown flour"], category: "grains", per100g: n(340, 13.2, 72, 2.5, 0.4, 10.7, 2), source: fdc("Flour, whole wheat, unenriched"), allergens: ["gluten"], cost: 1, color: "#c49a6c" },
  { id: "plain-flour", name: "Plain (all-purpose) flour", altNames: ["maida", "white flour"], category: "grains", per100g: n(364, 10.3, 76.3, 1.0, 0.2, 2.7, 2), source: fdc("Wheat flour, white, all-purpose, enriched, unbleached"), allergens: ["gluten"], cost: 1, color: "#f2ece0" },
  { id: "teff-flour", name: "Teff flour", category: "grains", per100g: n(367, 13.3, 73.1, 2.4, 0.4, 8.0, 12), source: fdc("Teff, uncooked"), cost: 2, color: "#8a6247" },
  { id: "rolled-oats", name: "Rolled oats", category: "grains", per100g: n(379, 13.2, 67.7, 6.5, 1.1, 10.1, 6), source: fdc("Oats, whole grain, rolled, old fashioned"), allergens: ["gluten"], cost: 1, color: "#e2cfa4" },
  { id: "white-rice", name: "Long-grain white rice (uncooked)", altNames: ["basmati", "pishori"], category: "grains", per100g: n(365, 7.1, 80, 0.7, 0.2, 1.3, 5), source: fdc("Rice, white, long-grain, regular, raw, enriched"), cost: 1, color: "#f6f2e7" },
  { id: "brown-rice", name: "Brown rice (uncooked)", category: "grains", per100g: n(370, 7.9, 77.2, 2.9, 0.6, 3.5, 7), source: fdc("Rice, brown, long-grain, raw"), cost: 2, color: "#c8a878" },
  { id: "quinoa", name: "Quinoa (uncooked)", category: "grains", per100g: n(368, 14.1, 64.2, 6.1, 0.7, 7.0, 5), source: fdc("Quinoa, uncooked"), cost: 3, color: "#e9d9b4" },
  { id: "bulgur", name: "Bulgur wheat (dry)", category: "grains", per100g: n(342, 12.3, 75.9, 1.3, 0.2, 12.5, 17), source: fdc("Bulgur, dry"), allergens: ["gluten"], cost: 2, color: "#d4b483" },
  { id: "wholewheat-bread", name: "Whole-wheat bread", category: "grains", per100g: n(252, 12.4, 42.7, 3.5, 0.7, 6.0, 450), source: fdc("Bread, whole-wheat, commercially prepared"), allergens: ["gluten"], cost: 1, color: "#a8764c" },
  { id: "wholewheat-pita", name: "Whole-wheat pita", category: "grains", per100g: n(266, 9.8, 55, 2.6, 0.4, 7.4, 527), source: fdc("Bread, pita, whole-wheat"), allergens: ["gluten"], cost: 2, color: "#c79a68" },
  { id: "corn-tortilla", name: "Corn tortillas", category: "grains", per100g: n(218, 5.7, 44.6, 2.9, 0.4, 6.3, 45), source: fdc("Tortillas, ready-to-bake or -fry, corn"), cost: 2, color: "#e8c77d" },
  { id: "sweet-corn", name: "Maize kernels (cooked)", altNames: ["mahindi", "corn"], category: "grains", per100g: n(96, 3.4, 21, 1.5, 0.2, 2.4, 1), source: fdc("Corn, sweet, yellow, cooked, boiled, drained, without salt", "Sweet corn used as proxy for boiled dried maize"), cost: 1, color: "#f0c64a" },
  { id: "yeast", name: "Instant dried yeast", category: "pantry", per100g: n(325, 40.4, 41.2, 7.6, 1.0, 26.9, 51), source: fdc("Leavening agents, yeast, baker's, active dry"), cost: 1, color: "#d9c9a3" },

  // ---------- Starchy produce ----------
  { id: "sweet-potato", name: "Sweet potato", altNames: ["viazi vitamu"], category: "produce", per100g: n(86, 1.6, 20.1, 0.1, 0, 3.0, 55), source: fdc("Sweet potato, raw, unprepared"), cost: 1, color: "#d9733b" },
  { id: "potato", name: "Potato", altNames: ["waru", "viazi"], category: "produce", per100g: n(77, 2.0, 17.5, 0.1, 0, 2.2, 6), source: fdc("Potatoes, flesh and skin, raw"), cost: 1, color: "#e6cf97" },
  { id: "plantain", name: "Green bananas (matoke) or plantain", altNames: ["matoke", "ndizi mbichi"], category: "produce", per100g: n(122, 1.3, 31.9, 0.4, 0.1, 2.3, 4), source: fdc("Plantains, green, raw", "Plantain used as proxy for East African cooking bananas"), cost: 1, color: "#a9b55a" },
  { id: "cassava", name: "Cassava", altNames: ["muhogo", "yuca"], category: "produce", per100g: n(160, 1.4, 38.1, 0.3, 0.1, 1.8, 14), source: fdc("Cassava, raw"), cost: 1, color: "#efe6d0" },
  { id: "butternut", name: "Butternut squash or pumpkin", altNames: ["malenge"], category: "produce", per100g: n(45, 1.0, 11.7, 0.1, 0, 2.0, 4), source: fdc("Squash, winter, butternut, raw"), cost: 1, color: "#e8923a" },

  // ---------- Vegetables ----------
  { id: "collards", name: "Collard greens (sukuma wiki)", altNames: ["sukuma wiki", "kale (collards)"], category: "produce", per100g: n(32, 3.0, 5.4, 0.6, 0.1, 4.0, 17), source: fdc("Collards, raw"), cost: 1, color: "#3f6b3a" },
  { id: "kale", name: "Kale", category: "produce", per100g: n(49, 4.3, 8.8, 0.9, 0.1, 3.6, 38), source: fdc("Kale, raw"), cost: 2, color: "#2f5a35" },
  { id: "spinach", name: "Spinach", altNames: ["mchicha (amaranth) can be used"], category: "produce", per100g: n(23, 2.9, 3.6, 0.4, 0.1, 2.2, 79), source: fdc("Spinach, raw"), cost: 1, color: "#3c7a3f" },
  { id: "cabbage", name: "Cabbage", altNames: ["kabichi"], category: "produce", per100g: n(25, 1.3, 5.8, 0.1, 0, 2.5, 18), source: fdc("Cabbage, raw"), cost: 1, color: "#b7cf8d" },
  { id: "onion", name: "Onion", altNames: ["kitunguu"], category: "produce", per100g: n(40, 1.1, 9.3, 0.1, 0, 1.7, 4), source: fdc("Onions, raw"), cost: 1, color: "#d8b5c8" },
  { id: "red-onion", name: "Red onion", category: "produce", per100g: n(40, 1.1, 9.3, 0.1, 0, 1.7, 4), source: fdc("Onions, raw"), cost: 1, color: "#8e3b63" },
  { id: "spring-onion", name: "Spring onions", altNames: ["scallions", "green onions"], category: "produce", per100g: n(32, 1.8, 7.3, 0.2, 0, 2.6, 16), source: fdc("Onions, spring or scallions, raw"), cost: 1, color: "#6f9e4c" },
  { id: "tomato", name: "Tomato", altNames: ["nyanya"], category: "produce", per100g: n(18, 0.9, 3.9, 0.2, 0, 1.2, 5), source: fdc("Tomatoes, red, ripe, raw"), cost: 1, color: "#d2412f" },
  { id: "garlic", name: "Garlic", altNames: ["kitunguu saumu"], category: "produce", per100g: n(149, 6.4, 33.1, 0.5, 0.1, 2.1, 17), source: fdc("Garlic, raw"), cost: 1, color: "#f1ead9" },
  { id: "ginger", name: "Fresh ginger", altNames: ["tangawizi"], category: "produce", per100g: n(80, 1.8, 17.8, 0.8, 0.2, 2.0, 13), source: fdc("Ginger root, raw"), cost: 1, color: "#d9b67c" },
  { id: "carrot", name: "Carrot", category: "produce", per100g: n(41, 0.9, 9.6, 0.2, 0, 2.8, 69), source: fdc("Carrots, raw"), cost: 1, color: "#e6812c" },
  { id: "red-pepper", name: "Red bell pepper", altNames: ["capsicum", "pilipili hoho"], category: "produce", per100g: n(31, 1.0, 6.0, 0.3, 0, 2.1, 4), source: fdc("Peppers, sweet, red, raw"), cost: 2, color: "#c8352a" },
  { id: "green-chilli", name: "Green chilli", altNames: ["pilipili"], category: "produce", per100g: n(40, 2.0, 9.5, 0.2, 0, 1.5, 7), source: fdc("Peppers, hot chili, green, raw"), cost: 1, color: "#4f8a2e" },
  { id: "cucumber", name: "Cucumber", category: "produce", per100g: n(15, 0.7, 3.6, 0.1, 0, 0.5, 2), source: fdc("Cucumber, with peel, raw"), cost: 1, color: "#8fbf6a" },
  { id: "lettuce", name: "Romaine lettuce", category: "produce", per100g: n(17, 1.2, 3.3, 0.3, 0, 2.1, 8), source: fdc("Lettuce, cos or romaine, raw"), cost: 2, color: "#9cc46b" },
  { id: "celery", name: "Celery", category: "produce", per100g: n(14, 0.7, 3.0, 0.2, 0, 1.6, 80), source: fdc("Celery, raw"), cost: 1, color: "#a9c77a" },
  { id: "leek", name: "Leeks", category: "produce", per100g: n(61, 1.5, 14.2, 0.3, 0, 1.8, 20), source: fdc("Leeks, (bulb and lower leaf-portion), raw"), cost: 2, color: "#b9cf8e" },
  { id: "bok-choy", name: "Bok choy (pak choi)", category: "produce", per100g: n(13, 1.5, 2.2, 0.2, 0, 1.0, 65), source: fdc("Cabbage, chinese (pak-choi), raw"), cost: 2, color: "#5d9a4a" },
  { id: "broccoli", name: "Broccoli", category: "produce", per100g: n(34, 2.8, 6.6, 0.4, 0, 2.6, 33), source: fdc("Broccoli, raw"), cost: 2, color: "#3e7c3c" },
  { id: "cauliflower", name: "Cauliflower", category: "produce", per100g: n(25, 1.9, 5.0, 0.3, 0.1, 2.0, 30), source: fdc("Cauliflower, raw"), cost: 2, color: "#efe9d6" },
  { id: "green-beans", name: "Green beans", altNames: ["French beans"], category: "produce", per100g: n(31, 1.8, 7.0, 0.2, 0, 2.7, 6), source: fdc("Beans, snap, green, raw"), cost: 1, color: "#5c9a3d" },
  { id: "peas", name: "Green peas (frozen)", category: "produce", per100g: n(77, 5.2, 13.6, 0.4, 0.1, 4.5, 108), source: fdc("Peas, green, frozen, unprepared"), cost: 1, color: "#7cb342" },
  { id: "mushrooms", name: "Mushrooms", category: "produce", per100g: n(22, 3.1, 3.3, 0.3, 0, 1.0, 5), source: fdc("Mushrooms, white, raw"), cost: 2, color: "#bfa98e" },
  { id: "zucchini", name: "Courgette (zucchini)", category: "produce", per100g: n(17, 1.2, 3.1, 0.3, 0.1, 1.0, 8), source: fdc("Squash, summer, zucchini, includes skin, raw"), cost: 2, color: "#5f8f45" },
  { id: "eggplant", name: "Aubergine (eggplant)", altNames: ["biringanya", "brinjal"], category: "produce", per100g: n(25, 1.0, 5.9, 0.2, 0, 3.0, 2), source: fdc("Eggplant, raw"), cost: 1, color: "#4b2a4f" },
  { id: "okra", name: "Okra", altNames: ["bamia", "bhindi"], category: "produce", per100g: n(33, 1.9, 7.5, 0.2, 0, 3.2, 7), source: fdc("Okra, raw"), cost: 1, color: "#6d9b42" },
  { id: "coriander", name: "Fresh coriander", altNames: ["dhania", "cilantro"], category: "produce", per100g: n(23, 2.1, 3.7, 0.5, 0, 2.8, 46), source: fdc("Coriander (cilantro) leaves, raw"), cost: 1, color: "#4c8a3a" },
  { id: "parsley", name: "Fresh parsley", category: "produce", per100g: n(36, 3.0, 6.3, 0.8, 0.1, 3.3, 56), source: fdc("Parsley, fresh"), cost: 1, color: "#3f7d34" },
  { id: "mint", name: "Fresh mint", category: "produce", per100g: n(70, 3.8, 14.9, 0.9, 0.2, 8.0, 31), source: fdc("Spearmint, fresh"), cost: 1, color: "#5aa36b" },

  // ---------- Fruit ----------
  { id: "lemon", name: "Lemon juice", category: "fruit", per100g: n(22, 0.4, 6.9, 0.2, 0, 0.3, 1), source: fdc("Lemon juice, raw"), cost: 1, color: "#f2d64b" },
  { id: "lime", name: "Lime juice", altNames: ["ndimu"], category: "fruit", per100g: n(25, 0.4, 8.4, 0.1, 0, 0.4, 2), source: fdc("Lime juice, raw"), cost: 1, color: "#9fc54a" },
  { id: "banana", name: "Ripe banana", altNames: ["ndizi"], category: "fruit", per100g: n(89, 1.1, 22.8, 0.3, 0.1, 2.6, 1), source: fdc("Bananas, raw"), cost: 1, color: "#f3d36b" },
  { id: "mango", name: "Mango", altNames: ["embe"], category: "fruit", per100g: n(60, 0.8, 15, 0.4, 0.1, 1.6, 1), source: fdc("Mangos, raw"), cost: 1, color: "#f2a33a" },
  { id: "pineapple", name: "Pineapple", altNames: ["nanasi"], category: "fruit", per100g: n(50, 0.5, 13.1, 0.1, 0, 1.4, 1), source: fdc("Pineapple, raw, all varieties"), cost: 1, color: "#f5cf47" },
  { id: "berries", name: "Blueberries or mixed berries (frozen)", category: "fruit", per100g: n(57, 0.7, 14.5, 0.3, 0, 2.4, 1), source: fdc("Blueberries, raw"), cost: 3, color: "#4a4f8e" },
  { id: "apple", name: "Apple", category: "fruit", per100g: n(52, 0.3, 13.8, 0.2, 0, 2.4, 1), source: fdc("Apples, raw, with skin"), cost: 2, color: "#c94a3a" },
  { id: "orange", name: "Orange", altNames: ["chungwa"], category: "fruit", per100g: n(47, 0.9, 11.8, 0.1, 0, 2.4, 0), source: fdc("Oranges, raw, all commercial varieties"), cost: 1, color: "#f08a24" },
  { id: "avocado", name: "Avocado", altNames: ["parachichi"], category: "fruit", per100g: n(160, 2.0, 8.5, 14.7, 2.1, 6.7, 7), source: fdc("Avocados, raw, all commercial varieties"), cost: 1, color: "#6f8f3a" },
  { id: "dates", name: "Dates", altNames: ["tende"], category: "fruit", per100g: n(277, 1.8, 75, 0.2, 0, 6.7, 1), source: fdc("Dates, medjool"), cost: 2, color: "#7a4a2c" },

  // ---------- Legumes ----------
  { id: "kidney-beans", name: "Red kidney beans (cooked)", altNames: ["maharagwe", "rosecoco beans"], category: "legumes", per100g: n(127, 8.7, 22.8, 0.5, 0.1, 6.4, 1), source: fdc("Beans, kidney, red, mature seeds, cooked, boiled, without salt"), cost: 1, color: "#8b2f2a" },
  { id: "black-beans", name: "Black beans (cooked)", category: "legumes", per100g: n(132, 8.9, 23.7, 0.5, 0.1, 8.7, 1), source: fdc("Beans, black, mature seeds, cooked, boiled, without salt"), cost: 1, color: "#2b2230" },
  { id: "chickpeas", name: "Chickpeas (cooked)", altNames: ["garbanzo beans", "chana"], category: "legumes", per100g: n(164, 8.9, 27.4, 2.6, 0.3, 7.6, 7), source: fdc("Chickpeas, mature seeds, cooked, boiled, without salt"), cost: 1, color: "#d9b46a" },
  { id: "lentils-dry", name: "Red or brown lentils (dry)", altNames: ["kamande", "masoor dal"], category: "legumes", per100g: n(352, 24.6, 63.4, 1.1, 0.2, 10.7, 6), source: fdc("Lentils, raw"), cost: 1, color: "#c9673a" },
  { id: "lentils-cooked", name: "Green or brown lentils (cooked)", category: "legumes", per100g: n(116, 9.0, 20.1, 0.4, 0.1, 7.9, 2), source: fdc("Lentils, mature seeds, cooked, boiled, without salt"), cost: 1, color: "#7c6a3c" },
  { id: "green-grams", name: "Green grams / mung beans (cooked)", altNames: ["ndengu", "moong"], category: "legumes", per100g: n(105, 7.0, 19.2, 0.4, 0.1, 7.6, 2), source: fdc("Mung beans, mature seeds, sprouted or boiled, without salt"), cost: 1, color: "#6b8a3a" },
  { id: "tofu", name: "Firm tofu", category: "protein", per100g: n(144, 17.3, 2.8, 8.7, 1.3, 2.3, 14), source: fdc("Tofu, raw, firm, prepared with calcium sulfate"), allergens: ["soy"], cost: 2, color: "#efe8d2" },

  // ---------- Animal proteins ----------
  { id: "eggs", name: "Eggs", altNames: ["mayai"], category: "protein", per100g: n(143, 12.6, 0.7, 9.5, 3.1, 0, 142), source: fdc("Egg, whole, raw, fresh"), allergens: ["egg"], animal: "egg", cost: 1, color: "#f4c542" },
  { id: "chicken-breast", name: "Chicken breast, skinless", category: "protein", per100g: n(120, 22.5, 0, 2.6, 0.6, 0, 45), source: fdc("Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw"), animal: "poultry", cost: 2, color: "#e9c1a4" },
  { id: "chicken-thigh", name: "Chicken thigh, skinless", category: "protein", per100g: n(121, 19.7, 0, 4.1, 1.0, 0, 95), source: fdc("Chicken, broilers or fryers, dark meat, thigh, meat only, raw"), animal: "poultry", cost: 2, color: "#d9a07f" },
  { id: "goat", name: "Lean goat or beef, diced", altNames: ["mbuzi", "hilib ari"], category: "protein", per100g: n(109, 20.6, 0, 2.3, 0.7, 0, 82), source: fdc("Game meat, goat, raw"), animal: "meat", cost: 3, color: "#8f3f35" },
  { id: "salmon", name: "Salmon fillet", category: "protein", per100g: n(208, 20.4, 0, 13.4, 3.1, 0, 59), source: fdc("Fish, salmon, Atlantic, farmed, raw"), allergens: ["fish"], animal: "fish", cost: 3, color: "#f08a6a" },
  { id: "tilapia", name: "Tilapia or other white fish", altNames: ["samaki", "ngege"], category: "protein", per100g: n(96, 20.1, 0, 1.7, 0.6, 0, 52), source: fdc("Fish, tilapia, raw"), allergens: ["fish"], animal: "fish", cost: 2, color: "#f1e2d6" },
  { id: "tuna", name: "Tuna canned in water (drained)", category: "protein", per100g: n(116, 25.5, 0, 0.8, 0.2, 0, 338), source: fdc("Fish, tuna, light, canned in water, drained solids"), allergens: ["fish"], animal: "fish", cost: 2, color: "#c9a59a" },
  { id: "sardines", name: "Sardines canned in oil (drained)", category: "protein", per100g: n(208, 24.6, 0, 11.5, 1.5, 0, 307), source: fdc("Fish, sardine, Atlantic, canned in oil, drained solids with bone"), allergens: ["fish"], animal: "fish", cost: 2, color: "#9aa3a8" },
  { id: "shrimp", name: "Prawns / shrimp", category: "protein", per100g: n(85, 20.1, 0, 0.5, 0.1, 0, 119), source: fdc("Crustaceans, shrimp, raw"), allergens: ["shellfish"], animal: "shellfish", cost: 3, color: "#f2a38a" },

  { id: "ground-turkey", name: "Lean ground turkey (93% lean)", altNames: ["turkey mince"], category: "protein", per100g: n(150, 18.7, 0, 8.3, 2.2, 0, 69), source: fdc("Turkey, ground, 93% lean, 7% fat, raw"), animal: "poultry", cost: 2, color: "#c99a86" },
  { id: "lean-beef-mince", name: "Lean beef mince (90% lean)", altNames: ["ground beef"], category: "protein", per100g: n(176, 20, 0, 10, 3.9, 0, 66), source: fdc("Beef, ground, 90% lean meat / 10% fat, raw"), animal: "meat", cost: 3, color: "#8c3b32" },
  { id: "bacon", name: "Bacon (streaky), cooked", altNames: ["streaky bacon", "American-style bacon"], category: "protein", per100g: n(541, 37, 1.4, 41.8, 13.7, 0, 1717), source: fdc("Pork, cured, bacon, cooked, pan-fried"), animal: "meat", cost: 3, color: "#a8432f" },
  { id: "cod", name: "Cod or haddock fillet", category: "protein", per100g: n(82, 17.8, 0, 0.7, 0.1, 0, 54), source: fdc("Fish, cod, Atlantic, raw"), allergens: ["fish"], animal: "fish", cost: 3, color: "#f3ebe2" },

  // ---------- Dairy ----------
  { id: "yogurt", name: "Plain low-fat yoghurt", altNames: ["mala (fermented milk) works too"], category: "dairy", per100g: n(63, 5.3, 7.0, 1.6, 1.0, 0, 70), source: fdc("Yogurt, plain, low fat"), allergens: ["dairy"], animal: "dairy", cost: 2, color: "#f7f4ec" },
  { id: "greek-yogurt", name: "Plain Greek yoghurt (0%)", category: "dairy", per100g: n(59, 10.2, 3.6, 0.4, 0.1, 0, 36), source: fdc("Yogurt, Greek, plain, nonfat"), allergens: ["dairy"], animal: "dairy", cost: 2, color: "#fbf9f3" },
  { id: "milk", name: "Milk (semi-skimmed / 2%)", altNames: ["maziwa"], category: "dairy", per100g: n(50, 3.3, 4.8, 2.0, 1.1, 0, 47), source: fdc("Milk, reduced fat, fluid, 2% milkfat"), allergens: ["dairy"], animal: "dairy", cost: 1, color: "#fbfaf6" },
  { id: "feta", name: "Feta cheese", category: "dairy", per100g: n(264, 14.2, 4.1, 21.3, 14.9, 0, 1116), source: fdc("Cheese, feta"), allergens: ["dairy"], animal: "dairy", cost: 3, color: "#f6f3ea" },

  { id: "cheddar", name: "Mature cheddar cheese", category: "dairy", per100g: n(403, 24.9, 1.3, 33.1, 21.1, 0, 621), source: fdc("Cheese, cheddar"), allergens: ["dairy"], animal: "dairy", cost: 2, color: "#f2b84b" },
  { id: "blue-cheese", name: "Blue cheese", category: "dairy", per100g: n(353, 21.4, 2.3, 28.7, 18.7, 0, 1146), source: fdc("Cheese, blue"), allergens: ["dairy"], animal: "dairy", cost: 3, color: "#e9ece4" },

  // ---------- Nuts & seeds ----------
  { id: "peanut-butter", name: "Peanut butter (natural, unsalted)", altNames: ["groundnut paste"], category: "nuts-seeds", per100g: n(588, 25.1, 19.6, 50.4, 10.3, 6.0, 17), source: fdc("Peanut butter, smooth style, without salt"), allergens: ["peanut"], cost: 2, color: "#b77b3f" },
  { id: "peanuts", name: "Raw peanuts", altNames: ["njugu", "groundnuts"], category: "nuts-seeds", per100g: n(567, 25.8, 16.1, 49.2, 6.3, 8.5, 18), source: fdc("Peanuts, all types, raw"), allergens: ["peanut"], cost: 1, color: "#c99a5f" },
  { id: "almonds", name: "Almonds", category: "nuts-seeds", per100g: n(579, 21.2, 21.6, 49.9, 3.8, 12.5, 1), source: fdc("Nuts, almonds"), allergens: ["tree-nut"], cost: 3, color: "#a8714a" },
  { id: "walnuts", name: "Walnuts", category: "nuts-seeds", per100g: n(654, 15.2, 13.7, 65.2, 6.1, 6.7, 2), source: fdc("Nuts, walnuts, english"), allergens: ["tree-nut"], cost: 3, color: "#8c6239" },
  { id: "chia", name: "Chia seeds", category: "nuts-seeds", per100g: n(486, 16.5, 42.1, 30.7, 3.3, 34.4, 16), source: fdc("Seeds, chia seeds, dried"), cost: 3, color: "#4d4a4a" },
  { id: "tahini", name: "Tahini (sesame paste)", category: "nuts-seeds", per100g: n(595, 17, 21.2, 53.8, 7.5, 9.3, 115), source: fdc("Seeds, sesame butter, tahini, from roasted and toasted kernels"), allergens: ["sesame"], cost: 2, color: "#cfa874" },

  { id: "sesame-seeds", name: "Sesame seeds", category: "nuts-seeds", per100g: n(573, 17.7, 23.4, 49.7, 7.0, 11.8, 11), source: fdc("Seeds, sesame seeds, whole, dried"), allergens: ["sesame"], cost: 2, color: "#efe2c2" },

  // ---------- Oils & pantry ----------
  { id: "olive-oil", name: "Olive oil", category: "oils", per100g: n(884, 0, 0, 100, 13.8, 0, 2), source: fdc("Oil, olive, salad or cooking"), cost: 3, color: "#b8a634" },
  { id: "veg-oil", name: "Vegetable oil (canola/rapeseed or sunflower)", category: "oils", per100g: n(884, 0, 0, 100, 7.4, 0, 0), source: fdc("Oil, canola"), cost: 1, color: "#e5c65a" },
  { id: "sesame-oil", name: "Toasted sesame oil", category: "oils", per100g: n(884, 0, 0, 100, 14.2, 0, 0), source: fdc("Oil, sesame, salad or cooking"), allergens: ["sesame"], cost: 2, color: "#b8762e" },
  { id: "coconut-milk", name: "Coconut milk (canned)", altNames: ["tui"], category: "pantry", per100g: n(197, 2.0, 2.8, 21.3, 18.9, 0, 13), source: fdc("Nuts, coconut milk, canned (liquid expressed from grated meat and water)"), cost: 2, color: "#f7f1e3" },
  { id: "canned-tomatoes", name: "Canned chopped tomatoes", category: "pantry", per100g: n(32, 1.6, 7.3, 0.3, 0, 1.9, 132), source: fdc("Tomatoes, crushed, canned"), cost: 1, color: "#b8352a" },
  { id: "tomato-paste", name: "Tomato paste", category: "pantry", per100g: n(82, 4.3, 18.9, 0.5, 0.1, 4.1, 59), source: fdc("Tomato products, canned, paste, without salt added"), cost: 1, color: "#a3271f" },
  { id: "stock", name: "Low-sodium vegetable stock", category: "pantry", per100g: n(6, 0.3, 1.2, 0, 0, 0, 58), source: fdc("Soup, vegetable broth, ready to serve, low sodium", "Sodium varies widely between brands; check the label"), cost: 1, color: "#d8c38a" },
  { id: "soy-sauce", name: "Reduced-sodium soy sauce", category: "pantry", per100g: n(53, 8.1, 4.9, 0.1, 0, 0.8, 3333), source: fdc("Soy sauce, reduced sodium, made from soy and wheat (shoyu)"), allergens: ["soy", "gluten"], cost: 2, color: "#3a2418" },
  { id: "miso", name: "Miso paste", category: "pantry", per100g: n(198, 12.8, 25.4, 6.0, 1.0, 5.4, 3728), source: fdc("Miso"), allergens: ["soy"], cost: 3, color: "#c8873f" },
  { id: "fish-sauce", name: "Fish sauce", altNames: ["nam pla", "nuoc mam"], category: "pantry", per100g: n(35, 5.1, 3.6, 0, 0, 0, 7851), source: fdc("Sauce, fish, ready-to-serve"), allergens: ["fish"], animal: "fish", cost: 2, color: "#8a5a2b" },
  { id: "baked-beans", name: "Baked beans in tomato sauce (canned)", altNames: ["navy beans in sauce"], category: "legumes", per100g: n(94, 4.8, 21.1, 0.4, 0.1, 4.1, 343), source: fdc("Beans, baked, canned, plain or vegetarian"), cost: 1, color: "#c4542e" },
  { id: "pasta", name: "Dried pasta (macaroni or penne)", category: "grains", per100g: n(371, 13, 74.7, 1.5, 0.3, 3.2, 6), source: fdc("Pasta, dry, enriched"), allergens: ["gluten"], cost: 1, color: "#f0d58c" },
  { id: "rice-noodles", name: "Rice vermicelli noodles (dry)", altNames: ["bun noodles"], category: "grains", per100g: n(364, 6.0, 80.2, 0.6, 0.2, 1.6, 182), source: fdc("Rice noodles, dry"), cost: 2, color: "#f6f1e6" },
  { id: "wakame", name: "Wakame seaweed (rehydrated)", category: "produce", per100g: n(45, 3.0, 9.1, 0.6, 0.1, 0.5, 872), source: fdc("Seaweed, wakame, raw"), cost: 2, color: "#2f5a3a" },
  { id: "honey", name: "Honey", altNames: ["asali"], category: "pantry", per100g: n(304, 0.3, 82.4, 0, 0, 0.2, 4), source: fdc("Honey"), animal: "honey", cost: 2, color: "#e0a42b" },
  { id: "sugar", name: "Sugar", category: "pantry", per100g: n(387, 0, 100, 0, 0, 0, 1), source: fdc("Sugars, granulated"), cost: 1, color: "#fbfaf7" },
  { id: "vinegar", name: "Cider or wine vinegar", category: "pantry", per100g: n(21, 0, 0.9, 0, 0, 0, 5), source: fdc("Vinegar, cider"), cost: 1, color: "#d9b26a" },
  { id: "cocoa", name: "Unsweetened cocoa powder", category: "pantry", per100g: n(228, 19.6, 57.9, 13.7, 8.1, 37, 21), source: fdc("Cocoa, dry powder, unsweetened"), cost: 2, color: "#5a3524" },
  { id: "salt", name: "Salt", category: "pantry", per100g: n(0, 0, 0, 0, 0, 0, 38758), source: fdc("Salt, table"), cost: 1, color: "#ffffff" },
  { id: "water", name: "Water", category: "pantry", per100g: n(0, 0, 0, 0, 0, 0, 0), source: fdc("Water, tap, drinking", "Tap water sodium varies by supply and is treated as zero"), cost: 1, color: "#cfe3ea" },

  // ---------- Spices ----------
  { id: "cumin", name: "Ground cumin", altNames: ["jira", "jeera"], category: "spices", per100g: n(375, 17.8, 44.2, 22.3, 1.5, 10.5, 168), source: fdc("Spices, cumin seed"), cost: 1, color: "#9c6a2e" },
  { id: "turmeric", name: "Ground turmeric", altNames: ["manjano", "haldi"], category: "spices", per100g: n(312, 9.7, 67.1, 3.3, 1.8, 22.7, 27), source: fdc("Spices, turmeric, ground"), cost: 1, color: "#e0a019" },
  { id: "paprika", name: "Paprika", category: "spices", per100g: n(282, 14.1, 54, 12.9, 2.1, 34.9, 68), source: fdc("Spices, paprika"), cost: 1, color: "#b5321f" },
  { id: "cinnamon", name: "Ground cinnamon", altNames: ["mdalasini"], category: "spices", per100g: n(247, 4.0, 80.6, 1.2, 0.3, 53.1, 10), source: fdc("Spices, cinnamon, ground"), cost: 1, color: "#8a4b26" },
  { id: "cardamom", name: "Ground cardamom", altNames: ["iliki", "hel"], category: "spices", per100g: n(311, 10.8, 68.5, 6.7, 0.7, 28, 18), source: fdc("Spices, cardamom"), cost: 2, color: "#7d8a54" },
  { id: "black-pepper", name: "Black pepper", category: "spices", per100g: n(251, 10.4, 64, 3.3, 1.4, 25.3, 20), source: fdc("Spices, pepper, black"), cost: 1, color: "#2b2622" },
  { id: "curry-powder", name: "Curry powder", category: "spices", per100g: n(325, 14.3, 55.8, 14, 2.3, 53.2, 52), source: fdc("Spices, curry powder"), cost: 1, color: "#c98a1f" },
  { id: "pilau-masala", name: "Pilau masala or garam masala", altNames: ["xawaash (Somali spice blend)"], category: "spices", per100g: n(325, 14.3, 55.8, 14, 2.3, 53.2, 52), source: fdc("Spices, curry powder", "Curry powder used as proxy for whole-spice blends"), cost: 1, color: "#7a4a24" },
  { id: "chilli-flakes", name: "Chilli flakes or powder", category: "spices", per100g: n(318, 12, 56.6, 17.3, 3.3, 27.2, 30), source: fdc("Spices, pepper, red or cayenne"), cost: 1, color: "#a8241c" },
  { id: "dried-herbs", name: "Dried thyme or mixed herbs", category: "spices", per100g: n(276, 9.1, 63.9, 7.4, 2.7, 37, 55), source: fdc("Spices, thyme, dried"), cost: 1, color: "#6f7d4a" },
  { id: "coriander-ground", name: "Ground coriander seed", category: "spices", per100g: n(298, 12.4, 55, 17.8, 1.0, 41.9, 35), source: fdc("Spices, coriander seed"), cost: 1, color: "#a88a4a" },
];

const byId = new Map(ingredients.map((i) => [i.id, i]));

export function getIngredient(id: string): Ingredient {
  const ing = byId.get(id);
  if (!ing) throw new Error(`Unknown ingredient: ${id}`);
  return ing;
}

export function hasIngredient(id: string): boolean {
  return byId.has(id);
}
