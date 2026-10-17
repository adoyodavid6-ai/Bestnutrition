import Link from "next/link";
import { recipes, getRecipe } from "@/content/recipes";
import { collections, collectionCovers, collectionRecipes } from "@/content/collections";
import { GOALS } from "@/content/goals";
import { nutritionArticles } from "@/content/nutrition";
import { conditions } from "@/content/conditions";
import { fitnessGuides } from "@/content/fitness";
import { supplements } from "@/content/supplements";
import { RecipeImage } from "@/components/RecipeImage";
import { RecipeCard } from "@/components/RecipeCard";
import { Icon } from "@/components/Icon";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ShoppingDueBanner } from "@/components/shopping/ShoppingDueBanner";
import { DEFAULT_PREFS, SLOT_LABELS, generatePlan } from "@/lib/planner";
import { FEATURE_LABELS, plans, premiumLiveExtras, premiumPlannedExtras } from "@/lib/plans";
import { premiumOffers } from "@/lib/billing/offers";

export const revalidate = 3600;

const GOAL_ICONS: Record<string, string> = {
  "heart-health": "heart",
  "blood-sugar": "activity",
  "high-fibre": "leaf",
  "high-protein": "flame",
  budget: "coin",
  quick: "clock",
  family: "users",
  "plant-forward": "leaf",
};

