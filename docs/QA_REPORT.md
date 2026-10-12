# QA report

These tests were run on 12 October 2026 against a production build (`next build && next start`) in headless Chromium 141. Every result below was actually executed; none is assumed.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run typecheck` (TypeScript strict) | ✅ No errors |
| `npm run lint` (next/core-web-vitals + TypeScript rules) | ✅ No warnings or errors |
| `npm test`: 46 unit tests | ✅ 46/46 passed |
| `npm run build` | ✅ 129 pages prerendered, no warnings |

Unit tests cover:

- **Nutrition:** calculation, label rounding, exclusion of optional ingredients, plausible energy for every recipe.
- **Units and scaling:** metric/US conversion, fractions.
- **Dietary derivation:** vegan, pescatarian, honey, oats and gluten.
- **Shopping consolidation:** merging, scaling, keeping checks, prices and custom items.
- **Planner:** 7 days and requested slots; hard constraints never violated; no back-to-back repeats; reproducible from a seed; moving meals; batch-cooking ideas.
- **Content integrity:** unique slugs and ids, every reference resolves and uses HTTPS, no reviewer without a review date, all 12 condition sections filled, related links resolve, no cure language in claim fields, every collection and goal populated, at least 10 East African recipes.
- **Directory:** never publishes unverified entries.
- **Forms:** consent, email, message length, URL validation (rejects `javascript:`).
- **Entitlements:** free covers core features, Premium has no invented price.
- **Search:** regional names, ranking, empty queries.

## Browser tests (`npm run e2e`)

**Interaction suite: 36/36 passed.**

- Homepage renders; the consent banner can be dismissed.
- Recipe scaling: 400 g becomes 500 g when servings go from 4 to 5. The US toggle shows lb/oz.
- "Add to shopping list" stores scaled quantities. Saving a recipe persists, and the nutrition breakdown is present.
- Shopping list: checking an item updates progress; a user price produces a KES total; custom items can be added.
- Planner: generates 7 days and 21 meals with a vegetarian preference. Replace, move to another day (same-slot swap) and servings adjustment all work. Preferences persist. Batch-cooking ideas appear.
- Plan → shopping list consolidates 70+ items, shows multi-recipe items, and keeps custom items.
- Filters: vegan narrows 29 recipes to 17; the meal chip updates the URL and results; the ingredient filter works.
- Search finds "beans" and the regional term "sukuma".
- Newsletter: invalid email shows an inline error; with no webhook configured, an honest "isn't connected" message appears.
- `/admin` returns 404 when no credentials are set.
- Data export contains the user's plans; "Delete all my data" clears every `nw:` key.
- The skip link is the first focusable element.
- An unknown recipe slug returns HTTP 404.
- No horizontal overflow at 390px wide, and no console or page errors.

**Crawl suite:**

- 124 internal pages reached by following links from `/`. Every page returned 200 with exactly one `<h1>` and a meta description.
- No duplicate titles or descriptions.
- No images without alt text; no unlabelled SVG images.
- No horizontal overflow at 390px wide, and no console errors.

## Server and API checks (manual, with curl)

| Check | Result |
| --- | --- |
| `/admin` without credentials (when configured) | 401 |
| `/admin` with wrong password | 401 |
| `/admin` with correct password | 200; inventory shows review status |
| Newsletter with webhook configured | 200 `delivered: true`; webhook received a normalised payload |
| Honeypot-filled submission | Generic thanks shown; **not delivered** |
| Contact form without webhook | 503 with an honest message; nothing stored |
| Unknown form type | 404 |
| Burst of 10 submissions from one IP | 429 after 8 |

## Database schema

`supabase/schema.sql` was applied to a temporary **PostgreSQL 16** cluster, with Supabase's `auth.uid()` and roles stubbed. It created 30 tables and 42 RLS policies without errors. Behavioural RLS tests passed:

- A user sees only their own meal plans; another user sees 0.
- Inserting a plan for another user is blocked.
- A user can't promote their own role to admin.
- An anonymous visitor sees only published content and no plans.

## Visual review

I reviewed screenshots at 1440px and 390px wide: homepage (all sections), recipe pages, condition page, planner and shopping list. Issues found and fixed during QA:

- Container gutters missing on mobile.
- Desktop header overflowing (the nav moved to a second row).
- Semi-transparent header.
- Unreadable pressed and hover button states.
- Low-contrast button on the dark section.
- Repeated collection cover images.
- Long chips overflowing.
- Planner controls overflowing on mobile.
- Low-contrast illustrations for pale foods.

## Not yet tested

- Real email delivery through a newsletter provider (depends on the provider chosen).
- Screen-reader testing with NVDA, VoiceOver or TalkBack. An independent accessibility audit is still needed.
- Core Web Vitals on real devices and networks (measure after deployment).
- Payment flows (not built; payments are not configured).
- Account sign-in (not built; planned for Release 2).
