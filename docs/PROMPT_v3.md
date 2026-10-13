# NOURISHWELL: MASTER BUILD PROMPT

## Version 3.0 (supersedes Version 2.0)

This document is a prompt. It is addressed to you, the AI website builder or coding agent working on NourishWell. Read all of it before you change anything. Where this version conflicts with Version 2.0 or with older notes in the repository, this version wins.

### What changed from Version 2.0

| Area | Version 2.0 | Version 3.0 |
| --- | --- | --- |
| Starting point | Build from scratch | A working Next.js site exists. Extend it; do not rebuild it (section 2) |
| Typography | Serif headlines, sans-serif body | One serif family, Source Serif 4, for all text (section 4.3) |
| Logo | Not specified | "NourishWell" two-colour wordmark on Parchment (section 4.4) |
| Cuisine focus | Broad global list, East African emphasis | Lead with United States, United Kingdom and Asian meals (section 8) |
| Navigation | "Every item leads to a real page or interaction" | Every header item opens its own page; no scroll-to-section links (section 5) |
| Shopping | Shopping list | Shopping list plus a recurring shopping calendar (section 9.4) |
| Photography | Realistic photography | Ingredient-accurate illustrations now; labelled AI dish images next; licensed photography of tested dishes later (section 4.5) |
| Monetization | One paragraph on freemium | Full section: Stripe subscriptions, featured listings, sponsorships, affiliate links, rules and tests (section 15) |
| Marketing | Not covered | Full section: positioning, audiences, channels, lifecycle email, attribution, KPIs, compliance (section 16) |
| Acceptance tests | General | Checkable criteria per section, plus monetization and marketing tests (section 22) |

---

## 1. MISSION AND FIXED DECISIONS

### 1.1 Mission

NourishWell is a global, consumer-first platform for healthy recipes, practical meal planning, evidence-informed nutrition education, disease-aware eating, supplements, physical activity and everyday wellbeing.

Tagline: **Eat Better. Feel Stronger. Live Well.**

Work as one integrated team: product designer, UX architect, full-stack developer, database architect, nutrition content strategist, SEO specialist, accessibility engineer, growth marketer and quality-assurance lead.

Deliver working software. A plan, a wireframe or an attractive homepage on its own is not a deliverable.

### 1.2 Fixed business decisions

Do not change these without a compelling technical reason, and state that reason in your report if you do.

1. Brand: NourishWell. Tagline: Eat Better. Feel Stronger. Live Well.
2. Market: global from launch, with the United States, the United Kingdom and Asia (including Asian diaspora households in the US and UK) as the lead markets.
3. Audience: individual consumers, households, busy professionals and people who want practical nutrition education.
4. Business model: a genuinely useful free platform, an optional Premium subscription, paid featured business listings, clearly labelled sponsorships, and (later) disclosed affiliate links.
5. Visual direction: premium editorial, warm, natural, sophisticated and welcoming.
6. Primary objective: earn trust, encourage repeat use and make healthy eating easier to practise.
7. Expansion objective: add verified professionals, business tools and partnerships only after the consumer experience is strong.

### 1.3 Honesty rules (absolute)

These rules override every other instruction in this prompt, including growth and revenue goals.

1. Never invent reviews, ratings, testimonials, user counts, audience numbers, traffic figures, prices, discounts, professionals, credentials, endorsements, awards, press mentions or citations.
2. Never show a price that is not the price the customer will be charged. Prices come from the payment provider at request time (section 15.4).
3. Never claim that payments, email delivery, accounts or any integration works until it is configured and has been tested end to end. When something is not configured, the interface says so plainly.
4. Never claim professional or clinical review that has not happened. Never record a reviewer without a review date.
5. Never claim legal or regulatory compliance. Write "assess with counsel" and list what needs assessing.
6. Never report a test as passed unless you ran it. Record the date, the environment and the result.
7. Never present an AI-generated image as a photograph of the actual tested dish.
8. Never use scarcity or urgency that is not true ("only 3 left", countdown timers on evergreen offers).

---

## 2. CURRENT BASELINE: PRESERVE, DON'T REBUILD

A working site already exists in this repository. Your job is to extend it. Do not rewrite working modules, rename routes, change the stack or replace the design system unless a requirement in this prompt cannot be met otherwise.

### 2.1 Stack

- Next.js 15 (App Router), React 19, TypeScript in strict mode.
- One design-token stylesheet: `src/app/globals.css`.
- Zod for all form and API input validation.
- Vitest for unit tests, Playwright for browser tests (`e2e/interact.cjs`, `e2e/crawl.cjs`).
- No runtime dependency on external services. Every integration is optional and controlled by environment variables.
- `supabase/schema.sql`: PostgreSQL schema with Row Level Security, applied and RLS-tested on PostgreSQL 16. Not yet connected to the app.

### 2.2 Layering (keep it)

```
src/content/      typed content: recipes, ingredients (nutrient table), guides, references, collections, directory
src/lib/          pure domain logic, no React: nutrition, units, recipe-meta, planner, shopping,
                  shopping-schedule, search, plans/entitlements, storage, analytics
src/components/   presentation; client components are marked "use client"
src/app/          routes, metadata, route handlers
```

Business rules live in `src/lib/` and are unit-tested without the UI. Dietary tags, allergens, nutrition estimates and relative cost are derived from the ingredient table. They are never typed by hand.

### 2.3 Routes that exist

| Group | Routes |
| --- | --- |
| Home and discovery | `/`, `/discover`, `/discover/[slug]`, `/search` |
| Recipes | `/recipes`, `/recipes/[slug]`, `/recipes/compare` |
| Education | `/nutrition`, `/nutrition/[slug]`, `/health-conditions`, `/health-conditions/[slug]`, `/supplements`, `/supplements/[slug]`, `/fitness`, `/fitness/[slug]`, `/wellness` |
| Planning | `/meal-planner`, `/shopping-list`, `/shopping-calendar` |
| User | `/account`, `/dashboard` |
| Directory | `/professionals`, `/professionals/[slug]`, `/businesses`, `/businesses/[slug]`, `/for-businesses` |
| Commercial | `/pricing` |
| Company and legal | `/about`, `/editorial-policy`, `/medical-disclaimer`, `/privacy`, `/terms`, `/accessibility`, `/contact` |
| Admin and API | `/admin` (Basic Auth), `/api/forms/[type]`, `sitemap.xml`, `robots.txt` |

### 2.4 Monetization and marketing routes (built; working once Stripe is configured)

| Route | Purpose |
| --- | --- |
| `/pricing` (rebuilt) | Monthly/yearly toggle, live Stripe prices, trial if configured, FAQ, promises |
| `/account/billing` | Subscription status, manage billing, remove Premium from this device |
| `/for-businesses` (rebuilt) | Free basic listing versus paid featured listing |
| `/for-businesses/upgrade` | Pay for a featured listing via a signed link (`?listing=…&sig=…`) issued after verification |
| `/advertise` | Partnerships and sponsorship |
| `/how-we-make-money` | Revenue disclosure and editorial independence |
| `/free-meal-plan` | Lead magnet: free printable 7-day starter plan |
| `POST /api/billing/checkout` | Create a Stripe Checkout Session |
| `GET /api/billing/confirm` | Verify a Checkout Session, set the entitlement cookie, redirect |
| `POST /api/billing/portal` | Open the Stripe Customer Portal |
| `POST /api/billing/webhook` | Signature-verified Stripe webhook |
| `GET /api/billing/entitlement` | Current entitlement for this device |
| `POST /api/billing/signout` | Remove Premium from this device |
| `POST /api/premium/export` | Server-enforced Premium export (CSV and .ics) |

