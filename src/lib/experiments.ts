/**
 * Lightweight, honest experiments.
 *
 * - Variants change presentation only (defaults, wording) — never the price someone pays,
 *   never hidden terms, never fake urgency.
 * - Assignment is deterministic from a random first-party visitor id (no personal data).
 * - The variant travels with Checkout metadata (exp_<id>), so results are read from Stripe.
 * - A winner is only suggested with enough data (see compareVariants).
 */

export interface Variant {
  id: string;
  weight: number;
}

export interface Experiment {
  id: string;
  hypothesis: string;
  surface: string;
  metric: string;
  status: "running" | "paused" | "concluded";
  variants: Variant[];
  /** Variant used when the experiment isn't running (or before assignment). */
  control: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: "pricing-default-interval",
    hypothesis: "Showing yearly billing first increases completed checkouts without increasing refunds or early cancellations.",
    surface: "/pricing",
    metric: "Completed checkouts ÷ checkouts started (Stripe), checked against refunds and 60-day cancellations",
    status: "running",
    variants: [
      { id: "monthly-first", weight: 50 },
      { id: "yearly-first", weight: 50 },
    ],
    control: "monthly-first",
  },
  {
    id: "upgrade-prompt-copy",
    hypothesis: "Naming the concrete benefit in the upgrade prompt raises click-through to pricing.",
    surface: "Upgrade prompts (planner, shopping list)",
    metric: "upgrade_prompt_click ÷ prompt shown (analytics)",
    status: "running",
    variants: [
      { id: "see-premium", weight: 50 },
      { id: "name-the-benefit", weight: 50 },
    ],
    control: "see-premium",
  },
];

export const experimentById = (id: string) => EXPERIMENTS.find((e) => e.id === id);

/** FNV-1a 32-bit hash → [0, 100). */
function hash100(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 10000) / 100;
}

export function assignVariant(e: Experiment, visitorId: string): string {
  if (e.status !== "running") return e.control;
  const total = e.variants.reduce((s, v) => s + v.weight, 0);
  let point = (hash100(`${e.id}:${visitorId}`) / 100) * total;
  for (const v of e.variants) {
    if (point < v.weight) return v.id;
    point -= v.weight;
  }
  return e.variants[e.variants.length - 1].id;
}

/** Keep only known experiments and variants (input comes from the browser). */
export function cleanAssignments(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const e = experimentById(k);
    if (e && typeof v === "string" && e.variants.some((x) => x.id === v)) out[k] = v;
  }
  return out;
}

export const MIN_SAMPLE_PER_VARIANT = 200;

/**
 * Two-proportion z-test. Returns the observed rates and whether the difference is
 * statistically meaningful at ~95% — but only once each arm has enough observations.
 */
export function compareVariants(a: { n: number; conversions: number }, b: { n: number; conversions: number }, minSample = MIN_SAMPLE_PER_VARIANT) {
  const ra = a.n ? a.conversions / a.n : 0;
  const rb = b.n ? b.conversions / b.n : 0;
  const enough = a.n >= minSample && b.n >= minSample;
  const pooled = a.n + b.n ? (a.conversions + b.conversions) / (a.n + b.n) : 0;
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / Math.max(a.n, 1) + 1 / Math.max(b.n, 1)));
  const z = se > 0 ? (rb - ra) / se : 0;
  const significant = enough && Math.abs(z) >= 1.96;
  const verdict = !enough ? "Not enough data yet" : significant ? (rb > ra ? "B ahead (significant)" : "A ahead (significant)") : "No significant difference";
  return { rateA: ra, rateB: rb, z, enough, significant, verdict };
}
