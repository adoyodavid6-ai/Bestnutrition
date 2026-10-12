// Core domain types for NourishWell content and user data.

export type ReviewStatus =
  | "draft"
  | "in-review"
  | "approved"
  | "published"
  | "needs-update"
  | "archived";

/** Who reviewed a piece of content. Only recorded when a review actually happened. */
export interface ContentReview {
  status: ReviewStatus;
  author: string;
  /** Name and credential of a qualified reviewer. Omitted until a real review occurs. */
  reviewer?: { name: string; credential: string };
  published: string; // ISO date
  lastReviewed?: string; // ISO date, only when reviewed
  /** Plain-language note shown to readers about the review state. */
  note?: string;
}

export interface Reference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  /** Year or date the source was published or last updated, if known. */
  year?: string;
  kind: "public-health-agency" | "national-health-service" | "medical-organization" | "systematic-review" | "clinical-guideline" | "nutrient-database";
}

// ---------- Ingredients & nutrition ----------

export type IngredientCategory =
  | "produce"
  | "fruit"
  | "grains"
  | "legumes"
  | "protein"
  | "dairy"
  | "nuts-seeds"
  | "oils"
  | "pantry"
  | "spices";

export type Allergen =
  | "gluten"
  | "dairy"
  | "egg"
  | "fish"
  | "shellfish"
  | "peanut"
  | "tree-nut"
  | "soy"
  | "sesame";

export type AnimalOrigin = "meat" | "poultry" | "fish" | "shellfish" | "dairy" | "egg" | "honey";

export interface Nutrients {
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  satFat: number; // g
  fiber: number; // g
  sodium: number; // mg
}

export interface Ingredient {
  id: string;
  name: string;
  /** Alternative names used in different regions, e.g. { "en-KE": "sukuma wiki" }. */
  altNames?: string[];
  category: IngredientCategory;
  /** Reference values per 100 g of the ingredient in the state listed in `source`. */
  per100g: Nutrients;
  source: { database: "USDA FoodData Central"; description: string; proxy?: string };
  allergens?: Allergen[];
  animal?: AnimalOrigin;
  /** Relative cost level in most markets. Not a price. */
  cost: 1 | 2 | 3;
  /** Display colour used in illustrations. */
  color: string;
}

export type Unit = "g" | "ml" | "tsp" | "tbsp" | "piece" | "clove" | "pinch" | "handful";

export interface RecipeIngredient {
  id: string; // ingredient id
  qty: number;
  unit: Unit;
  /** Weight in grams used for the nutrition calculation (for the base servings). */
  grams: number;
  note?: string;
  /** Optional garnishes etc. are excluded from nutrition totals. */
  optional?: boolean;
}

export type MealCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "supper"
  | "snack"
  | "beverage"
  | "soup"
  | "salad"
  | "main"
  | "side"
  | "dessert";

export type Difficulty = "easy" | "moderate" | "involved";

export type CookingMethod = "stovetop" | "oven" | "no-cook" | "blender" | "griddle" | "steamed" | "simmered" | "grill";

export interface Recipe {
  slug: string;
  title: string;
  intro: string;
  categories: MealCategory[];
  cuisine: string;
  region:
    | "United States"
    | "United Kingdom"
    | "East Asia"
    | "Southeast Asia"
    | "South Asia"
    | "East Africa"
    | "West Africa"
    | "North Africa"
    | "Mediterranean"
    | "Middle East"
    | "Latin America"
    | "Europe"
    | "Global";
  prepMin: number;
  cookMin: number;
  /** Hands-off time such as soaking, fermenting or chilling, shown separately. */
  restMin?: number;
  restNote?: string;
  difficulty: Difficulty;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  equipment: string[];
  methods: CookingMethod[];
  tips: string[];
  substitutions: { swap: string; with: string; note?: string }[];
  storage: string;
  foodSafety?: string;
  goals: GoalId[];
  review: ContentReview;
  references?: string[]; // reference ids, for any material health claim in the intro
  /** Image of the finished dish. Required before Recipe rich-result markup is emitted. */
  photo?: RecipePhoto;
}

export interface RecipePhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** "photograph" for licensed photography of the cooked dish; "ai-generated" for generated images. */
  kind: "photograph" | "ai-generated";
  credit: string;
}

export type GoalId =
  | "heart-health"
  | "blood-sugar"
  | "high-fibre"
  | "high-protein"
  | "budget"
  | "quick"
  | "family"
  | "plant-forward";

// ---------- Articles ----------

export interface Section {
  heading: string;
  body: string[]; // paragraphs
  bullets?: string[];
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readMin: number;
  sections: Section[];
  keyTakeaways: string[];
  references: string[];
  review: ContentReview;
  relatedRecipes?: string[];
}

export interface ConditionGuide {
  slug: string;
  title: string;
  group: "Heart & circulation" | "Blood sugar" | "Digestive health" | "Kidney & liver" | "Bones & blood" | "Life stages" | "Treatment & recovery";
  summary: string;
  /** Extra safeguards needed: shows a prominent clinician-supervision notice. */
  specialized: boolean;
  whatItIs: string[];
  nutritionCanHelp: string[];
  nutritionCannot: string[];
  evidence: { established: string[]; uncertain: string[] };
  patterns: string[];
  practical: string[];
  considerations: string[];
  interactions: string[];
  seekCare: string[];
  urgent?: string[];
  askClinician: string[];
  relatedRecipes: string[];
  references: string[];
  review: ContentReview;
}

export interface SupplementGuide {
  slug: string;
  name: string;
  type: "Vitamin" | "Mineral" | "Fatty acid" | "Protein" | "Fibre" | "Microorganism" | "Electrolyte";
  summary: string;
  role: string[];
  foodSources: string[];
  evidence: { strength: "Strong" | "Moderate" | "Limited" | "Mixed"; summary: string[] };
  useCases: string[];
  risks: string[];
  interactions: string[];
  safetyLimits: string[];
  quality: string[];
  askProfessional: string[];
  references: string[];
  review: ContentReview;
}

export interface FitnessGuide {
  slug: string;
  title: string;
  category: "Movement" | "Strength" | "Cardio" | "Mobility" | "Recovery" | "Lifestyle";
  summary: string;
  audience: string;
  difficulty: "Beginner" | "Intermediate" | "All levels";
  durationMin: number;
  equipment: string[];
  steps: { title: string; detail: string }[];
  modifications: string[];
  safety: string[];
  references: string[];
  review: ContentReview;
}