export default async function HomePage() {
  const offers = await premiumOffers();
  const fromPrice = offers.month ? `${offers.month.display} USD / month` : offers.year ? `${offers.year.display} USD / year` : `${offers.listMonthly.display} USD / month`;
  const featured = [
    { label: "Breakfast", slug: "banana-oat-pancakes" },
    { label: "Lunch", slug: "vietnamese-prawn-noodle-salad" },
    { label: "Dinner", slug: "lighter-chicken-tikka-masala" },
    { label: "Supper", slug: "leek-and-potato-soup" },
  ].map((f) => ({ ...f, recipe: getRecipe(f.slug)! }));

  const preview = generatePlan(recipes, { ...DEFAULT_PREFS, seed: 7, budget: 2, maxTotalMin: 60 });
  const heroArt = ["sheet-pan-lemon-herb-chicken", "vegetable-bibimbap", "porridge-with-stewed-apples"].map((s) => getRecipe(s)!);
  const premium = plans.find((p) => p.id === "premium")!;
  const free = plans.find((p) => p.id === "free")!;
  const covers = collectionCovers();

  return (
    <>
      {/* Shopping-day reminder: appears only when a scheduled shopping day is due */}
      <ShoppingDueBanner />

      {/* 1. Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Eat Better. Feel Stronger. Live Well.</span>
            <h1 className="display">
              Feel Better Starts on <em>Your Plate.</em>
            </h1>
            <p className="lede" style={{ marginTop: 20 }}>
              Discover delicious recipes, practical nutrition guidance, personalized meal ideas, and healthier habits designed around your real life.
            </p>
            <div className="hero-actions">
              <Link href="/recipes" className="btn btn-primary">
                Explore Recipes
              </Link>
              <Link href="/meal-planner" className="btn btn-secondary">
                Build My Meal Plan
              </Link>
            </div>
            <p className="small" style={{ marginTop: 12 }}>
              New here? <Link href="/free-meal-plan">Get a free 7-day starter plan with shopping list</Link>.
            </p>
            <div className="hero-stats">
              <div>
                <strong>{recipes.length}</strong>
                <span>recipes from American, European &amp; Asian kitchens and beyond</span>
              </div>
              <div>
                <strong>{conditions.length}</strong>
                <span>health-condition guides</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>nutrition figures traceable</span>
              </div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            {heroArt.map((r) => (
              <div key={r.slug} className="art-frame">
                <RecipeImage recipe={r} decorative priority sizes="(max-width: 960px) 60vw, 30vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Quick search */}
      <section className="container" aria-labelledby="quick-h">
        <div className="quick-search">
          <h2 id="quick-h" style={{ fontSize: "var(--fs-xl)" }}>
            What would you like to cook?
          </h2>
          <form action="/recipes" role="search" className="search-form">
            <label htmlFor="home-q" className="sr-only">
              Search recipes
            </label>
            <input id="home-q" name="q" type="search" className="input" placeholder="Search by dish, ingredient or cuisine — e.g. chili, curry, salmon" />
            <button className="btn btn-primary" type="submit">
              <Icon name="search" size={16} /> Search
            </button>
          </form>
          <div className="chip-row" style={{ marginTop: 16 }}>
            {[
              ["Under 30 minutes", "/recipes?time=30"],
              ["Budget-friendly", "/recipes?cost=1"],
              ["Vegetarian", "/recipes?diet=vegetarian"],
              ["Breakfast", "/recipes?meal=breakfast"],
              ["American", "/discover/american-classics"],
              ["British", "/discover/british-favourites"],
              ["Asian", "/discover/asian-kitchen"],
              ["High fibre", "/recipes?nutrition=high-fibre"],
              ["Gluten-free", "/recipes?diet=gluten-free"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="chip chip-outline" style={{ textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured recipes by meal */}
      <section className="section container" aria-labelledby="featured-h">
        <div className="section-head">
          <div>
            <span className="eyebrow">From morning to night</span>
            <h2 id="featured-h">Today&apos;s table</h2>
            <p>A breakfast, lunch, dinner and supper worth cooking this week.</p>
          </div>
          <Link href="/recipes" className="link-arrow">
            All recipes
          </Link>
        </div>
        <div className="grid grid-4">
          {featured.map((f) => (
            <div key={f.slug}>
              <span className="eyebrow">{f.label}</span>
              <RecipeCard recipe={f.recipe} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Goals */}
      <section className="section section-alt" aria-labelledby="goals-h">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Explore by goal</span>
              <h2 id="goals-h">Eat for what matters to you</h2>
              <p>Recipes tagged by the outcomes people ask us about most. Goals guide choices; they aren&apos;t medical treatment.</p>
            </div>
          </div>
          <div className="grid grid-4">
            {GOALS.map((g) => (
              <Link key={g.id} href={`/recipes?goal=${g.id}`} className="card card-link goal-card">
                <span className="icon">
                  <Icon name={GOAL_ICONS[g.id]} />
                </span>
                <h3 style={{ margin: 0 }}>{g.title}</h3>
                <p className="small muted">{g.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Collections */}
      <section className="section container" aria-labelledby="coll-h">
        <div className="section-head">
          <div>
            <span className="eyebrow">Collections</span>
            <h2 id="coll-h">Seasonal, cultural &amp; budget-conscious</h2>
            <p>Healthy eating doesn&apos;t require imported or expensive food. Start with the kitchen you already know.</p>
          </div>
          <Link href="/discover" className="link-arrow">
            All collections
          </Link>
        </div>
        <div className="grid grid-3">
          {collections.slice(0, 6).map((c) => {
            const items = collectionRecipes(c);
            return (
              <Link key={c.slug} href={`/discover/${c.slug}`} className="recipe-card">
                <div className="art">{covers[c.slug] && <RecipeImage recipe={covers[c.slug]!} decorative />}</div>
                <div className="body">
                  <span className="cuisine">{c.kind}</span>
                  <h3>{c.title}</h3>
                  <p className="small muted" style={{ margin: 0 }}>
                    {c.description}
                  </p>
                  <div className="meta">{items.length} recipes</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Nutrition explained */}
      <section className="section section-alt" aria-labelledby="nut-h">
        <div className="container feature-split">
          <div>
            <span className="eyebrow">Nutrition explained</span>
            <h2 id="nut-h">The science, in plain language</h2>
            <p className="lede">Short, clear guides on the basics that matter most — written from public-health evidence and honest about what we don&apos;t know.</p>
            <Link href="/nutrition" className="btn btn-secondary" style={{ marginTop: 12 }}>
              Browse nutrition guides
            </Link>
          </div>
          <div className="grid" style={{ gap: 12 }}>
            {nutritionArticles.slice(0, 5).map((a) => (
              <Link key={a.slug} href={`/nutrition/${a.slug}`} className="card card-link" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <span>
                  <strong style={{ color: "var(--violet)" }}>{a.title}</strong>
                  <span className="xs muted" style={{ display: "block" }}>
                    {a.readMin} min read
                  </span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Meal-plan preview */}
      <section className="section container" aria-labelledby="plan-h">
        <div className="section-head">
          <div>
            <span className="eyebrow">Meal planner</span>
            <h2 id="plan-h">A week of meals, in seconds</h2>
            <p>Tell us your budget, time, household and tastes. We reuse ingredients across the week, suggest batch cooking and build one consolidated shopping list.</p>
          </div>
          <Link href="/meal-planner" className="btn btn-primary">
            Build My Meal Plan
          </Link>
        </div>
        <div className="week-preview" role="list" aria-label="Example seven-day plan">
          {preview.days.map((d) => (
            <div key={d.label} className="day" role="listitem">
              <strong>{d.label.slice(0, 3)}</strong>
              {d.entries.map((e) => {
                const r = e.recipeSlug ? getRecipe(e.recipeSlug) : undefined;
                return (
                  <div key={e.id} className="meal">
                    <span>{SLOT_LABELS[e.slot]}</span>
                    {r ? <Link href={`/recipes/${r.slug}`}>{r.title}</Link> : e.customTitle}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="xs muted" style={{ marginTop: 8 }}>
          Example plan for two people, moderate budget, up to an hour per meal.
        </p>
      </section>

      {/* 8. Health conditions */}
      <section className="section section-dark" aria-labelledby="cond-h">
        <div className="container feature-split">
          <div>
            <span className="eyebrow" style={{ color: "#d9c3b8" }}>
              Health conditions
            </span>
            <h2 id="cond-h">Responsible guidance, not miracle cures</h2>
            <p>
              Every guide explains what nutrition can reasonably contribute, what it cannot do, the strength of the evidence, warning signs and when to see a clinician — with authoritative references.
            </p>
            <Link href="/health-conditions" className="btn btn-light" style={{ marginTop: 12 }}>
              Explore condition guides
            </Link>
          </div>
          <ul className="grid grid-2" style={{ listStyle: "none", padding: 0, gap: 12 }}>
            {conditions.slice(0, 8).map((c) => (
              <li key={c.slug} style={{ margin: 0 }}>
                <Link href={`/health-conditions/${c.slug}`} style={{ display: "block", padding: "14px 16px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 12, textDecoration: "none" }}>
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Fitness */}
      <section className="section container" aria-labelledby="fit-h">
        <div className="section-head">
          <div>
            <span className="eyebrow">Fitness &amp; wellness</span>
            <h2 id="fit-h">Move more, in ways that fit your life</h2>
          </div>
          <Link href="/fitness" className="link-arrow">
            All routines
          </Link>
        </div>
        <div className="grid grid-3">
          {fitnessGuides.slice(0, 3).map((g) => (
            <Link key={g.slug} href={`/fitness/${g.slug}`} className="card card-link">
              <div className="row xs muted" style={{ marginBottom: 8 }}>
                <span className="chip chip-outline">{g.difficulty}</span>
                <span>{g.durationMin} min</span>
              </div>
              <h3 className="serif" style={{ fontWeight: 500, fontSize: "1.3rem" }}>
                {g.title}
              </h3>
              <p className="small muted">{g.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. Supplements */}
      <section className="section section-alt" aria-labelledby="sup-h">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Supplement education</span>
              <h2 id="sup-h">Know before you buy</h2>
              <p>Evidence grades, risks, interactions and safety limits — from a site that doesn&apos;t sell supplements.</p>
            </div>
            <Link href="/supplements" className="link-arrow">
              Supplement guides
            </Link>
          </div>
          <div className="chip-row">
            {supplements.map((s) => (
              <Link key={s.slug} href={`/supplements/${s.slug}`} className="chip chip-outline" style={{ textDecoration: "none", fontSize: "var(--fs-sm)", padding: "8px 14px" }}>
                {s.name} · {s.evidence.strength.toLowerCase()} evidence
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Professionals */}
      <section className="section container" aria-labelledby="pro-h">
        <div className="feature-split">
          <div>
            <span className="eyebrow">Qualified professionals</span>
            <h2 id="pro-h">Find verified nutrition support</h2>
            <p className="lede">
              Our directory of registered dietitians, nutritionists and wellness professionals is opening soon. Every listing will be verified before it appears — we will never show unverified credentials.
            </p>
            <div className="row" style={{ marginTop: 12 }}>
              <Link href="/professionals" className="btn btn-secondary">
                About the directory
              </Link>
              <Link href="/for-businesses" className="link-arrow">
                Are you a professional? Apply to be listed
              </Link>
            </div>
          </div>
          <div className="card card-muted">
            <h3>How verification works</h3>
            <ol className="numbered" style={{ marginBottom: 0 }}>
              <li>Professionals apply with their registration body and number.</li>
              <li>We check credentials against the relevant public register.</li>
              <li>Only verified profiles are published, marked with their verification date.</li>
              <li>Anyone can report an inaccurate listing for review.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 12. Newsletter */}
      <section className="section section-alt" aria-labelledby="news-h">
        <div className="container feature-split">
          <div>
            <span className="eyebrow">Newsletter</span>
            <h2 id="news-h">One good email a week</h2>
            <p className="lede">A seasonal recipe, a practical nutrition tip and a meal-plan idea. No spam, no miracle claims.</p>
          </div>
          <div className="card">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>

      {/* 13. Free vs premium */}
      <section className="section container" aria-labelledby="price-h">
        <div className="section-head">
          <div>
            <span className="eyebrow">Free &amp; Premium</span>
            <h2 id="price-h">Useful for free. More convenient with Premium.</h2>
            <p>Recipes, education, meal planning, shopping lists and the shopping calendar are free for everyone. Premium adds extra planning power for busy households.</p>
          </div>
          <Link href="/pricing" className="link-arrow">
            Compare plans
          </Link>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <h3>{free.name}</h3>
            <p className="muted small">{free.tagline}</p>
            <ul className="check-list small">
              {free.features.slice(0, 6).map((f) => (
                <li key={f}>{FEATURE_LABELS[f]}</li>
              ))}
            </ul>
          </div>
          <div className="price-card featured">
            <h3>
              {premium.name} {!offers.sellable && <span className="chip" style={{ marginLeft: 8 }}>Coming soon</span>}
            </h3>
            {fromPrice && <p className="price-amount" style={{ fontSize: "1.8rem" }}>{fromPrice}</p>}
            <p className="small">{premium.tagline}</p>
            <ul className="check-list small">
              <li>Up to {premium.limits.savedPlans} saved weekly plans</li>
              {premiumLiveExtras()
                .filter((f) => f !== "planner.saved-plans.multiple")
                .map((f) => (
                  <li key={f}>{FEATURE_LABELS[f]}</li>
                ))}
            </ul>
            <p className="xs" style={{ opacity: 0.85 }}>
              Planned: {premiumPlannedExtras()
                .map((f) => FEATURE_LABELS[f].toLowerCase())
                .join("; ")}
              .
            </p>
            <Link href="/pricing" className="btn btn-light btn-sm">
              {offers.sellable ? "See Premium" : "Join the waitlist"}
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Trust */}
      <section className="section section-alt" aria-labelledby="trust-h">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our standards</span>
              <h2 id="trust-h">Why you can trust what you read here</h2>
            </div>
            <Link href="/editorial-policy" className="link-arrow">
              Editorial policy
            </Link>
          </div>
          <div className="grid grid-4">
            {[
              { icon: "book", title: "Cited sources", body: "Health claims link to public-health agencies, national health services and clinical guidelines." },
              { icon: "shield", title: "Honest review status", body: "Each guide shows who wrote it and whether a qualified professional has reviewed it yet — never a fake reviewer." },
              { icon: "activity", title: "Transparent nutrition", body: "Every nutrient figure is an estimate you can trace to individual ingredients and their reference data." },
              { icon: "alert", title: "No miracle claims", body: "We never claim a food or supplement cures disease, and never advise stopping prescribed treatment." },
            ].map((t) => (
              <div key={t.title} className="card">
                <span className="goal-card" style={{ minHeight: 0 }}>
                  <span className="icon">
                    <Icon name={t.icon} />
                  </span>
                </span>
                <h3 style={{ marginTop: 12 }}>{t.title}</h3>
                <p className="small muted">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