### 2.5 Features that work today

- Homepage with 15 editorial sections and a shopping-day banner (`ShoppingDueBanner`).
- Recipe library: 51 recipes (7 American, 7 British, 11 Asian, 14 African, 12 Mediterranean, Middle Eastern, Latin American and global), 15 filters, URL-shareable filter state, sorting.
- Recipe pages: serving scaling, metric and US units, substitutions, storage and reheating, food safety, allergens, print, share, save, add to plan, add to shopping list.
- Nutrition transparency: per-ingredient breakdown, reference sources, proxy foods flagged, estimate labelling, recipe comparison.
- Education: 16 nutrition guides, 22 health-condition guides in the 12-part structure, 12 supplement guides, 14 fitness and wellness guides. All are labelled "clinical review pending" until a qualified reviewer signs off.
- Nine curated collections, including `american-classics`, `british-favourites`, `asian-kitchen` and `east-african-kitchen`.
- Meal planner: preferences, generation with hard and soft constraints, replace, move, servings, mark prepared, custom meals, saved plans, duplicate as template, batch-cooking ideas, daily estimates. Stored on the device.
- Shopping list: consolidation across recipes, aisle grouping, check-off, editing, custom items, print, share, user-entered prices with currency.
- Shopping calendar: see section 9.4.
- Dashboard, account preferences, JSON data export, delete-all-data, consent controls.
- Search across recipes, guides and regional ingredient names.
- Professional and business directory that stays empty until entries are verified, plus a listing application form.
- Newsletter, contact and listing forms with validation, honeypot and per-IP rate limit. They deliver to webhook URLs and say honestly when no webhook is configured.
- `/admin` behind HTTP Basic Auth (404 when credentials are unset): content inventory, review status, integration status, reference library, plan configuration.
- SEO: metadata, canonical URLs, sitemap, robots, breadcrumbs, JSON-LD (Organization, BreadcrumbList, Article, MedicalWebPage). Recipe JSON-LD only when a recipe has an eligible image.

### 2.6 Tests that exist

- 80 unit tests at the time of writing (nutrition, scaling, planner, shopping, shopping calendar, billing, entitlements, exports, attribution, content integrity, forms, search). Keep all of them passing; add tests for every new rule.
- Billing suite (`npm run e2e:billing`, 36 checks against the mock Stripe API in `e2e/mock-stripe.cjs`).
- Browser interaction suite (36 checks) and crawl suite (every reachable page returns 200, has one `<h1>`, a meta description, no duplicate titles, no images without alt text, no horizontal overflow at 390 px, no console errors).
- QA history is recorded in `docs/QA_REPORT.md`. Append to it; do not overwrite past results.

### 2.7 Acceptance criteria for this section

- [ ] `git diff --stat` for your work shows no deletions of working features listed in 2.5.
- [ ] All existing routes in 2.3 still return 200 (or 404 for `/admin` when credentials are unset).
- [ ] `npm run typecheck`, `npm run lint` and `npm test` pass before and after your change.

---

## 3. HOW TO WORK

### 3.1 Inspect first

Before you change code:

1. Read `README.md`, `docs/ARCHITECTURE.md`, `docs/QA_REPORT.md`, `src/lib/plans.ts` and `src/lib/site.ts`.
2. List the routes in `src/app` and compare them with section 2.3 and 2.4.
3. Check which environment variables are set. A name in the code does not mean the integration is configured.
4. Write a short plan: what exists, what is missing, what you will build, in what order. Then start building in the same session.

### 3.2 Definition of done (for any feature)

A feature is done only when all of these are true:

1. It works on desktop (1440 px) and mobile (390 px) with no horizontal scroll.
2. It is keyboard-operable with visible focus.
3. Loading, empty, error and not-configured states are designed and honest.
4. Business rules are in `src/lib/` and covered by unit tests.
5. User-facing claims are true today.
6. `docs/` is updated where behaviour or configuration changed.

### 3.3 External services

Use the repository's existing patterns first. Add an external service only when a requirement needs it, and only behind an environment variable with an honest fallback. Prefer `fetch` to a heavy SDK when the API surface is small (the Stripe integration uses `fetch`, not the Stripe SDK).

---

## 4. BRAND AND ART DIRECTION

### 4.1 Personality

Warm, credible, intelligent, optimistic, inclusive, practical, science-informed and visually refined. Premium without making healthy eating look expensive, restrictive or exclusive.

### 4.2 Colour tokens

Define these once as CSS custom properties in `globals.css` and use the tokens everywhere. Do not introduce new brand colours.

| Token | Hex | Use |
| --- | --- | --- |
| Midnight Violet | `#1f0e2f` | Primary brand colour, primary buttons, "Well" in the logo |
| Parchment | `#f4efed` | Page background and header background |
| Ash | `#aab2b0` | Secondary surfaces, dividers |
| Mauve Bark | `#725246` | Restrained accent (links on hover, small highlights) |
| Dark Slate | `#2C3E39` | Body text |
| White | `#FFFFFF` | Content cards and form surfaces |
| Deep Forest | `#0A2610` | "Nourish" in the logo only |

Acceptance criteria:

- [ ] Every text and background pair meets WCAG 2.2 AA contrast (4.5:1 for body text, 3:1 for large text and UI components). Ash is not used as a text colour on Parchment or White.
- [ ] Hover, focus, pressed and disabled states are readable on every button variant, including on dark sections.

### 4.3 Typography

Use one family, **Source Serif 4**, loaded through `next/font`, for all text: headlines, dish names, body copy, navigation, buttons, labels, inputs and tables. Version 2.0's sans-serif body is superseded.

- Use weight, size, optical sizing, letter-spacing and case for hierarchy, not a second family.
- Body text at least 17 px on desktop and 16 px on mobile, line height 1.5 or more.
- Numerals in nutrition tables and prices use tabular figures.

Acceptance criteria:

- [ ] In the browser, the computed `font-family` of every visible element resolves to Source Serif 4 (with its fallback stack).
- [ ] No other web font is downloaded.

### 4.4 Logo

The logo is a text wordmark: **"Nourish"** in bold, colour `#0A2610`, immediately followed by **"Well"** in regular weight, colour `#1f0e2f`, set in Source Serif 4. No space between the words. The header background stays Parchment `#f4efed` and is fully opaque.

Acceptance criteria:

- [ ] The wordmark links to `/` and has an accessible name of "NourishWell home".
- [ ] It does not wrap or overflow at 320 px wide.

### 4.5 Food imagery

Imagery is introduced in three stages. Never skip the labelling rules.

| Stage | What is shown | Rules |
| --- | --- | --- |
| Now | Ingredient-accurate SVG illustrations (`components/FoodArt.tsx`) generated from each recipe's real ingredients | Decorative but accurate; descriptive `alt` text |
| Next | AI-generated "clean white plate" dish images (generated with Higgsfield), stored in `public/images/recipes/` and registered in `src/content/recipe-photos.ts` | `kind: "ai-generated"` in metadata; a visible "AI-generated image" credit on the recipe page; never described as a photo of the tested dish; ingredients shown must match the recipe |
| Later | Licensed photography of the kitchen-tested recipe | `kind: "photograph"`, licence kept on file, photographer credited |

Art direction for all stages: natural daylight, a plain white plate on a warm neutral surface, tactile ingredients, editorial composition, no props that imply ingredients the recipe does not contain. Avoid stock-photo repetition, exaggerated fitness imagery, fear imagery and before-and-after images.

Acceptance criteria:

- [ ] Every image has descriptive `alt` text that describes the dish, not "image of food".
- [ ] Every AI-generated image shows an "AI-generated image" credit next to it and in its metadata.
- [ ] Recipe structured data is emitted only when the image meets search-engine eligibility rules and matches the visible dish. Decide and document whether AI images qualify; if in doubt, do not emit it.

