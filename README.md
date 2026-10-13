# NourishWell

**Eat Better. Feel Stronger. Live Well.**

NourishWell is a global-first nutrition platform: practical recipes led by American, British and Asian favourites (plus East African, Mediterranean and Latin American dishes), a seven-day meal planner with consolidated shopping lists, transparent nutrition estimates, and medically responsible health education.

Built with Next.js 15 (App Router), React 19 and TypeScript. No external services are required to run it.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

Quality checks:

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint (next/core-web-vitals)
npm test             # 108 unit tests (nutrition, planner, shopping, calendar, billing, revenue reporting, experiments, disclosure rules, content integrity, forms, search)
npm run e2e          # browser tests against a running server (BASE_URL=http://localhost:3000)
npm run e2e:billing  # 71 payment, booking, sign-up, restore, product, dashboard & marketing checks against the mock Stripe/Resend API
```

## What's included

| Area | Status |
| --- | --- |
| Homepage (15 editorial sections) | ✅ Working |
| Recipe library: 51 recipes (7 American, 7 British, 11 Asian, 14 African, 12 Mediterranean/Middle Eastern/Latin American/global), 15 filters, URL-shareable filters, sorting | ✅ Working |
| Recipe pages: scaling, metric/US units, substitutions, storage, food safety, allergens, print/share/save, add to plan, add to shopping list | ✅ Working |
| Nutrition transparency engine: per-ingredient breakdown, reference sources, proxies flagged, estimate labelling, recipe comparison | ✅ Working |
| Nutrition education (16 guides), health conditions (22 guides, 12-part structure), supplements (12), fitness & wellness (14) | ✅ Published as general education; **clinical review pending** (honestly labelled) |
| Meal planner: preferences, generation, replace, move, servings, prepared, custom meals, saved plans, duplicate-as-template, batch-cooking ideas, daily estimates | ✅ Working (stored on device) |
| Shopping list: consolidation, aisles, check-off, edit, custom items, print, share, user-entered prices with currency | ✅ Working (stored on device) |
| Shopping calendar: repeat weekly or every 2, 3 or 4 weeks; repeat forever, for N trips or until a date; the list appears at the top of the homepage on shopping day (or 1–2 days early) until marked done; month view; .ics export | ✅ Working (stored on device) |
| Dashboard, account preferences, data export & deletion, consent controls | ✅ Working (on device) |
| Search (recipes, guides, regional ingredient names) | ✅ Working |
| Premium subscriptions: live Stripe prices (monthly/yearly, trial, promo codes, other currencies), Checkout, signed server-side entitlement, Customer Portal (cancel, receipts), webhook, past-due warning; Premium sells only features that exist today (more saved plans, CSV/calendar exports) | ✅ Built and tested against a mock Stripe API; **live once Stripe env vars are set** — until then “Coming soon” + waitlist |
| Featured listings: verify → signed payment link from `/admin` → Stripe Checkout; “Promoted” labels | ✅ Built; live once `STRIPE_PRICE_LISTING_FEATURED` is set |
| Revenue system: `/admin/revenue` (gross, refunds, fees, net, tax, MRR, churn, ARPPU, by product/market/source, checkout funnel, experiment results — all from Stripe), `/admin/monetization` (streams, feature-to-revenue matrix + CSV), Premium restore by email, webhook de-duplication | ✅ Built and tested against mocks; needs Stripe + Resend keys |
| Digital products: `/resources` store, original 28-page Meal-Planning Workbook (A4 + Letter), one-time Checkout with immediate-access consent, signed 7-day downloads from a private folder | ✅ Built; on sale once `STRIPE_PRICE_PRODUCT_WORKBOOK` is set |
| Prices: Premium **US$37.99/month**, professional sign-up **US$100 one-time** (after verification), set in US dollars with env overrides; Stripe Adaptive Pricing lets buyers pay in local currency while funds settle in USD | ✅ Built; charges once Stripe keys are set |
| Professionals: hourly rate (any of 19 currencies) and weekly availability captured at registration; profiles show the rate and a date-and-time booking scheduler (time-zone and DST aware); requests are emailed to the professional, who confirms and is paid directly — no commission; `/professionals/join` | ✅ Built; booking delivery needs Resend; directory stays empty until professionals are verified |
| Listing packages (Basic / Featured / Business Plus planned), sponsor & affiliate disclosure components with content tests, `/for-organisations`, price/CTA experiments | ✅ Built (boundaries; no partners yet) |
| Marketing: free 7-day meal plan lead magnet (`/free-meal-plan`), newsletter CTAs with source tags, first-party UTM attribution on sign-ups and checkouts, consent-gated Plausible analytics, Open Graph share images, `/advertise`, `/how-we-make-money`, admin UTM link builder | ✅ Working; analytics needs `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` |
| Professional & business directory, listing application form | ✅ Working; directory is **empty until verification**, by design |
| Newsletter, contact and listing forms | ✅ Validated; **delivery requires a webhook URL** (honest message otherwise) |
| Admin: content inventory, review workflow status, integration status, reference library, plan config | ✅ Working behind Basic Auth; **disabled unless credentials are set** |
| Online accounts, sync, password recovery | ⏳ Not yet: schema ready in `supabase/schema.sql` |
| SEO: metadata, canonical, sitemap, robots, breadcrumbs, JSON-LD (Organization, BreadcrumbList, Article, MedicalWebPage) | ✅ Working; Recipe rich results activate automatically once licensed photos are added |

## Configuration

Copy `.env.example` to `.env.local`. Everything is optional.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL for metadata, sitemap and robots. **Set this in production.** |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Enables `/admin` behind HTTP Basic Auth. Unset = `/admin` returns 404. |
| `NEWSLETTER_WEBHOOK_URL`, `CONTACT_WEBHOOK_URL`, `LISTINGS_WEBHOOK_URL` | Each form POSTs `{ type, data, submittedAt }` JSON here (e.g. Zapier/Make, a CRM, or your own endpoint). Unset = the form tells the user it isn't connected and stores nothing. |
| `STRIPE_*`, `ENTITLEMENT_SECRET`, `PREMIUM_TRIAL_DAYS`, `BILLING_EVENTS_WEBHOOK_URL`, `STRIPE_AUTOMATIC_TAX` | Payments. Step-by-step setup in [docs/MONETIZATION.md](docs/MONETIZATION.md). Unset = Premium shows “Coming soon” with a waitlist. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_PLAUSIBLE_SRC` | Privacy-friendly analytics, loaded only after the visitor allows analytics. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reserved for the accounts phase. |

