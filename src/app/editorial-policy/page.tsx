import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { CHARACTERISTIC_THRESHOLDS } from "@/lib/nutrition";

export const metadata: Metadata = {
  title: "Editorial Policy & Evidence Standards",
  description: "How NourishWell researches, writes, reviews, cites and corrects content, and how we calculate nutrition estimates.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <InfoPage path="/editorial-policy" eyebrow="Trust" title="Editorial policy" updated="2026-10-01" lede="How we decide what to publish, where our information comes from, and how we tell you what has — and hasn't — been reviewed.">
      <h2>Sources we prioritise</h2>
      <ol>
        <li>Public-health agencies (e.g. WHO, CDC) and national health services (e.g. NHS).</li>
        <li>Recognised medical and professional organisations and their clinical guidelines.</li>
        <li>Systematic reviews and meta-analyses.</li>
        <li>Individual studies only where higher-level evidence is lacking, and clearly described as such.</li>
      </ol>
      <p>We record each source&apos;s title, publisher and link, and re-check them at every review. We never invent citations.</p>

      <h2>Review workflow</h2>
      <p>Content moves through these statuses, visible in our content dashboard:</p>
      <ul>
        <li>
          <strong>Draft</strong> → <strong>In review</strong> → <strong>Approved</strong> → <strong>Published</strong>, with <strong>Needs update</strong> and <strong>Archived</strong> for ageing content.
        </li>
        <li>Health-condition, supplement and nutrition guides require review by a qualified professional (such as a registered dietitian or relevant clinician).</li>
        <li>
          Until that review happens, a guide is labelled <em>&ldquo;Clinical review pending&rdquo;</em>. We never display a reviewer&apos;s name unless they actually reviewed that page, and we show the
          review date.
        </li>
        <li>Content is flagged for re-review at least every 12 months, or sooner when guidance changes.</li>
      </ul>

      <h2>What we will never publish</h2>
      <ul>
        <li>Claims that a food, diet or supplement cures, reverses or prevents a disease.</li>
        <li>Advice to stop or replace prescribed treatment.</li>
        <li>Detox, miracle or guaranteed weight-loss claims; unsupported megadose recommendations.</li>
        <li>Fabricated reviews, ratings, testimonials, credentials or before-and-after images.</li>
      </ul>

      <h2 id="nutrition-data">How nutrition figures are calculated</h2>
      <p>
        Each recipe ingredient has a weight in grams and a set of reference values per 100 g, compiled from{" "}
        <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
          USDA FoodData Central
        </a>
        . We multiply, add up and divide by the number of servings, then round in the style of a food label. Each recipe page shows the per-ingredient breakdown and the reference entry used.
      </p>
      <ul>
        <li>
          All values are labelled <strong>estimates</strong>. None are laboratory-measured; if we add verified measurements in future they will be labelled separately.
        </li>
        <li>Where no direct reference exists for a regional food (for example, East African cooking bananas), we use a clearly labelled proxy.</li>
        <li>Optional garnishes are excluded. Salt and stock used in the recipe are included.</li>
        <li>
          Characteristic labels use editorial thresholds per serving: high fibre ≥ {CHARACTERISTIC_THRESHOLDS.highFibre} g, high protein ≥ {CHARACTERISTIC_THRESHOLDS.highProtein} g, lower sodium ≤{" "}
          {CHARACTERISTIC_THRESHOLDS.lowerSodium} mg, lower saturated fat ≤ {CHARACTERISTIC_THRESHOLDS.lowerSatFat} g. They are not regulatory nutrition claims.
        </li>
        <li>Dietary and allergen tags are derived automatically from ingredients, so a recipe can&apos;t be labelled vegan if it contains an animal product.</li>
      </ul>

      <h2>Costs and prices</h2>
      <p>
        We show a <em>relative</em> cost level (budget-friendly, moderate, higher cost) based on typical ingredient costs. We do not show prices until we have reliable local price data. Your shopping
        list lets you enter your own prices.
      </p>

      <h2>Recipes and images</h2>
      <p>
        Recipes are written and checked for completeness and food safety. Independent kitchen testing is being introduced and will be noted on each recipe when complete. Recipe illustrations are generated
        from each recipe&apos;s actual ingredients; licensed photography will be credited.
      </p>

      <h2>Sponsored and commercial content</h2>
      <p>Sponsored content, affiliate links and promoted listings will always be clearly labelled. Commercial partners never influence health guidance or review outcomes.</p>

      <h2>Corrections</h2>
      <p>
        Found an error? <Link href="/contact?topic=correction">Tell us</Link>. We review reports promptly and note significant corrections on the page.
      </p>
    </InfoPage>
  );
}