### 4.6 Interface quality

Generous whitespace, careful alignment, restrained motion (respect `prefers-reduced-motion`), clear hierarchy. No heavy gradients, glassmorphism, oversized decoration or repetitive generic cards. Design mobile layouts deliberately rather than shrinking desktop.

---

## 5. INFORMATION ARCHITECTURE AND NAVIGATION

### 5.1 Header

Primary navigation (from `src/lib/site.ts`):

1. Discover (`/discover`)
2. Recipes (`/recipes`)
3. Nutrition (`/nutrition`)
4. Health Conditions (`/health-conditions`)
5. Meal Planner (`/meal-planner`)
6. Fitness & Wellness (`/fitness`)
7. Supplements (`/supplements`)
8. Professionals (`/professionals`)
9. For Businesses (`/for-businesses`)

Rules:

- Each item opens its own page. No anchor links, no scroll-to-section behaviour, no mega-menus that replace the page.
- Also provide: search, saved items, account access and a prominent "Build My Meal Plan" action (`/meal-planner`).
- "Pricing" is reachable from the header (as a secondary link or inside the account menu) and from the footer.
- On mobile, use the existing compact navigation and bottom tab bar (`MobileTabBar`) with quick access to search, recipes, planner and saved items.

### 5.2 Footer

Keep the four groups in `footerNav`. Add: `/pricing`, `/free-meal-plan`, `/advertise`, `/how-we-make-money`, and `/account/billing` (only when relevant, or under the account group).

### 5.3 Acceptance criteria

- [ ] Clicking each header item changes the URL path and loads a page with its own `<h1>`.
- [ ] No header link contains `#`.
- [ ] Every footer link returns 200.

---

## 6. HOMEPAGE

### 6.1 Hero

- Headline: **Feel Better Starts on Your Plate.**
- Supporting copy: "Discover delicious recipes, practical nutrition guidance, personalized meal ideas, and healthier habits designed around your real life."
- Primary CTA: "Explore Recipes" (`/recipes`). Secondary CTA: "Build My Meal Plan" (`/meal-planner`).

### 6.2 Section order

0. Shopping-day banner (only when a trip is due; see 9.4).
1. Hero.
2. Recipe search and quick discovery.
3. Featured breakfast, lunch, dinner and supper recipes, led by US, UK and Asian dishes.
4. Explore by health goal.
5. Cultural, budget and seasonal collections (American Classics, British Favourites, The Asian Kitchen first).
6. Nutrition explained simply.
7. Seven-day planning preview.
8. Health-condition guides.
9. Fitness and lifestyle.
10. Supplement education.
11. Professionals (shows an honest empty state until listings are verified).
12. Newsletter signup with a link to `/free-meal-plan`.
13. Free versus Premium introduction (links to `/pricing`).
14. Trust: editorial standards, review status, how we make money.
15. Footer.

### 6.3 Acceptance criteria

- [ ] No placeholder text, lorem ipsum or invented statistics on the page.
- [ ] Section 11 never shows a fabricated professional.
- [ ] The free-versus-Premium block shows live prices or "Coming soon", never a hardcoded price.

---

## 7. RECIPE DISCOVERY ENGINE

### 7.1 Categories and filters

Keep the existing categories (breakfast, lunch, dinner, supper, snacks, smoothies and beverages, soups, salads, mains, sides, desserts) and the 15 existing filters (meal, cuisine/region, preparation, cooking and total time, difficulty, ingredient, relative cost, diet, allergens, cooking method, equipment, protein source, nutritional characteristics, servings). Filter state stays in the URL.

### 7.2 Recipe page requirements

Every recipe has: title and short introduction; image (section 4.5); prep, cook and total time; adjustable servings; quantities with units and gram weights; numbered steps; equipment and tips; substitutions; storage and reheating; food-safety notes where there is real risk; nutrition estimates per serving (energy, protein, carbohydrate, fat, saturated fat, fibre, sodium) labelled as estimates; derived allergens and dietary tags; relative cost; author and reviewer only when real; references for any health claim; related recipes; save, share, print, add to plan and add to shopping list.

### 7.3 Content quality rules

- Do not mass-generate recipes to make the library look bigger. Add recipes in small, complete batches.
- Every ingredient must exist in `src/content/ingredients.ts` with sourced per-100 g values (USDA FoodData Central or a national composition table), and a `proxy` note if a similar food is used.
- Never type nutrition, allergens or diet tags by hand.
- Record kitchen-testing status on each recipe once testing happens. Until then, do not describe a recipe as "tested".

### 7.4 Acceptance criteria

- [ ] Changing servings from 4 to 5 changes 400 g to 500 g on the page and in the shopping list.
- [ ] The US toggle shows US customary units with sensible rounding.
- [ ] Unit tests confirm every recipe resolves all ingredients, has complete steps and has plausible per-serving energy.
- [ ] No claim field contains cure language (tested).

---

## 8. GLOBAL-FIRST, WITH A CLEAR CUISINE FOCUS

### 8.1 Cuisine priority

| Priority | Cuisines | Instruction |
| --- | --- | --- |
| Lead | United States, United Kingdom, Asian (East Asian, South Asian, Southeast Asian) | Feature first on the homepage, in collections, in the free meal plan and in new content. Grow these first. |
| Keep | East African (Kenyan, Somali, Swahili, Ugandan, Ethiopian) | Keep the existing 14 African recipes and their regional ingredient names. Maintain them; do not expand this set for now. |
| Secondary | Mediterranean, Middle Eastern, Latin American, European | Keep; add occasionally where they fill a planning gap. |

Today: 7 American, 7 British, 11 Asian recipes (22 of the 51 added in the US/UK/Asia expansion). A sensible next target is balance across the three lead regions and across meal slots, so a full week can be planned from any one lead cuisine. Add recipes only at the quality bar in 7.3.

### 8.2 Internationalisation readiness

- English only for now. Never imply other languages are available.
- Metric and US customary units; British and American spellings handled through ingredient `altNames` and search synonyms (for example courgette/zucchini, aubergine/eggplant, coriander/cilantro, prawns/shrimp, spring onion/scallion).
- Region, units and currency are user preferences. Currency is formatted with `Intl.NumberFormat`.
- Do not hardcode one currency, country or unit system.

### 8.3 Acceptance criteria

- [ ] A search for "zucchini" and for "courgette" returns the same recipes (add a test).
- [ ] The homepage featured row and the first three collections are US, UK and Asian.
- [ ] The free meal plan offers American, British and Asian kitchens (section 16.6).

---

## 9. MEAL PLANNING, SHOPPING LIST AND SHOPPING CALENDAR

### 9.1 Onboarding

Ask only what improves the plan: goals, cuisines, diet, dislikes, allergies and intolerances, household size, skill, budget level, time, equipment, preferred meals, region. Medical questions are not asked. Optional questions explain why they are asked.

### 9.2 Weekly planner

Keep the existing planner rules: hard constraints (diet, allergens, dislikes) never relax; soft constraints (time, budget) relax only to fill an empty slot, and the plan says so; ingredient reuse and pantry items score higher; no back-to-back repeats; seeded and reproducible.

### 9.3 Shopping list

Keep consolidation (scale, convert spoons to ml, merge by ingredient and unit), aisle grouping, check-off, edits, custom items, print, share and user-entered prices. Regenerating from a plan keeps checks, prices and custom items. Estimated costs are always distinguished from prices the user entered.

### 9.4 Shopping calendar (exists; preserve)

