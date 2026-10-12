# Architecture

## Stack

- **Next.js 15 App Router**, React 19, TypeScript (strict). Server components by default; client components only where interaction is needed.
- **Styling**: one design-token stylesheet (`src/app/globals.css`) built on the brand palette (Midnight Violet `#1f0e2f`, Parchment `#f4efed`, Ash Grey `#aab2b0`, Mauve Bark `#725246`, Dark Slate Grey `#2C3E39`, White). Fraunces (editorial serif) + Inter (sans) via `next/font`.
- **Validation**: Zod for all form input.
- **Tests**: Vitest (unit), Playwright (browser).

Most pages are statically prerendered (129 at build). `/search`, `/admin` and the forms API are dynamic.

## Layers

```
content/   typed data — the single source of truth for recipes, ingredients, guides, references
lib/       pure domain logic (no React): nutrition, units, recipe-meta, planner, shopping, search, plans
lib/storage.ts   persistence adapter (device storage today; swap for a server repository later)
components/      presentation; client components call lib/ functions and the storage hooks
app/             routing, metadata, data loading
```

Business rules live in `lib/` and are unit-tested independently of the UI.

### Derived, not hand-typed

- **Dietary tags and allergens** are derived from the ingredient table (`lib/recipe-meta.ts`). A recipe can't be labelled vegan if any ingredient has an animal origin. Oats are conservatively flagged for gluten.
- **Nutrition** is calculated as ingredient grams × reference values per 100 g ÷ servings (`lib/nutrition.ts`), then rounded label-style. Optional garnishes are excluded. Every figure can be traced to its line and its reference entry.
- **Cost** is a relative level (1–3) weighted by ingredient mass. No prices are shown until reliable local price data exists. Users can enter their own prices on the shopping list.

### Meal planner (`lib/planner.ts`)

- Hard constraints are never relaxed: diet, allergens, dislikes.
- Soft constraints (time, budget) are relaxed only if a slot would otherwise be empty, and the plan says so.
- Scoring favours pantry items, ingredient reuse across the week, goals and preferred regions, and penalises repeats on consecutive days.
- It uses a seeded PRNG, so plans are reproducible.

### Shopping list (`lib/shopping.ts`)

- Scales each recipe to the planned servings.
- Converts spoons to ml so lines can be added together, then merges by ingredient + unit.
- Regenerating from a plan keeps check marks, user prices and custom items.

## Persistence

**Today:** all personal data (saved items, plans, lists, preferences, consent, habit ticks) lives in `localStorage` under the `nw:` prefix. Access goes through `useStored()` (a `useSyncExternalStore` hook that syncs across tabs). Users can export it as JSON or delete it from `/account`. Nothing personal is sent to the server.

**Next (accounts):**

1. Create a Supabase (or any managed Postgres + auth) project and apply `supabase/schema.sql`. It has been applied and RLS-tested on PostgreSQL 16; see `docs/QA_REPORT.md`.
2. Add `@supabase/ssr`. For signed-in users, back the existing `useStored` keys (`KEYS.plans`, `KEYS.shopping`, `KEYS.savedRecipes`, `KEYS.plannerPrefs`, …) with server-synced hooks reading and writing `meal_plans`/`meal_entries`, `shopping_lists`/`shopping_items`, `saved_items` and `user_preferences`. The components only depend on the hook's `[value, setValue]` shape, so pages don't need to change.
3. On first sign-in, offer to import the device data (the export format matches the keys in `KEYS`).
4. Replace the Basic Auth middleware with role checks (`profiles.role`: editor, clinical_reviewer, moderator, admin).

## Entitlements

`lib/plans.ts` defines plans and features. `hasEntitlement(planId, feature)` must be called **on the server** with a plan ID from a trusted session. The SQL function `has_entitlement()` provides the same check in the database.

- Premium price is `null` and Premium is `available: false` until a payment provider is configured and tested.
- `NEVER_PREMIUM` lists features that must stay free (education, core filters, basic planner).
- The free-plan limit of 3 saved plans is currently enforced only on the device. It becomes server-enforced when plans move to the database.

## Security

- `/admin`: HTTP Basic Auth with a constant-time compare. It is disabled (404) when credentials are unset, and sends `no-store` and `noindex` headers.
- Forms: Zod validation, honeypot field, per-IP rate limit (in-memory: use a shared store such as Redis when running multiple instances), and an 8-second webhook timeout. Users never get a false "success".
- Headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`; `poweredByHeader` is off.
- JSON-LD is serialised with `<` escaped.
- No secrets in client code. Only `NEXT_PUBLIC_*` variables reach the browser.
- Database: RLS on every user or unpublished table. Users can't change their own role. Health-related preferences are owner-only.

## Privacy

- Health-condition pages are **not** recorded in recently viewed history and don't fire analytics events.
- Analytics (`lib/analytics.ts`) sends only aggregate product events, only with consent, and only if a provider script exists. Search terms are never sent.
- The planner asks no medical questions.

## Internationalisation readiness

- English is the only language. The account page states this rather than implying other languages exist.
- Units (metric/US), region, and currency (formatted with `Intl.NumberFormat`) are user preferences. Region sets defaults.
- Ingredients carry regional alternative names (e.g. *sukuma wiki*, *unga*, *ndengu*, *xawaash*), and search covers them.
- To add a language: extract UI strings from components into `src/i18n/<locale>.ts`, add locale-prefixed routing (`app/[locale]/…`), and translate content fields. Publish a locale only after its review is complete.

## SEO

- Per-page `title`, `description` and canonical, with `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- `sitemap.xml` and `robots.txt` (private and utility routes disallowed).
- Breadcrumbs with `BreadcrumbList` JSON-LD, plus `Article` and `MedicalWebPage` (only claims `reviewedBy` when a real reviewer exists).
- `Recipe` JSON-LD is emitted **only when a recipe has a licensed photo** (`recipe.photo`), because rich results require an image of the dish. No ratings or reviews are ever marked up.
