# QA report

These tests were run on 12 October 2026 against a production build (`next build && next start`) in headless Chromium 141. Every result below was actually executed; none is assumed.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run typecheck` (TypeScript strict) | ✅ No errors |
| `npm run lint` (next/core-web-vitals + TypeScript rules) | ✅ No warnings or errors |
| `npm test`: 108 unit tests | ✅ 108/108 passed |
| `npm run build` | ✅ 221 pages and images prerendered, no warnings |

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

## Revenue architecture (13 October 2026, second pass)

**With Stripe and Resend configured.** These tests used `npm run e2e:billing` against `e2e/mock-stripe.cjs`, which now also mocks Stripe's list endpoints and Resend. All **59 checks passed**: the 36 earlier checks, plus the new ones below.

- **Checkout:** carries experiment variants (`exp_*` metadata).
- **Webhooks:** a duplicate webhook delivery is not processed or forwarded twice.
- **Restore by email:**
  - An unknown email gets the same reply and no email is sent.
  - The subscriber's email receives a link, and the link turns on Premium in a second browser.
  - A tampered link is refused.
- **Workbook purchase:**
  - The price is read from Stripe and sample pages are shown.
  - Immediate-access consent is required.
  - One-time checkout runs with invoice creation, and the download page appears after verified payment.
  - The real 421 KB A4 PDF is delivered.
  - A tampered token gets 403, product files aren't publicly reachable, and the download link is emailed.
- **`/admin/revenue`:**
  - Gross $33.99, refunds $4.99, fees $1.59 and net $27.41 match the mock's balance transactions; the payout is excluded.
  - MRR: Premium $4.99, Featured $29.
  - Revenue by product, market and source is correct.
  - Experiments show "Not enough data yet".
- **`/admin/monetization`:** renders, the matrix CSV downloads, and the CSV needs the admin login (401 without).

**Without configuration.** Restore, product checkout, Premium checkout and the webhook all return honest 503s. Downloads are refused without a token. The product shows "Coming soon", and listing packages promise only implemented benefits; Business Plus is marked "In development".

**Regression:** `npm run e2e` passed 36/36. The crawl covered 157 pages with no problems or console errors. The shopping calendar passed 26/26. The new pages are serif-only with no overflow at 375px.

**Not tested:** real Stripe, real Resend, and the real Plausible Stats API.

## Prices, bookings and professional sign-up (13 October 2026)

**`npm run e2e:billing`: 71 checks passed** (mock Stripe and Resend). The new checks:
- **Premium price:** shown as $37.99 USD / month, with the local-currency note.
- **Premium checkout:** uses inline `price_data` of 3799 USD a month, with Adaptive Pricing enabled.
- **Monthly revenue figure:** the dashboard shows $37.99.
- **`/professionals/join`:**
  - The booking preview prices a 60-minute session from the hourly rate and can't send requests.
  - The application refuses a missing hourly rate.
  - A submitted application carries the rate (75 GBP), session lengths, consultation types, weekly availability and time zone.
- **Sign-up fee:**
  - `/admin` generates a signed sign-up link.
  - The page shows "$100 USD · one-time", and payment completes.
  - The checkout session is a one-time 10000 USD payment with Adaptive Pricing and an invoice.
  - The link can't be reused for another professional.
- **Bookings:** a request for an unlisted professional is refused.

**Unit tests (12 new):**
- Time-zone conversion for London, New York, Singapore and Kolkata, with daylight-saving gaps rejected.
- Slot generation across the 25 October clock change.
- Server-side checks on the slot, mode and session length.
- Fee calculation.
- Booking emails go to the professional (reply-to the client) and to the client; the team webhook record leaves out the client's note.
- USD price parsing and the default prices.

**Without Stripe or email configured:** Premium shows "$37.99 USD / month — Opening soon" with the waitlist. Booking requests refuse honestly when email isn't set up.

**Regression:** `npm run e2e` passed 36/36. The crawl covered 158 pages with no problems. The shopping calendar passed 26/26.

## Premium price changed to US$14.99/month (13 October 2026)

The owner changed Premium from US$37.99 to **US$14.99 a month** (`PREMIUM_MONTHLY_PRICE_USD` default). The earlier entries above record the tests run at the old price.

Re-run at the new price:
- **`npm run e2e:billing`:** 71/71 passed. Pricing shows $14.99 USD / month, checkout uses inline `price_data` of 1499 USD, and the dashboard's monthly revenue figure is $14.99.
- **Unit tests:** 108/108 passed.
- **Without Stripe configured:** pricing shows "$14.99 USD / month — Opening soon".
- **Regression:** `npm run e2e` passed 36/36, and the crawl covered 158 pages with no problems.

The logo row of the header is now #D9C4B1. Header text contrast is at least 6.7:1.

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