- A schedule has a start day, a frequency (every 1, 2, 3 or 4 weeks), an end rule (never, after N trips, or until a date), and a lead time of 0, 1 or 2 days.
- Dates are calendar days (`YYYY-MM-DD`) handled in UTC so daylight-saving changes never move a shopping day.
- On shopping day (or from 1 to 2 days early if a lead time is set), the shopping list appears at the top of the homepage. It stays there until the user marks the trip done. A missed trip stays as "still to do" until the next trip's window opens. "Hide for today" snoozes until tomorrow.
- "Done shopping" marks the trip complete and clears ticked items.
- `.ics` export with `RRULE:FREQ=WEEKLY;INTERVAL=n` plus `COUNT` or `UNTIL`.
- Stored on the device today; maps to one row per user when accounts launch.

### 9.5 Free versus Premium planning

- Free: the full planner, one active plan and up to 3 saved weekly plans, the shopping list, the shopping calendar and its `.ics` export, printing and sharing.
- Premium: up to 50 saved plans, household planning, batch-cooking schedules, advanced filters, enhanced shopping lists, personal collections, and the server-enforced export (`POST /api/premium/export`: meal plan and shopping list as CSV, and calendar `.ics` of meals).

### 9.6 Acceptance criteria

- [ ] The existing shopping-calendar unit tests and browser checks still pass.
- [ ] Saving a 4th plan on the free tier shows a clear limit message and a contextual Premium prompt; it does not silently discard data.
- [ ] Calling `POST /api/premium/export` without a valid entitlement returns 402 or 403 with a helpful JSON message; with a valid entitlement it returns the files.

---

## 10. NUTRITION EDUCATION AND HEALTH CONDITIONS

### 10.1 Core nutrition topics

Keep the 16 guides (macronutrients, protein, carbohydrates, fats, fibre, vitamins and minerals, hydration, added sugar, sodium, food labels, portions, dietary diversity, food safety, life stages, balanced meals, myths and evidence). For new UK and US readers, add country-relevant references (for example NHS and the UK Eatwell Guide; USDA Dietary Guidelines and MyPlate) where the guide gives country-specific advice.

### 10.2 Health-condition guides

Keep the 22 condition guides. Every guide has all 12 parts, in this order:

1. What the condition is.
2. What nutrition can reasonably contribute.
3. What nutrition cannot do.
4. Established evidence and important uncertainties.
5. Relevant eating patterns and nutrients.
6. Practical food choices and recipes.
7. Restrictions and special considerations.
8. Medication and nutrient interaction cautions.
9. When professional care is necessary, including urgent warning signs.
10. Questions to ask a clinician.
11. Authoritative references.
12. Review status and last-reviewed date.

### 10.3 Medical safety

- Never promise that a food, supplement or plan cures, reverses or prevents a disease.
- Never advise stopping prescribed medication or replacing treatment with diet.
- Specialised topics (kidney disease, diabetes on medication, cancer treatment, pregnancy, coeliac disease, eating disorders) are marked `specialized: true` and need qualified clinical review before they lose the "clinical review pending" label.
- Health-condition pages are never added to recently-viewed history, never fire analytics events, and never carry sponsorships, affiliate links or upgrade prompts.

### 10.4 Evidence standards

Prefer public-health agencies, national health services, recognised medical organisations, clinical guidelines and systematic reviews. Store title, publisher, URL (HTTPS), publication or update date and the date you checked it. Cite only sources you have opened.

### 10.5 Acceptance criteria

- [ ] Unit test: every condition guide has all 12 parts filled.
- [ ] Unit test: no guide has a reviewer without `lastReviewed`.
- [ ] Unit test: no monetization component (sponsor block, affiliate link, upgrade prompt) renders on `/health-conditions/*`.

---

## 11. SUPPLEMENT EDUCATION

Keep the 12 guides. Each explains: purpose and physiological role, food sources, strength and limits of evidence, possible use cases, risks and side effects, interactions and contraindications, upper limits, product-quality considerations, when to get professional advice, references and review date.

Rules: no unnecessary supplementation, no megadoses, no detox, miracle, disease-reversal or guaranteed weight-loss claims. Supplement commerce is not a launch dependency. If affiliate links are ever added to supplement pages, they need the disclosure in 15.8 and an editorial sign-off that the product category is appropriate; never on pages that discuss a disease.

---

## 12. FITNESS AND WELLNESS

Keep the 14 guides. Each states audience, difficulty, duration, equipment, instructions, modifications and safety precautions. Do not imply one routine suits everyone or that exercise offsets eating habits. Future tools (habit tracker, walking planner, sleep planner, hydration reminder, journal) stay optional and on-device until accounts launch.

---

## 13. ACCOUNTS AND DASHBOARD

### 13.1 Today

Personal data lives on the device under the `nw:` localStorage prefix, accessed through `useStored()`. Users can export JSON and delete everything from `/account`.

### 13.2 Next (Release 2)

1. Supabase Auth: sign-up, sign-in, password recovery.
2. Back the existing `useStored` keys with server-synced hooks reading and writing `meal_plans`, `meal_entries`, `shopping_lists`, `shopping_items`, `saved_items`, `user_preferences` and the shopping schedule. Components keep the `[value, setValue]` shape.
3. On first sign-in, offer to import device data.
4. Link Stripe customers to user accounts so Premium follows the user across devices (section 15.5).
5. Replace Basic Auth on `/admin` with role checks (`editor`, `clinical_reviewer`, `moderator`, `admin`).

### 13.3 Acceptance criteria (when built)

- [ ] A user cannot read or write another user's rows (RLS tests).
- [ ] Data export and account deletion work and are tested.
- [ ] Health-related preferences are never sent to analytics or advertising tools.

---

## 14. FREE AND PREMIUM: THE PRODUCT LINE

### 14.1 Principle

Free must be genuinely useful on its own. Premium sells convenience and scale, not health information.

### 14.2 Never paywalled

All recipes and recipe pages; core search and filters; all nutrition, health-condition, supplement and fitness education; the basic seven-day planner; the shopping list; the shopping calendar; data export and deletion; the directory. These are listed in `NEVER_PREMIUM` and the free feature list in `src/lib/plans.ts`. Add a unit test that fails if any of them moves to Premium only.

### 14.3 Premium features

| Feature key | What the user gets | Enforcement |
| --- | --- | --- |
| `planner.saved-plans.multiple` | Up to 50 saved plans (free: 3) | Device today; server when accounts exist |
| `planner.export` | CSV and `.ics` export of plan and list | Server (`/api/premium/export`) |
| `planner.household` | Household planning | Server when built |
| `planner.batch-schedule` | Step-by-step batch-cooking schedule | Server when built |
| `recipes.filters.advanced` | Advanced filters and saved filter sets | Server when built |
| `shopping.enhanced` | Multiple lists, aisle ordering, price history | Server when built |
| `collections.advanced` | Personal recipe collections | Server when built |

Only advertise a Premium feature on `/pricing` once it is built. Label anything not yet built as "Coming to Premium" or leave it off.

### 14.4 Acceptance criteria

- [ ] `/pricing` lists only built Premium features as included.
- [ ] Unit test: `hasEntitlement("free", f)` is true for every feature in `NEVER_PREMIUM`.

---

## 15. MONETIZATION

### 15.1 Goals and limits

Earn revenue that keeps the free product sustainable without weakening trust. Every revenue stream is disclosed on `/how-we-make-money`. Revenue never changes editorial content, health guidance or review outcomes.

### 15.2 Revenue streams, in priority order

