# NourishWell

**Eat Better. Feel Stronger. Live Well.**

NourishWell is a global-first nutrition platform: practical recipes (with a strong East African core), a seven-day meal planner with consolidated shopping lists, transparent nutrition estimates, and medically responsible health education.

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
npm test             # 46 unit tests (nutrition, scaling, planner, shopping, content integrity, forms, entitlements, search)
npm run e2e          # browser tests against a running server (BASE_URL=http://localhost:3000)
```

## What's included

| Area | Status |
| --- | --- |
| Homepage (15 editorial sections) | ✅ Working |
| Recipe library: 29 recipes, 15 filters, URL-shareable filters, sorting | ✅ Working |
| Recipe pages: scaling, metric/US units, substitutions, storage, food safety, allergens, print/share/save, add to plan, add to shopping list | ✅ Working |
| Nutrition transparency engine: per-ingredient breakdown, reference sources, proxies flagged, estimate labelling, recipe comparison | ✅ Working |
| Nutrition education (16 guides), health conditions (22 guides, 12-part structure), supplements (12), fitness & wellness (14) | ✅ Published as general education; **clinical review pending** (honestly labelled) |
| Meal planner: preferences, generation, replace, move, servings, prepared, custom meals, saved plans, duplicate-as-template, batch-cooking ideas, daily estimates | ✅ Working (stored on device) |
| Shopping list: consolidation, aisles, check-off, edit, custom items, print, share, user-entered prices with currency | ✅ Working (stored on device) |
| Dashboard, account preferences, data export & deletion, consent controls | ✅ Working (on device) |
| Search (recipes, guides, regional ingredient names) | ✅ Working |
| Pricing page with configurable plans and feature comparison | ✅ Working; Premium **not yet available**, no prices invented |
| Professional & business directory, listing application form | ✅ Working; directory is **empty until verification**, by design |
| Newsletter, contact and listing forms | ✅ Validated; **delivery requires a webhook URL** (honest message otherwise) |
| Admin: content inventory, review workflow status, integration status, reference library, plan config | ✅ Working behind Basic Auth; **disabled unless credentials are set** |
| Online accounts, sync, password recovery | ⏳ Not yet: schema ready in `supabase/schema.sql` |
| Payments | ⏳ Not configured; never activated without end-to-end testing |
| SEO: metadata, canonical, sitemap, robots, breadcrumbs, JSON-LD (Organization, BreadcrumbList, Article, MedicalWebPage) | ✅ Working; Recipe rich results activate automatically once licensed photos are added |

## Configuration

Copy `.env.example` to `.env.local`. Everything is optional.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL for metadata, sitemap and robots. **Set this in production.** |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Enables `/admin` behind HTTP Basic Auth. Unset = `/admin` returns 404. |
| `NEWSLETTER_WEBHOOK_URL`, `CONTACT_WEBHOOK_URL`, `LISTINGS_WEBHOOK_URL` | Each form POSTs `{ type, data, submittedAt }` JSON here (e.g. Zapier/Make, a CRM, or your own endpoint). Unset = the form tells the user it isn't connected and stores nothing. |
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

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment, backups & recovery](docs/DEPLOYMENT.md)
- [Content & nutrition data guide](docs/CONTENT.md)
- [Operations: reviews, verification, moderation](docs/OPERATIONS.md)
- [Launch checklist & roadmap](docs/LAUNCH_CHECKLIST.md)
- [QA report](docs/QA_REPORT.md)
