import { describe, expect, it } from "vitest";
import { conditions } from "@/content/conditions";
import { nutritionArticles } from "@/content/nutrition";
import { supplements } from "@/content/supplements";
import { fitnessGuides } from "@/content/fitness";
import { getRecipe, recipes } from "@/content/recipes";
import { getReference, references } from "@/content/references";
import { collections, collectionRecipes } from "@/content/collections";
import { GOALS } from "@/content/goals";
import { publishedBusinesses, publishedProfessionals } from "@/content/directory";
import { formSchemas } from "@/lib/forms";
import { NEVER_PREMIUM, hasEntitlement, plans } from "@/lib/plans";
import { buildSearchIndex, searchDocs } from "@/lib/search";
import { auditContent } from "@/lib/content-audit";

const allGuides = [...nutritionArticles, ...conditions, ...supplements, ...fitnessGuides];

describe("editorial integrity", () => {
  it("every cited reference id resolves", () => {
    for (const g of allGuides) for (const id of g.references) expect(getReference(id), id).toBeDefined();
  });

  it("references use https and are unique", () => {
    expect(new Set(references.map((r) => r.id)).size).toBe(references.length);
    for (const r of references) expect(r.url.startsWith("https://"), r.id).toBe(true);
  });

  it("no guide claims a reviewer without a review date", () => {
    for (const g of [...allGuides, ...recipes]) if (g.review.reviewer) expect(g.review.lastReviewed).toBeDefined();
  });

  it("health guides are never marked as clinically reviewed without a reviewer", () => {
    for (const g of [...nutritionArticles, ...conditions, ...supplements]) {
      if (!g.review.reviewer) expect(["draft", "in-review"]).toContain(g.review.status);
    }
  });

  it("every condition guide fills all twelve required sections", () => {
    for (const c of conditions) {
      for (const field of ["whatItIs", "nutritionCanHelp", "nutritionCannot", "patterns", "practical", "considerations", "interactions", "seekCare", "askClinician", "references"] as const) {
        expect(c[field].length, `${c.slug}.${field}`).toBeGreaterThan(0);
      }
      expect(c.evidence.established.length, c.slug).toBeGreaterThan(0);
      expect(c.evidence.uncertain.length, c.slug).toBeGreaterThan(0);
    }
  });

  it("covers every condition category listed in the specification", () => {
    expect(conditions.length).toBeGreaterThanOrEqual(21);
  });

  it("related recipe links resolve", () => {
    for (const c of conditions) for (const s of c.relatedRecipes) expect(getRecipe(s), `${c.slug} → ${s}`).toBeDefined();
    for (const a of nutritionArticles) for (const s of a.relatedRecipes ?? []) expect(getRecipe(s), `${a.slug} → ${s}`).toBeDefined();
  });

  it("does not use cure language in positive-claim fields", () => {
    // Cautions ("detox supplements can harm the liver") are allowed; claims of benefit are checked.
    const banned = /\b(cures?|reverses?|detox(es|ify)?|miracle|guaranteed weight loss)\b/i;
    for (const c of conditions) {
      const text = [...c.nutritionCanHelp, ...c.practical, ...c.patterns].join(" ");
      expect(text.match(banned), c.slug).toBeNull();
    }
    for (const s of supplements) {
      const text = [...s.role, ...s.useCases, ...s.evidence.summary].join(" ");
      expect(text.match(banned), s.slug).toBeNull();
    }
    for (const r of recipes) expect(r.intro.match(banned), r.slug).toBeNull();
  });

  it("every collection and goal has recipes", () => {
    for (const c of collections) expect(collectionRecipes(c).length, c.slug).toBeGreaterThan(1);
    for (const g of GOALS) expect(recipes.filter((r) => r.goals.includes(g.id)).length, g.id).toBeGreaterThan(1);
  });

  it("leads with American, British and Asian recipes", () => {
    expect(recipes.filter((r) => r.region === "United States").length).toBeGreaterThanOrEqual(7);
    expect(recipes.filter((r) => r.region === "United Kingdom").length).toBeGreaterThanOrEqual(7);
    expect(recipes.filter((r) => ["East Asia", "Southeast Asia", "South Asia"].includes(r.region)).length).toBeGreaterThanOrEqual(10);
    expect(["United States", "United Kingdom", "East Asia", "Southeast Asia", "South Asia"]).toContain(recipes[0].region);
  });

  it("includes substantial East African content", () => {
    expect(recipes.filter((r) => r.region === "East Africa").length).toBeGreaterThanOrEqual(10);
  });

  it("directory publishes nothing unverified", () => {
    expect(publishedProfessionals().every((p) => p.verification === "verified")).toBe(true);
    expect(publishedBusinesses().every((b) => b.verification === "verified")).toBe(true);
  });

  it("content audit flags pending clinical reviews", () => {
    const rows = auditContent(new Date("2026-10-12"));
    expect(rows.filter((r) => r.issues.includes("Awaiting qualified professional review")).length).toBe(nutritionArticles.length + conditions.length + supplements.length + fitnessGuides.length);
  });
});