| # | Stream | Status in this release | Notes |
| --- | --- | --- | --- |
| 1 | Premium subscription (monthly and yearly) | Build now | Stripe Checkout and Customer Portal |
| 2 | Paid featured business listings (monthly) | Build now | Only after verification; labelled "Featured" |
| 3 | Labelled sponsorships and partnerships | Pages and rules now; sell manually | Sponsored collections, newsletter sponsorship, brand partnerships |
| 4 | Affiliate links | Later | Disclosed, `rel="sponsored"`, never on health-condition pages |

Do not add display advertising networks, programmatic ads or third-party ad pixels.

### 15.3 The free/Premium line

See section 14. Never paywall health information or basic planning. Upgrade prompts appear only at natural limits (saved-plan limit, export) and never on health-condition pages.

### 15.4 Pricing principles

1. The owner sets prices in Stripe. The code never contains a price.
2. `/pricing` reads the live Stripe Price objects (`STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`) on the server. The price shown is the price charged.
3. Regional currencies: use Stripe multi-currency prices (`currency_options`) for USD, GBP and any Asian currencies the owner chooses. Today `/pricing` shows the Price's default currency and lists the other configured currencies; Stripe Checkout then shows the exact amount in the customer's currency before payment. Next improvement: show the visitor's own currency on `/pricing` when it can be determined without tracking. Show the currency code where it could be ambiguous (for example "US$" versus "S$").
4. The yearly price is cheaper per month than the monthly price. Show the saving only as computed from the live prices; never hardcode "save 30%".
5. Optional trial: `PREMIUM_TRIAL_DAYS` (integer). If unset or 0, no trial is mentioned anywhere.
6. Promotion codes are created by the owner in Stripe. Show a promo-code field only if Checkout is configured to accept them.
7. If Stripe is not configured (missing key or price IDs, or the Price lookup fails), Premium shows "Coming soon" and a waitlist signup (newsletter form with its own `source` value). No price, no "Subscribe" button.
8. Displayed consumer prices in the UK include VAT. Decide with an accountant how tax is shown in each market and configure Stripe Tax accordingly.

### 15.5 Entitlement model and enforcement

Until accounts exist:

- After Checkout, `GET /api/billing/confirm?session_id=…` retrieves the Checkout Session from Stripe on the server, confirms it is paid (or trialing) for the Premium price, and sets an httpOnly, Secure, SameSite=Lax cookie `nw_ent`, signed with `ENTITLEMENT_SECRET` (HMAC). It then redirects to `/account/billing`.
- The cookie contains the Stripe customer and subscription IDs, the plan and a re-check time. It contains no personal data. The re-check time is the earlier of (current period end plus a 3-day grace for late renewals) and 24 hours from now, so the server re-checks with Stripe at least daily.
- At the re-check, the server asks Stripe for the subscription. Active, trialing or past due (while Stripe retries the payment): issue a fresh token. Canceled, unpaid, incomplete or paused: drop Premium. So a cancellation takes effect at the end of the paid period. If Stripe cannot be reached, keep access for that request rather than punish the subscriber.
- Every Premium feature is checked on the server (`hasEntitlement` with a plan derived from a verified cookie or, later, a session). Hiding UI is not enforcement.
- `POST /api/billing/signout` removes Premium from this device (deletes the cookie) without cancelling the subscription.
- Limitation, stated on `/pricing` FAQ and `/account/billing`: Premium is per device and browser until accounts launch. Restoring Premium on a new device goes through support (`/contact`), which verifies the customer and sends a restore link or instructions.
- When accounts launch, store `stripe_customer_id` on the user, write subscription state only from verified webhooks, and make Premium follow the account.

Acceptance criteria:

- [ ] A tampered or unsigned `nw_ent` cookie is rejected (unit test).
- [ ] An expired cookie triggers a Stripe re-check (unit test with a mocked Stripe API via `STRIPE_API_BASE`).
- [ ] `/api/premium/export` refuses requests without a valid entitlement.

### 15.6 Billing UX requirements

1. Before payment, `/pricing` states in plain words: the price and currency, the billing interval, that it renews automatically until cancelled, the trial length and what happens when it ends (if a trial exists), and how to cancel.
2. Stripe Checkout shows the final amount including tax before the customer pays.
3. Customers can cancel at any time through the Stripe Customer Portal (`POST /api/billing/portal`), which also handles payment-method updates, plan switching, receipts, invoices and billing history.
4. `/account/billing` shows: plan, status (active, trialing, past due, cancels on [date]), next renewal date, "Manage billing" (portal), "Remove Premium from this device", and the per-device limitation.
5. Failed payments: Stripe retries and emails per the owner's Stripe settings; the site shows "Payment problem: update your card" on `/account/billing` when the subscription is past due.
6. No dark patterns: no pre-ticked add-ons, no hidden renewal terms, no obstructive cancellation, no confirmshaming.
7. `/terms` includes subscription, renewal, cancellation and refund terms (draft, flagged for legal review).

### 15.7 Featured listings

1. A business applies through `/for-businesses` (free basic listing). Applications go to `LISTINGS_WEBHOOK_URL`.
2. The owner verifies the business (see `docs/OPERATIONS.md`). Nothing is paid before verification.
3. In `/admin`, the owner generates a signed upgrade link: `/for-businesses/upgrade?listing=<slug>&sig=<hmac>` (signed with `ENTITLEMENT_SECRET`).
4. The business pays through Checkout (`{product:"listing-featured", listing, sig}`), using `STRIPE_PRICE_LISTING_FEATURED`.
5. The owner marks the listing featured after confirming payment (manually until a database exists; later from the webhook).
6. Featured listings carry a visible "Featured" label, may be placed first within clearly labelled sections, and never gain a "verified" status, a rating or editorial endorsement because they paid.

Acceptance criteria:

- [ ] An upgrade link with a wrong or missing signature is refused before Checkout.
- [ ] The directory never shows an unverified entry, paid or not.

### 15.8 Sponsorships, partnerships and affiliate links

- Packages: sponsored collections, newsletter sponsorship, brand partnerships. Sold manually through `/advertise`.
- Every sponsored item carries a visible "Sponsored" or "In partnership with [brand]" label above the content, not only in the footer.
- Sponsors never write or approve health guidance, never influence review outcomes, and are never placed on health-condition pages.
- Exclude: weight-loss guarantees, detox and cleanse products, unproven supplements, disease-cure claims, alcohol, tobacco, gambling, and products marketed to children with poor nutritional profiles.
- `/advertise` gives no audience numbers. It says current numbers are available in the media kit on request.
- Affiliate links (later): `rel="sponsored noopener"`, a disclosure next to the first link on the page, a site-wide disclosure on `/how-we-make-money`, and never on health-condition pages.
- Targeting never uses health interests. No third-party ad pixels.

### 15.9 Disclosure page

`/how-we-make-money` explains: subscriptions, featured listings, labelled sponsorships, affiliate links (when used), the editorial-independence policy, that health interests are never used for ad targeting, and how to report a concern.

### 15.10 Monetization acceptance tests

- [ ] With no Stripe variables set: `/pricing` shows Free plus Premium "Coming soon" with a waitlist; `/api/billing/checkout` returns 503 with an honest message; nothing claims payments work.
- [ ] With test-mode variables set: `/pricing` shows the exact amounts and currencies of the Stripe test Prices. Pointing `STRIPE_PRICE_PREMIUM_MONTHLY` at a different test Price changes the amount shown (after the Price cache window, currently up to one hour, or a redeploy) with no code change. Stripe Price amounts cannot be edited, so a price change always means a new Price ID.
- [ ] Checkout with card 4242 4242 4242 4242 completes; `/api/billing/confirm` sets `nw_ent`; `/account/billing` shows Active (or Trialing).
- [ ] A 3-D Secure card (4000 0025 0000 3155) completes after authentication.
- [ ] A declined card does not grant Premium.
- [ ] Cancelling in the Customer Portal keeps Premium until period end, then removes it after the server re-check.
- [ ] The webhook rejects a request with a bad signature (400) and accepts a valid one.
- [ ] A featured-listing upgrade with a valid signed link completes; a forged link is refused.
- [ ] The Premium export works with an entitlement and is refused without one.
- [ ] `/pricing` states renewal, cancellation and trial terms before the Subscribe button.
- [ ] No price, discount or audience number appears in the source code (grep check).

