# QA report

These tests were run on 12 October 2026 against a production build (`next build && next start`) in headless Chromium 141. Every result below was actually executed; none is assumed.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run typecheck` (TypeScript strict) | ✅ No errors |
| `npm run lint` (next/core-web-vitals + TypeScript rules) | ✅ No warnings or errors |
| `npm test`: 80 unit tests | ✅ 80/80 passed |
| `npm run build` | ✅ 217 pages and images prerendered, no warnings |

Unit tests cover:

- **Nutrition:** calculation, label rounding, exclusion of optional ingredients, plausible energy for every recipe.
- **Units and scaling:** metric/US conversion, fractions.
- **Dietary derivation:** vegan, pescatarian, honey, oats and gluten.
- **Shopping consolidation:** merging, scaling, keeping checks, prices and custom items.
- **Shopping calendar:** weekly / 2 / 3 / 4-week repeats, ending after N trips or on a date, month/year/DST boundaries, lead time, missed trips staying due until done, hide-for-today, and .ics RRULE export.
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

## Shopping calendar (browser, 13 October 2026)

A scripted Chromium run passed all 26 checks:

- With no schedule, the homepage shows no banner.
- A schedule set through the form (every 2 weeks, 6 trips) is saved, and the shopping days are highlighted on the month grid.
- The .ics download contains `RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=6`.
- On shopping day the list appears at the top of the homepage, grouped by aisle. Ticking an item updates the count.
- **Hide for today** removes the banner. **Done shopping** removes it, clears ticked items and marks the day done on the calendar.
- Missed trips show as "still to do". The 2-day lead time shows "Shopping day is Thursday", and nothing appears before the window opens.
- At 375px there is no horizontal overflow, every element uses Source Serif 4, and there are no console errors.

## Monetization and marketing (13 October 2026)

**Billing with Stripe configured.** These tests used `npm run e2e:billing` against the mock Stripe API (`e2e/mock-stripe.cjs`), with a production build carrying test-mode env vars. All 36 checks passed:

- **Pricing:** prices are read from Stripe ($4.99/month and $39.99/year, "save 33%", other currencies listed). Planned features are marked "not yet included", and the auto-renewal terms are shown before payment.
- **Checkout and confirmation:**
  - Checkout runs through the mock hosted page, then `/api/billing/confirm`, then `/account/billing` with "Welcome to Premium".
  - The checkout session carries the price, a 14-day trial, promo codes and first-touch UTM metadata.
  - The entitlement cookie is httpOnly and SameSite=Lax.
  - A second checkout is refused (409).
- **Premium features:** the saved-plan limit rises to 50, and plan CSV and calendar exports download. Without Premium, export returns 402 and shows an upgrade prompt.
- **Customer Portal:** it opens for the right customer.
- **Expired tokens:** these are re-checked with Stripe. A cancelled subscription loses access and the cookie is cleared; an active one is renewed. A forged cookie is rejected.
- **Webhook:** a signed webhook is accepted and forwarded with its campaign; an unsigned one gets 400. A past-due subscription shows the payment warning.
- **Featured listings:** `/admin` generates a signed link, a tampered link is refused, and the listing checkout completes with listing metadata.
- **Lead magnet:** the kitchen tabs work. A newsletter sign-up carries `source=free-meal-plan` plus attribution, and "Make it mine" saves the plan into the planner.

**Without Stripe configured.** Checkout returns an honest 503 ("no payment was taken") and the webhook returns 503. Pricing shows "Coming soon" and a waitlist, and the upgrade page refuses invalid links. `/admin` still returns 404 without credentials.

**Marketing:**
- Newsletter boxes appear on recipe and guide pages. On condition, supplement and fitness guides the sign-up source is the generic `article`, never the topic.
- Open Graph PNGs render for the site and for recipes in Source Serif 4, and pages declare `og:image`.
- WebSite SearchAction JSON-LD is present.
- At 390px, the new pages have no horizontal overflow, and every element computes to Source Serif 4.

**Regression:** `npm run e2e` passed 36/36. The crawl covered 154 pages with no problems and no console errors. The shopping calendar suite passed 26/26.

**Not tested:** real Stripe test mode and live mode. That needs the owner's keys, using the plan in `docs/MONETIZATION.md` section 10.

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