## Project structure

```
src/
  app/            Routes (App Router), API route for forms, sitemap, robots, middleware-protected admin
  components/     UI components (server by default; client components are marked "use client")
  content/        Typed content: recipes, ingredients (nutrient table), guides, references, collections, directory
  lib/            Domain logic: nutrition, units, recipe meta, planner, shopping, search, plans/entitlements, storage
supabase/         PostgreSQL schema with Row Level Security (applied and RLS-tested on Postgres 16)
docs/             Architecture, deployment, content, operations, launch checklist, QA report
e2e/              Playwright browser tests
```

## Documentation

- [Master build prompt v3](docs/PROMPT_v3.md) — the improved specification for future AI-assisted work
- [Revenue architecture (feature-to-revenue matrix, free vs Premium, event spec, roadmap, limitations)](docs/REVENUE_ARCHITECTURE.md)
- [Monetization setup (Stripe, pricing research)](docs/MONETIZATION.md)
- [Marketing playbook](docs/MARKETING.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment, backups & recovery](docs/DEPLOYMENT.md)
- [Content & nutrition data guide](docs/CONTENT.md)
- [Operations: reviews, verification, moderation](docs/OPERATIONS.md)
- [Launch checklist & roadmap](docs/LAUNCH_CHECKLIST.md)
- [QA report](docs/QA_REPORT.md)