---

## 16. MARKETING AND GROWTH

### 16.1 Positioning statement

For busy people and households in the US, the UK and across Asia who want to eat better without giving up the food they like, NourishWell is a free recipe and meal-planning site that turns familiar American, British and Asian dishes into a realistic weekly plan and a shopping list, with nutrition figures you can trace and health information that is honest about what food can and cannot do. Unlike diet apps and recipe blogs, it does not sell cures, hide its sources or lock basic planning behind a paywall.

### 16.2 Messaging pillars

1. **Familiar food, lighter.** Dishes people already cook, rebuilt with more vegetables, whole grains and lean protein.
2. **Plan once, shop once.** Seven-day plans, a consolidated list and a recurring shopping day.
3. **Numbers you can check.** Every nutrition figure traces to an ingredient and a source; estimates are labelled.
4. **Honest about health.** What nutrition can and cannot do; no cure claims; review status shown.
5. **Free where it matters.** Recipes, education and basic planning stay free; Premium adds convenience.

### 16.3 Audiences and value propositions

| Audience | Who | Main job to be done | Value proposition | Entry points |
| --- | --- | --- | --- | --- |
| US busy professionals | Working adults cooking 3 to 5 nights a week | Decide dinners fast and shop once | Lighter American classics and Asian weeknight dishes, planned in minutes | `/discover/american-classics`, `/discover/under-30-minutes`, `/meal-planner` |
| US households | Parents feeding mixed preferences | One plan that fits everyone and a predictable shop | Household servings, allergen filters, recurring shopping day | `/meal-planner`, `/shopping-calendar` |
| UK busy professionals | Commuters and hybrid workers | Healthier versions of British favourites, batch cooking | British favourites made lighter, batch-cooking ideas | `/discover/british-favourites`, `/fitness/meal-prep-basics` |
| UK households | Families on a budget | Cut waste and cost | Ingredient reuse, budget collection, shopping list with own prices | `/discover/budget-friendly`, `/shopping-list` |
| Asia-based readers | English-reading urban professionals in, for example, Singapore, Malaysia, India, the Philippines | Balanced versions of home cuisine, quick meals | Asian dishes with clear nutrition and sodium awareness | `/discover/asian-kitchen`, `/nutrition/sodium-and-salt` |
| Asian diaspora in US/UK | Households cooking heritage dishes alongside local food | Plan a mixed week; find substitutes in Western supermarkets | Mixed-cuisine plans and substitutions | `/discover/asian-kitchen`, recipe substitution sections |
| Health-conscious learners | People researching a condition or nutrient | Trustworthy, plain-English information | Structured guides with references and review status | `/nutrition`, `/health-conditions` (no marketing on these pages) |

Do not target people by health condition in paid or social advertising.

### 16.4 Acquisition channels

| Channel | What to build or do | Measure |
| --- | --- | --- |
| SEO content clusters | Pillar page plus supporting recipes and guides per cluster (lighter American classics; British comfort food; Asian weeknight dinners; meal prep and planning; budget eating; nutrition basics). Internal links from every supporting page to the pillar. | Organic sessions, signups per cluster |
| Pinterest | Vertical pins per recipe and per collection, linking to the recipe with UTM tags | Outbound clicks, signups |
| Instagram and TikTok | Short recipe videos and carousels (one dish, one tip); link in bio to `/free-meal-plan` | Profile link clicks, signups |
| Email | Newsletter, free meal plan, lifecycle series (16.7) | Signup rate, click rate, Premium conversion |
| Partnerships | Dietitians, meal-prep businesses, community groups, employers' wellbeing programmes | Referral sessions, signups |
| PR | Data-free, useful stories (for example, "lighter British classics" seasonal features) pitched to food and lifestyle editors | Referring domains, coverage |

No paid advertising until the free funnel converts and a budget is set. If paid ads start later, use contextual targeting (recipes, meal planning), never health-condition targeting, and no third-party ad pixels on the site.

### 16.5 Content production rules

- Every recipe or article published for marketing still meets sections 7 and 10.
- Social content shows the illustration or a labelled AI image until real photography exists. Video of real cooking is preferred over AI video.
- Do not present AI images as the owner's cooking.

### 16.6 Lead magnet: `/free-meal-plan`

- A free 7-day starter plan with tabs for an American, a British and an Asian kitchen.
- Printable (print stylesheet), with a consolidated shopping list per kitchen.
- Newsletter signup with `source: "free-meal-plan"`. The plan itself is viewable without signing up (no email gate on health or planning content); the signup offers to email it and send weekly plans.
- Every recipe in the plan links to its recipe page.
- Fires `lead_magnet_view` (with consent).

Acceptance criteria:

- [ ] The page prints on A4 and US Letter without cut-off content.
- [ ] Each kitchen's plan uses only recipes from that region (or labelled shared staples).

### 16.7 Email lifecycle

Use a provider that supports double opt-in, segmentation by `source` and one-click unsubscribe. Until a provider is connected, signups go to `NEWSLETTER_WEBHOOK_URL`, or the form says it is not connected.