describe("forms", () => {
  it("requires explicit consent for the newsletter", () => {
    expect(formSchemas.newsletter.safeParse({ email: "a@b.co", consent: false }).success).toBe(false);
    expect(formSchemas.newsletter.safeParse({ email: "a@b.co", consent: true }).success).toBe(true);
  });
  it("rejects invalid email and short messages", () => {
    const r = formSchemas.contact.safeParse({ name: "A", email: "nope", topic: "general", message: "hi", consent: true });
    expect(r.success).toBe(false);
  });
  it("validates listing website URLs", () => {
    const base = {
      listingType: "professional",
      name: "A",
      email: "a@b.co",
      country: "Kenya",
      profession: "Dietitian",
      services: "Clinical nutrition consultations",
      consent: true,
      hourlyRate: { amount: 60, currency: "USD" },
      modes: ["video"],
      availability: { timezone: "Africa/Nairobi", weekly: [{ day: 1, start: "09:00", end: "17:00" }], sessionMinutes: [60], minNoticeHours: 24, horizonDays: 30 },
    };
    expect(formSchemas.listing.safeParse({ ...base, website: "javascript:alert(1)" }).success).toBe(false);
    expect(formSchemas.listing.safeParse({ ...base, website: "https://example.com" }).success).toBe(true);
  });

  it("requires professionals to give an hourly rate, consultation types and availability", () => {
    const pro = { listingType: "professional", name: "A", email: "a@b.co", country: "UK", profession: "Dietitian", services: "Clinical nutrition consultations", consent: true };
    const r = formSchemas.listing.safeParse(pro);
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path.join("."))).toEqual(expect.arrayContaining(["hourlyRate", "modes", "availability"]));
    expect(formSchemas.listing.safeParse({ ...pro, listingType: "business" }).success).toBe(true);
  });
});

describe("entitlements", () => {
  it("free plan covers core planning and education", () => {
    for (const f of NEVER_PREMIUM) expect(hasEntitlement("free", f), f).toBe(true);
  });
  it("premium-only features are not in free", () => {
    expect(hasEntitlement("free", "planner.export")).toBe(false);
    expect(hasEntitlement("premium", "planner.export")).toBe(true);
  });
  it("never invents a premium price", () => {
    expect(plans.find((p) => p.id === "premium")!.priceMonthly).toBeNull();
  });
});

describe("search", () => {
  const index = buildSearchIndex();
  it("finds recipes by regional ingredient names", () => {
    expect(searchDocs(index, "sukuma").some((d) => d.href === "/recipes/ugali-with-sukuma-wiki")).toBe(true);
  });
  it("ranks title matches first", () => {
    expect(searchDocs(index, "vitamin d")[0].href).toBe("/supplements/vitamin-d");
  });
  it("returns nothing for empty queries", () => {
    expect(searchDocs(index, "  ")).toEqual([]);
  });
});
