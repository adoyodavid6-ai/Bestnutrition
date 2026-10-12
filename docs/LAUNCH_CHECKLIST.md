# Launch checklist & roadmap

## Before public launch

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain. Canonical URLs and the sitemap depend on it.
- [ ] Set `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- [ ] Connect `NEWSLETTER_WEBHOOK_URL` to an email provider with double opt-in, and `CONTACT_WEBHOOK_URL` to a monitored inbox or helpdesk.
- [ ] Commission clinical review of the specialised condition guides (see `docs/OPERATIONS.md`). Until then they stay labelled "Clinical review pending".
- [ ] Legal review of `/privacy` and `/terms` for each launch market, then remove the "Draft pending legal review" notices (`draftNotice` prop).
- [ ] Re-verify every reference URL. `/admin` lists them all.
- [ ] Spot-check the nutrient values in `src/content/ingredients.ts` against FoodData Central, and record FDC IDs.
- [ ] Kitchen-test the recipes and note the testing on each one.
- [ ] Commission or license photography for the top recipes. This also enables Recipe rich results.
- [ ] Choose a privacy-friendly analytics provider (consent-gated) and add its script in `src/app/layout.tsx`.
- [ ] Verify the domain in Google Search Console and submit the sitemap.
- [ ] Run an independent accessibility audit (WCAG 2.2 AA).
- [ ] Load-test the forms endpoint. Move the rate limiter to a shared store if running multiple instances.

## Roadmap

**Release 1: launch foundation** (this build)
Homepage, recipe library, recipe pages, search and filters, nutrition education, condition guides, responsive design, SEO, newsletter form, on-device planner and shopping list.

**Release 2: engagement and retention**
1. Accounts (Supabase Auth): sign-in, password recovery, device-data import.
2. Sync saved recipes, plans, lists and preferences across devices.
3. Server-enforced free-plan limits.
4. Email reminders (opt-in), weekly plan emails.
5. More recipes (tested), regional price data where reliable, and a first translated locale.

**Release 3: commercial expansion**
1. Verified professional and business profiles, inquiry and appointment requests, owner dashboards.
2. Premium subscriptions with regional pricing, receipts, billing history and cancellation.
3. Premium listings with analytics and labelled promoted placement.
4. Carefully disclosed partnerships.
