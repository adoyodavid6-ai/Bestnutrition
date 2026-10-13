import { billingConfig, type BillingConfig } from "../billing/config";

/**
 * Original digital products sold as one-time purchases. Files live outside /public
 * (src/products/files) and are only served after a verified purchase, through short-lived
 * signed links. Prices come from Stripe (env var per product), never from this file.
 */
export interface DigitalProduct {
  slug: string;
  name: string;
  summary: string;
  description: string[];
  audience: string;
  outcome: string;
  format: string;
  contents: string[];
  /** Sample pages shown before purchase (public images). */
  previews: { src: string; alt: string }[];
  files: { label: string; file: string }[];
  priceEnv: string;
  licence: string;
  status: "published" | "draft";
}

export const PRODUCTS: DigitalProduct[] = [
  {
    slug: "meal-planning-workbook",
    name: "The NourishWell Meal-Planning Workbook",
    summary: "A printable four-week workbook to plan meals, shop once and prep ahead.",
    description: [
      "Everything on NourishWell's website stays free. This workbook is for people who like to plan on paper: four weeks of planners, aisle-grouped shopping lists and prep sessions in one printable file.",
      "It's an original NourishWell resource, designed to be printed at home or used on a tablet with a PDF annotation app. It gives general guidance only and isn't a diet or treatment plan.",
    ],
    audience: "Households and busy cooks who prefer planning on paper",
    outcome: "A month of planned meals, shorter shopping trips and less food waste",
    format: "28-page printable PDF, A4 and US Letter",
    contents: [
      "How to use the workbook, plus a one-page balanced-plate guide",
      "Four weekly meal planners with “cook once, eat twice” rows",
      "Four shopping lists grouped by aisle, with a “use up first” box",
      "Four prep-session planners",
      "Pantry and freezer inventory, grocery budget tracker and batch-cooking log with food-safety notes",
      "Blank recipe cards and a weekly reflection page",
    ],
    previews: [
      { src: "/products/workbook-cover.webp", alt: "Workbook cover with a plate illustration and the title The NourishWell Meal-Planning Workbook" },
      { src: "/products/workbook-plate.webp", alt: "Build a balanced plate guide page" },
      { src: "/products/workbook-planner.webp", alt: "Weekly meal planner page with days and meal columns" },
      { src: "/products/workbook-shopping.webp", alt: "Shopping list page grouped by aisle with a use-up-first box" },
    ],
    files: [
      { label: "A4 PDF", file: "nourishwell-meal-planning-workbook-a4.pdf" },
      { label: "US Letter PDF", file: "nourishwell-meal-planning-workbook-letter.pdf" },
    ],
    priceEnv: "STRIPE_PRICE_PRODUCT_WORKBOOK",
    licence: "For personal use. Please don't redistribute or resell.",
    status: "published",
  },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export function productPriceId(p: DigitalProduct, env: Record<string, string | undefined> = process.env) {
  const v = env[p.priceEnv]?.trim();
  return v || undefined;
}

export function productSellable(p: DigitalProduct, c: BillingConfig = billingConfig(), env: Record<string, string | undefined> = process.env) {
  return p.status === "published" && Boolean(c.secretKey && c.entitlementSecret && productPriceId(p, env));
}

export function productStatus(p: DigitalProduct, c: BillingConfig = billingConfig()) {
  if (p.status !== "published") return "Draft";
  return productSellable(p, c) ? "On sale" : `Needs ${p.priceEnv}`;
}