| Sequence | Trigger | Content | Rules |
| --- | --- | --- | --- |
| Welcome series (5 emails over about 14 days) | Confirmed signup | What NourishWell is; the free plan; how to plan a week; shopping calendar; Free versus Premium | No health claims; one clear action per email |
| Weekly plan email | Weekly, opt-in | A suggested plan or theme, three recipes, one tip, the shopping list link | Sponsored slot allowed only when labelled |
| Premium nurture | Engaged free users (clicked plan or list links) | Features that save time; honest description of per-device limitation | Max one Premium mention per weekly email; none in health content |
| Win-back | No opens or clicks for 90 days | "Still want these?" with a one-click stay or leave | Remove non-responders after the win-back |
| Billing emails | Stripe events | Receipts, renewal reminders, failed payments (Stripe's own emails, configured in Stripe) | Send renewal reminders where law requires; see 16.11 |

### 16.8 On-site conversion points

| Location | Conversion | Rule |
| --- | --- | --- |
| End of every recipe page | Inline newsletter CTA | Below the recipe, never interrupting steps |
| End of nutrition and fitness articles | Inline newsletter CTA | Not on health-condition pages |
| Homepage section 12 | Newsletter and free meal plan | |
| Saved-plan limit reached | Contextual Premium prompt | Explains the limit; offers export of current data either way |
| Export button | Contextual Premium prompt | Free users can still print |
| `/pricing` | Checkout | Terms visible before button |
| Directory empty states | Listing application | |

No pop-ups on entry, no exit-intent overlays, no countdown timers.

### 16.9 Attribution and analytics rules

1. First-party attribution only. On first visit, store first-touch `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `ref`, landing page path and referrer domain in the browser.
2. Attach that attribution, plus `source`, to newsletter signups, listing applications and Stripe Checkout Session metadata.
3. Analytics provider: Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, optional `NEXT_PUBLIC_PLAUSIBLE_SRC`), loaded only after the visitor allows analytics in the consent banner.
4. Events (names are fixed): `recipe_view`, `search`, `recipe_saved`, `meal_plan_created`, `shopping_list_created`, `newsletter_signup`, `pricing_view`, `checkout_started`, `subscription_started`, `lead_magnet_view`, `upgrade_prompt_click`, `share`.
5. Never send: search terms, health-condition page views, planner preferences, allergies, email addresses or any personal data.
6. No third-party advertising pixels (Meta, TikTok, Google Ads tags and similar) on the site.
7. `/admin` includes a UTM campaign link builder so campaign links are consistent (lowercase, hyphenated values).

Acceptance criteria:

- [ ] With analytics consent declined, no request goes to the analytics host (browser test).
- [ ] A visit to `/?utm_source=pinterest&utm_medium=social&utm_campaign=test` followed by a newsletter signup sends that attribution in the webhook payload.
- [ ] Health-condition pages fire no events (test).

### 16.10 Referral and sharing

- Share buttons on recipes, collections and the free meal plan use the Web Share API with a copy-link fallback and fire `share`.
- Shared links carry `ref` or UTM parameters only if the user opts to include them; never personal identifiers.
- A referral reward programme (for example, a free Premium month for both people) is optional and only built once accounts exist, so rewards can be tracked without fingerprinting.

### 16.11 Social cards and structured data

- Dynamic Open Graph images for the site and every recipe (title, wordmark, Parchment background, the recipe illustration or labelled image).
- WebSite plus SearchAction structured data pointing at `/search?q={search_term_string}`.
- No Review or AggregateRating markup, ever, unless real reviews exist and meet search-engine rules.

### 16.12 KPIs (definitions, not targets)

Set targets only after 4 to 8 weeks of baseline data. Do not publish targets or results on the site.

| KPI | Formula | Source |
| --- | --- | --- |
| Visitor-to-subscriber rate | newsletter signups / unique visitors | Plausible (`newsletter_signup`, visitors) |
| Lead magnet conversion | signups with `source=free-meal-plan` / `lead_magnet_view` visitors | Plausible, email provider |
| Activation rate | visitors who fire `meal_plan_created` / unique visitors | Plausible |
| Free-to-Premium conversion | new paid subscriptions in period / active free users in period (proxy: newsletter subscribers or planner users) | Stripe, Plausible |
| Checkout completion | `subscription_started` / `checkout_started` | Plausible, Stripe |
| Monthly churn | subscriptions cancelled in month / subscriptions active at start of month | Stripe |
| MRR | sum of monthly-normalised subscription revenue (yearly / 12), excluding tax | Stripe |
| Email click rate | unique clicks / delivered | Email provider (prefer clicks over opens; opens are unreliable) |
| Channel contribution | signups or subscriptions by first-touch `utm_source` | Webhook payloads, Checkout metadata |

### 16.13 Legal and compliance (assess with counsel)

Do not claim compliance. Build the features below and list each item in your final report as "needs assessment with counsel".

| Topic | Instruments to assess | What to build |
| --- | --- | --- |
| Sponsored content and endorsements | US FTC Endorsement Guides (16 CFR Part 255) and the FTC rule on fake reviews and testimonials; UK CAP Code and ASA guidance on ad labelling; UK CMA guidance on online reviews | Clear "Sponsored"/"Ad" labels; disclosure page; no fake reviews |
| Email marketing | US CAN-SPAM; UK PECR and UK GDPR; EU GDPR and ePrivacy if EU readers are targeted; Singapore PDPA and Spam Control Act; Malaysia PDPA; India DPDP Act 2023; Canada CASL if Canadians are targeted | Double opt-in, consent records with timestamp and `source`, physical postal address in emails, one-click unsubscribe |
| Subscriptions and auto-renewal | US ROSCA; California Automatic Renewal Law (Business and Professions Code section 17600 onwards) and other state ARLs; UK Consumer Contracts Regulations 2013 (cancellation rights for digital services); UK Digital Markets, Competition and Consumers Act 2024 subscription-contract rules (check commencement dates) | Clear pre-purchase terms, express consent, easy online cancellation, renewal reminders where required, confirmation emails |
| Cookies and analytics | UK PECR, EU ePrivacy, state privacy laws | Consent banner gates analytics; record consent |
| Consumer health data | US state consumer health data laws (for example Washington's My Health My Data Act); FTC Health Breach Notification Rule | Do not collect health data; keep health-page views out of analytics |
| Tax | Sales tax, VAT, GST on digital services in each market | Stripe Tax configuration reviewed by an accountant |

---

## 17. PROFESSIONAL AND BUSINESS LISTINGS

### 17.1 Profiles

Name and logo; description and specialties; locations and service areas; languages; services; pricing where the business provides it; contact; images; website and social links; credentials (professionals); verification status; inquiry or booking link.

### 17.2 Verification and moderation

- Professionals: check registration on the issuing body's public register (for example the UK HCPC, the US Commission on Dietetic Registration, or the relevant national regulator). Confirm name and current status. Record verifier and date.
- Businesses: check registration where available, website and services. Reject cure claims, detox and miracle products, fabricated reviews.
- Re-verify yearly. Suspend on credible reports. Provide a "report this listing" link.

### 17.3 Free basic versus featured

| | Basic (free) | Featured (paid, monthly) |
| --- | --- | --- |
| Verified listing in directory | Yes | Yes |
| Profile fields | Standard | Extended (more media, longer description) |
| Placement | Normal ordering | Labelled "Featured", may appear first in its section |
| Verification badge | Only if verified | Only if verified; payment never grants it |
| Analytics and lead tools | No | Later, when built |

### 17.4 Acceptance criteria

- [ ] Unit test: the directory never publishes an unverified entry.
- [ ] Featured entries always render the "Featured" label.

---

## 18. CONTENT MANAGEMENT AND ADMINISTRATION

### 18.1 Today

Content is typed TypeScript under `src/content/`, changed through pull requests. `/admin` (Basic Auth) shows content inventory and review status, integration status, the reference library and plan configuration.

### 18.2 Add in this release: Monetization and marketing panel

- Configuration status for each integration: Stripe secret key, webhook secret, each Price ID (and whether it resolves), trial days, entitlement secret (present and at least 32 characters, never displayed), billing events webhook, Plausible, newsletter, contact and listings webhooks. Show "configured", "missing" or "error", never the secret.
- Featured-listing payment link generator (section 15.7).
- UTM campaign link builder: base URL (site pages picker), source, medium, campaign, term, content; outputs a lowercase, URL-encoded link with a copy button.

### 18.3 Later (with the database)

Content statuses Draft, In review, Approved, Published, Needs update, Archived; author, reviewer, references, dates, tags, SEO fields, correction history; role-based access.

---

## 19. TECHNICAL ARCHITECTURE

### 19.1 Principles

Modular components; one token system; business logic in `src/lib/`; validated server operations; integration-first design with honest fallbacks; configurable entitlements; environment-specific configuration; automated tests. No microservices.

### 19.2 Data entities

Users and preferences; recipes; ingredients; recipe ingredients; nutrient facts with source IDs; allergens and diet tags; articles; condition topics; references; content reviews; meal plans and entries; shopping lists and items; shopping schedules; professionals and credentials; businesses and listings (with `featured_until`); inquiries; subscription plans, prices and entitlements; Stripe customer and subscription IDs; payment events (from webhooks); newsletter consents (with `source` and attribution); sponsorships (with labels and dates); consent records; audit logs.

### 19.3 Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, OG images, Stripe return URLs | Set in production |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | `/admin` | Unset means `/admin` is 404 |
| `NEWSLETTER_WEBHOOK_URL`, `CONTACT_WEBHOOK_URL`, `LISTINGS_WEBHOOK_URL` | Form delivery | Unset means the form says it is not connected |
| `STRIPE_SECRET_KEY` | All billing | Test key in preview, live key in production |
| `STRIPE_WEBHOOK_SECRET` | `/api/billing/webhook` | From the Stripe webhook endpoint |
| `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY` | Premium | Price IDs, not amounts |
| `STRIPE_PRICE_LISTING_FEATURED` | Featured listings | Price ID |
| `PREMIUM_TRIAL_DAYS` | Optional trial | Integer 1 to 90; unset or 0 means no trial |
| `STRIPE_AUTOMATIC_TAX` | Optional | `true` turns on Stripe Tax in Checkout; set only after Stripe Tax is configured |
| `ENTITLEMENT_SECRET` | `nw_ent` cookie and listing upgrade links | 32+ random characters (shorter values are treated as missing); rotating it removes Premium from every device and invalidates every upgrade link |
| `BILLING_EVENTS_WEBHOOK_URL` | Optional | Receives a summary of each verified Stripe event (for example Slack or Zapier) |
| `STRIPE_API_BASE` | Testing only | Defaults to `https://api.stripe.com` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_PLAUSIBLE_SRC` | Analytics | Loaded only after consent |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts (Release 2) | Reserved |

Document every variable in `.env.example` and the README. Never expose a non-`NEXT_PUBLIC_` variable to the browser.

### 19.4 Security and privacy

- Validate all input with Zod. Rate-limit forms and billing endpoints (use a shared store with multiple instances).
- Verify Stripe webhook signatures with a timestamp tolerance; respond 2xx only after verification; handle duplicate deliveries idempotently.
- Compare signatures in constant time.
- Never log full request bodies of forms or webhooks; never log card data (Checkout keeps card data off the site).
- Treat health information as sensitive: collect as little as possible, keep it out of URLs, logs, analytics and ad tools.
- Security headers as today; add a Content Security Policy that allows only the analytics host and Stripe redirects actually used.

---

## 20. SEO, ANALYTICS AND PERFORMANCE

- Descriptive URLs; unique titles and descriptions; one `<h1>`; sitemap; robots; canonical URLs; breadcrumbs; internal links; optimised images; Open Graph images (16.11); Search Console readiness.
- Structured data only where the markup matches visible content: Organization, WebSite and SearchAction, BreadcrumbList, Article, MedicalWebPage (with `reviewedBy` only when real), Recipe (only with an eligible image).
- Never mark up reviews or ratings that do not exist.
- Exclude `/admin`, `/account`, `/account/billing`, `/dashboard`, `/api/*` and `/for-businesses/upgrade` from the sitemap and disallow them in robots.
- Performance: measure Core Web Vitals after deployment on real devices. Keep the analytics script deferred and consent-gated. Avoid client JavaScript on content pages beyond what interaction needs.

Acceptance criteria:

- [ ] Crawl suite passes (200, one `<h1>`, meta description, unique titles, alt text, no overflow, no console errors).
- [ ] Rich Results Test shows no errors for a recipe page with an eligible image and no Recipe markup for one without.

---

## 21. PHASED PLAN (FROM THE CURRENT BASELINE)

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| A. Monetization and marketing release | Billing routes and pages, entitlement cookie, Premium export, featured listing flow, `/advertise`, `/how-we-make-money`, `/free-meal-plan`, attribution, consent-gated Plausible, inline CTAs, upgrade prompts, OG images, admin panel | All tests in 15.10 and 16.9 pass in Stripe test mode; docs updated (`docs/MONETIZATION.md`, `docs/MARKETING.md`) |
| B. Imagery | Labelled AI dish images for lead-cuisine recipes, then licensed photography of tested dishes | Every AI image labelled; alt text reviewed |
| C. Content | More US, UK and Asian recipes at full quality; SEO clusters; clinical review of specialised guides | Content-integrity tests pass; review status accurate |
| D. Accounts (Release 2) | Supabase Auth, sync, device import, account-linked Premium, server-enforced limits, lifecycle email with a provider | RLS tests pass; Premium restores on a new device by signing in |
| E. Professional and business expansion | Verified profiles, inquiries, featured listings from webhooks, owner dashboards | Verification workflow recorded; no unverified entries |
| F. Launch QA | Accessibility audit (WCAG 2.2 AA), security review, performance on real devices, legal review of terms, privacy and billing flows | Launch checklist complete; results in `docs/QA_REPORT.md` |

Do not switch Stripe to live mode until Phase A tests pass in test mode and the owner has completed the go-live checklist in `docs/MONETIZATION.md`.

---

## 22. ACCEPTANCE TESTS (CONSOLIDATED)

Run these before you declare any phase complete. Record each result with the date in `docs/QA_REPORT.md`.

### 22.1 Navigation and content

- [ ] Every header item opens its own page (no `#` links).
- [ ] No placeholder text, invented numbers or invented people anywhere.
- [ ] Search returns relevant results, including regional and US/UK synonyms.
- [ ] Filters update results and the URL.

### 22.2 Brand

- [ ] All text renders in Source Serif 4.
- [ ] The logo matches 4.4; the header is opaque Parchment.
- [ ] Contrast meets WCAG 2.2 AA for all text and controls.

### 22.3 Recipes, planning and shopping

- [ ] Serving changes scale ingredients and the shopping list.
- [ ] The planner never violates hard constraints.
- [ ] The shopping list consolidates and keeps user edits on regeneration.
- [ ] The shopping calendar shows the list on the homepage on shopping day (and during the lead time) until marked done, and exports a valid `.ics`.

### 22.4 Medical content and privacy

- [ ] Every condition guide has 12 parts, references and an honest review status.
- [ ] No cure language.
- [ ] No analytics, sponsorships, affiliate links or upgrade prompts on health-condition pages.
- [ ] Data export and deletion work.

### 22.5 Monetization

- [ ] All items in 15.10.

### 22.6 Marketing

- [ ] All items in 16.6 and 16.9.
- [ ] Inline newsletter CTAs appear after recipes and non-medical articles and send the correct `source`.
- [ ] OG images render for the home page and three sample recipes.

### 22.7 Quality

- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and `npm run e2e` pass.
- [ ] Keyboard navigation and visible focus everywhere, including the pricing toggle and Checkout buttons.
- [ ] Forms show useful validation messages.
- [ ] Loading, empty, error, not-configured and not-found states exist.
- [ ] No secrets in client bundles (grep the build output for `sk_` and `whsec_`).

Only report a test as passed if you ran it.

---

## 23. FINAL DELIVERABLES

At the end of each phase, report:

1. What was built: pages, routes and features, with paths.
2. What works now and what needs configuration (with the exact environment variables).
3. Data entities and integrations touched.
4. Test results, with the commands run and the date.
5. Known defects and limitations (including the per-device Premium limitation until accounts launch).
6. Items that need the owner's action: Stripe setup, prices, tax, legal review, clinical review, photography, email provider.
7. Items that need assessment with counsel (16.13).
8. Updated documentation: README, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, `docs/MONETIZATION.md`, `docs/MARKETING.md`, `docs/QA_REPORT.md`, `.env.example`.
9. A prioritised next-step list.

---

## 24. FINAL DIRECTION

NourishWell should be the place people return to every week because it makes the next seven days of eating easier. Its strength comes from five things working together:

1. **Familiar food made lighter**, led by American, British and Asian kitchens.
2. **Practical planning** that saves time and money: plan, list, shopping day.
3. **Trustworthy health education** that is honest about evidence and limits.
4. **A sustainable, transparent business model**: real prices, clear labels, nothing essential behind a paywall.
5. **Growth that respects people**: first-party, consent-based measurement and no invented proof.

Inspect the repository, preserve what works, build the highest-value missing pieces, test them, and report honestly.
