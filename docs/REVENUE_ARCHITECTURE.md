# NourishWell revenue architecture

Status as of 13 October 2026. This document answers the twelve deliverables of the *Monetization, Revenue Architecture & Traffic Conversion* brief. It describes only what exists in the code; anything not built is labelled **planned** or **boundary**.

Operational setup (Stripe products, webhooks, test plan) is in [MONETIZATION.md](MONETIZATION.md). Marketing execution is in [MARKETING.md](MARKETING.md).

---

## Commercial principles (how they're enforced)

| Principle | Where it is enforced |
| --- | --- |
| The free product stays useful | `src/lib/plans.ts`: recipes, guides, the planner, shopping lists and the shopping calendar are free. `NEVER_PREMIUM` is unit-tested. |
| Users know exactly what they pay for | `FEATURE_STATUS` marks each feature `live` or `planned`. `/pricing` sells only live features and lists planned ones as "Planned — not yet included". The listing packages work the same way (`src/lib/commerce/listings.ts`). |
| No fake prices | Prices are read from Stripe Price objects at request time (`src/lib/billing/offers.ts`). The code contains no prices. |
| Health information isn't used for sales | Guide newsletter boxes use the generic source `article`. Affiliate and sponsor components are banned from health-condition and supplement pages, and a unit test enforces this. |
| Transparent advertising | `SponsorLabel` and `AffiliateLink` always render their disclosure. Directory placements show "Promoted". There's also a `/how-we-make-money` page. |
| Nothing is claimed live until it works | `streamStatus()` derives each stream's status from configuration. Unconfigured routes return an honest 503 that says "no payment was taken". |
| Measurable | Each stream has metrics in the matrix. Events are listed below. Revenue comes from Stripe. |

---

## 1. Feature-to-revenue matrix

The source is `src/lib/commerce/revenue-matrix.ts`, with 23 rows. Each row records the problem, audience, value, access, monetization method, journey, dependencies, operating cost, risks, metrics, priority and status. It's viewable at **/admin/monetization** and exportable as CSV from **/admin/revenue-matrix.csv**; both need the admin login.

| Feature | Access | How it earns |
| --- | --- | --- |
| Recipe library & search | Free | Indirect: the main source of search traffic |
| Recipe pages | Free | Indirect: calls to action for the planner, shopping list and newsletter |
| Curated collections | Free | Labelled sponsored collections (boundary built; no sponsors yet) |
| Recipe comparison | Free | Indirect: builds trust |
| Weekly meal planner | Free, plus Premium extras | Core Premium driver |
| Saved plans (3 free, 50 Premium) | Free, plus Premium extras | Premium raises the limit |
| Plan and list exports (CSV, .ics) | Premium | Premium; enforced on the server |
| Shopping list | Free | Retention. Grocery partners only where they genuinely exist (none assumed) |
| Shopping calendar | Free | Retention (weekly return visits) |
| Free 7-day plan | Free | Newsletter sign-ups leading towards Premium |
| Nutrition education | Free, never paid | Search traffic and trust |
| Health-condition guides | Free, never paid | None directly: no ads, no affiliate links, no health-based targeting |
| Supplement guides | Free, never paid | None: affiliate links prohibited |
| Fitness & wellness | Free | Future disclosed equipment affiliate links |
| Newsletter | Free | Retention and Premium nurture; a labelled sponsor slot later |
| Premium & billing | Commercial | Recurring revenue |
| Professional directory | Free | Featured listings; bookings later, after legal review |
| Business directory & listings | Commercial | Free Basic tier, paid Featured; Business Plus planned |
| Digital products | Commercial | One-time purchases |
| Affiliate links | Free | Commission (boundary built) |
| Partnerships | Sponsored (labelled) | Flat-fee sponsorship |
| Workplace programmes | Commercial | Quoted packages |
| Dashboard & account | Free | Retention; route into billing |

---

## 2. Free vs Premium feature map

| Feature | Free | Premium | Status |
| --- | --- | --- | --- |
| Full recipe library, recipe pages, core filters | ✓ | ✓ | Live |
| All nutrition, condition, supplement and fitness guides | ✓ | ✓ | Live (never paid) |
| Save recipes and articles | ✓ | ✓ | Live |
| Seven-day planner (edit, move, servings, prepared, custom meals) | ✓ | ✓ | Live |
| Pantry-based suggestions | ✓ | ✓ | Live |
| Shopping list (consolidate, aisles, print, share, your own prices) | ✓ | ✓ | Live |
| Shopping calendar with homepage reminder | ✓ | ✓ | Live |
| Saved weekly plans | 3 | 50 | Live |
| Export plans and lists (CSV, calendar) | — | ✓ | Live, enforced on the server |
| Advanced filters and saved filter sets | — | Planned | Not sold |
| Household planning | — | Planned | Not sold |
| Batch-cooking schedules | — | Planned | Not sold |
| Multiple lists, aisle ordering, price history | — | Planned | Not sold |
| Personal recipe collections | — | Planned | Not sold |
| Cross-device sync | — | Planned (needs accounts) | Until then: restore by emailed link |

**What Premium includes today is modest.** Price it accordingly: "founding member" pricing is a reasonable approach. Promise that planned features will join Premium at no extra cost, which the pricing page already states.

---

## 3. Subscription architecture

```
Browser ──POST /api/billing/checkout──▶ Stripe Checkout (hosted)
   ▲                                          │
   │                                          ▼
   └──303── /api/billing/confirm ◀── success_url?session_id
             verifies the session + subscription with Stripe
             sets a signed httpOnly cookie nw_ent {cus, sub, exp}

/api/billing/entitlement  ── reads the cookie; once it expires, re-checks the subscription with Stripe
/api/premium/export       ── refuses (402) without a valid entitlement
/api/billing/portal       ── Stripe Customer Portal: switch plan, update card, cancel, invoices, history
/api/billing/webhook      ── signature-verified, de-duplicated per event id, forwarded with an Idempotency-Key
/api/billing/restore      ── emails a 30-minute signed link to the checkout email (Resend); same reply either way
```

| Brief requirement | Implementation |
| --- | --- |
| Configurable plans | Plan features and limits live in `plans.ts`; prices, currencies, intervals and trials come from Stripe and env. You change prices in the Stripe dashboard, not in code. |
| Checkout | Stripe Checkout with promo codes, an optional trial (`PREMIUM_TRIAL_DAYS`), optional Stripe Tax (`STRIPE_AUTOMATIC_TAX`), and attribution plus experiment metadata. |
| Server-side verification | `/api/billing/confirm` retrieves the session and subscription from Stripe. A redirect alone never grants access. |
| Webhooks: authenticated and idempotent | HMAC-SHA256 signature with a 5-minute tolerance. Event ids are de-duplicated per server instance, and the id is forwarded as an `Idempotency-Key` so receiving systems can de-duplicate across instances. |
| Subscription status sync | Entitlements are re-checked against Stripe at least every 24 hours and at the end of the paid period, with 3 days' grace. Cancelled or unpaid means free; past due shows a warning. |
| Failed payments | Stripe Smart Retries plus a "Your last payment didn't go through" message on `/account/billing`. |
| Cancellation, refunds, receipts, billing history | Stripe Customer Portal and Stripe receipts; refunds are issued in the Stripe dashboard. |
| Duplicate subscriptions | Checkout returns 409 if this browser already has Premium. |
| Card data | Never touches NourishWell: Stripe-hosted Checkout and Portal only. |
| Regional availability | Stripe currency options on each price; `/pricing` lists the extra currencies, and Checkout confirms the buyer's currency. |

**Limitations:** see section 12.

---

## 4. Business-listing revenue architecture

| Package | Price | Benefits | Status |
| --- | --- | --- | --- |
| Basic | Free | Profile, services, areas, languages, contact, verification date, "report a correction" | Live |
| Featured | Stripe `STRIPE_PRICE_LISTING_FEATURED`, monthly | Listed first and labelled "Promoted"; gallery (up to 8 images); extended description; prominent booking button | Live once a price is set |
| Business Plus | — | Multiple locations, enquiry inbox, monthly performance report | **Planned.** Not sold until accounts and stored enquiries exist |

How a listing goes from application to Featured:

1. The business applies at `/for-businesses`. The form records which tier they want and where they came from.
2. You verify them offline.
3. You publish the listing in `src/content/directory.ts`, which becomes database-backed later.
4. `/admin` generates a payment link signed with HMAC, so it can't be edited to upgrade a different listing.
5. The business pays at `/for-businesses/upgrade`.
6. The Stripe webhook forwards the event.
7. You set `tier: "premium"` and `promoted: true`.

Rules that are enforced: unverified listings never render, and Featured extras render only when a listing is verified *and* paid. Featured listings are sorted first and always labelled.

Professional bookings and lead fees are **not launched**. They need enough verified professionals and a review of healthcare advertising and referral rules in each market.

---

## 5. Pricing and checkout interfaces

| Interface | Route |
| --- | --- |
| Pricing: Free vs Premium, monthly/yearly toggle, live prices, trial, other currencies, renewal terms before payment, planned features, comparison table, FAQ | `/pricing` |
| Billing: status, trial, cancels at period end, past-due warning, manage billing (portal), restore by email, remove from this browser | `/account/billing` |
| Listing packages and application | `/for-businesses` |
| Featured listing payment (signed link only) | `/for-businesses/upgrade` |
| Digital products store and product page, with sample pages and immediate-access consent | `/resources`, `/resources/[slug]` |
| Download page (signed, 7-day token) | `/resources/[slug]/download` |

---

## 6. Payment integration and configuration status

| Integration | Code status | Configuration needed |
| --- | --- | --- |
| Stripe subscriptions | Built and tested against the mock Stripe API | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PREMIUM_MONTHLY` / `_YEARLY`, `ENTITLEMENT_SECRET`, `STRIPE_WEBHOOK_SECRET` |
| Featured listing payments | Built and tested (mock) | `STRIPE_PRICE_LISTING_FEATURED` |
| Digital products | Built and tested (mock) | `STRIPE_PRICE_PRODUCT_WORKBOOK` (a one-time price) |
| Stripe Customer Portal | Built and tested (mock) | Enable and configure the portal in the Stripe dashboard |
| Restore and download emails | Built and tested against a mock of the Resend API | `RESEND_API_KEY`, `EMAIL_FROM` (verified sending domain) |
| Webhook forwarding | Built and tested (mock) | `BILLING_EVENTS_WEBHOOK_URL` (optional) |
| Stripe Tax | Flag only | Enable Stripe Tax, then set `STRIPE_AUTOMATIC_TAX=true` |
| Analytics (events) | Built | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` |
| Analytics (dashboard traffic) | Built | `PLAUSIBLE_API_KEY` |
| Affiliate programmes | Boundary only | Programme approval in each market, plus reviewed product data |

**Real Stripe test mode and live mode have not been tested yet.** They need your keys; follow MONETIZATION.md section 10. Before choosing Stripe for a given market, confirm merchant eligibility, payouts, payment methods and fees for your country of incorporation.

---

## 7. Conversion-event specification

Events are sent only after the visitor allows analytics, and only to Plausible. No event carries health-condition topics, form contents or personal identifiers.

| Event | Fired when | Props |
| --- | --- | --- |
| `recipe_view` | A recipe page is viewed | — |
| `search` | A search is run (the words aren't sent) | — |
| `recipe_saved` | A recipe is saved | — |
| `meal_plan_created` | A plan is generated or a starter plan is copied | `source` |
| `shopping_list_created` | A list is made from a plan | — |
| `newsletter_signup` | Subscription confirmed by the server | `source` (footer, homepage, recipe, article, free-meal-plan, premium-waitlist) |
| `lead_magnet_view` | `/free-meal-plan` is viewed | `kitchen` |
| `pricing_view` | `/pricing` is viewed | `sellable` |
| `upgrade_prompt_view` | An upgrade prompt is shown | `feature`, `variant` |
| `upgrade_prompt_click` | An upgrade prompt's link is clicked | `feature`, `variant` |
| `experiment_exposure` | First render in an experiment | `experiment`, `variant` |
| `checkout_started` | A checkout button is pressed | `interval` or `product` |
| `subscription_started` | Return from a successful checkout | `trial` |
| `premium_export` | A Premium export is downloaded | `kind` |
| `product_view` | A product page is viewed | `product` |
| `product_purchased` | The download page opens, once per session | `product` |
| `affiliate_click` | An affiliate link is clicked | `product`, `placement` |
| `share` | Share actions | — |

**Server-side facts (the source of truth)** come from Stripe, and the revenue dashboard reads them there:
- Checkout Session `metadata.product`, `attr_*` (first-touch attribution) and `exp_*` (experiment variants).
- Subscription and invoice metadata.

Listing applications, newsletter sign-ups and contact enquiries carry `source` and `attribution` in their webhook payloads.

---

## 8. Revenue analytics dashboard (`/admin/revenue`)

The dashboard reads Stripe live for 7, 30 or 90 days, or 12 months. It shows:

- **Money in:**
  - Gross sales: charges, including any tax collected.
  - Refunds and Stripe fees.
  - Net receipts: after refunds and fees, still including tax.
  - Tax collected, from invoices.
  - Net receipts excluding tax.

  Payouts are excluded. Currencies are never added together, and nothing is labelled profit.
- **Subscriptions:**
  - Premium MRR, normalised to a month, with trials excluded.
  - Active Premium subscriptions, with trialing and past-due counts.
  - New Premium subscriptions and Premium churn.
  - Average revenue per paying customer.
  - Featured-listing MRR and churn.
- **By product:**
  - Premium monthly, Premium yearly, Featured listing and each digital product.
  - Affiliate and advertising revenue are shown as "not connected" rather than guessed.
- **By market:** billing-address country.
- **Checkout funnel:** sessions started vs completed per product, and abandonment.
- **Acquisition source of purchases:** first-touch UTM source and campaign.
- **Experiments:** checkout completion by variant. A winner is suggested only when each variant has at least 200 checkouts and the difference is significant at 95%.
- **Business listings:**
  - Approved listing count and paid Featured listings.
  - Applications are counted in the inbox the form webhook delivers to, until the database exists.
- **Traffic:** visitors, plus sign-up and checkout conversion by landing page, if `PLAUSIBLE_API_KEY` is set. Counts cover consenting visitors only; the dashboard says so.

**Reconciliation:** every figure comes from Stripe list endpoints. Lists are read up to 1,000–5,000 objects, and the page warns if that limit truncates a period; use Stripe Sigma or exports beyond that.

---

## 9. Prioritised monetization roadmap

| Phase | Item | State |
| --- | --- | --- |
| 1: Free value & conversion foundations | Content, recipes, planner, lists, shopping calendar, newsletter boxes, lead magnet, attribution, analytics, entitlement architecture | **Done.** Accounts still to come |
| 2: Premium subscription | Pricing, configurable plans, Stripe, enforcement, portal, failed-payment handling, restore, revenue dashboard | **Built.** Set Stripe keys and prices, test in Stripe test mode, then go live |
| 2b: Make Premium worth more | Household planning, batch-cooking schedules, multiple lists, collections, advanced filters | Planned; ship before raising prices |
| 3: Paid business listings | Verification, packages, signed payment links, Featured rendering | **Built** for Featured. Business Plus, business accounts and a dashboard need the database |
| 4: Additional revenue | Digital products | **Built.** Set a price |
| 4 | Sponsored collections and newsletter slots | Boundary built; needs real audience numbers for the media kit |
| 4 | Affiliate equipment guides | Boundary built; needs programme approval and reviewed products |
| 4 | Workplace programmes | Enquiry route live; define packages when there is capacity to deliver |
| 4 | Bookings and lead fees | Not started (regulatory review first) |
| Later | Display ads | Deferred (performance and trust cost at current scale) |
| Foundation | Accounts (Supabase): sync, business accounts, durable webhook log, listings in the database | The next engineering priority after Premium launches |

---

## 10. External credentials and business decisions needed

**Credentials** (environment variables; all are in `.env.example`):
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`, `STRIPE_PRICE_LISTING_FEATURED`, `STRIPE_PRICE_PRODUCT_WORKBOOK`
- `ENTITLEMENT_SECRET`
- `PREMIUM_TRIAL_DAYS` (optional), `STRIPE_AUTOMATIC_TAX` (optional)
- `RESEND_API_KEY`, `EMAIL_FROM`
- `BILLING_EVENTS_WEBHOOK_URL` (optional)
- `NEWSLETTER_WEBHOOK_URL`, `CONTACT_WEBHOOK_URL`, `LISTINGS_WEBHOOK_URL`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `PLAUSIBLE_API_KEY`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

**Decisions for you:**
1. **Premium prices and currencies:** the research is in MONETIZATION.md section 15.
2. **Trial:** whether to offer one, and how long.
3. **Featured-listing price.**
4. **Workbook price.**
5. **Refund policy wording:** the template is in MONETIZATION.md section 13, flagged for legal review.
6. **Country of incorporation:** this decides Stripe eligibility, tax registration and VAT/GST.
7. **Sending domain for email.**
8. **Which markets you'll take affiliate programmes in.**
9. **Media kit:** only once you have real audience numbers.
10. **Workplace packages:** whether to offer them at all.

---

## 11. Test report (commercial flows)

The tests ran on 13 October 2026 against production builds. Details are in [QA_REPORT.md](QA_REPORT.md).

- **`npm run e2e:billing`: 59 checks passed** against `e2e/mock-stripe.cjs`, which mocks both the Stripe and Resend APIs. They cover:
  - Live prices and the yearly saving.
  - Disclosures before payment.
  - Checkout, then verified entitlement.
  - Attribution and experiment metadata on checkout.
  - Duplicate-subscription block.
  - Premium limits and exports.
  - Portal.
  - Expiry re-check after cancellation and renewal.
  - Forged cookie rejected.
  - Signed webhook accepted; unsigned and duplicate webhooks refused or skipped.
  - Restore: same reply for unknown emails, email sent, link works in a second browser, tampered link refused.
  - Featured listing: signed link, tampered link refused, payment.
  - Workbook: immediate-access consent, one-time checkout with invoice, verified delivery (the real PDF), tampered token refused, files not public, email copy.
  - Revenue dashboard figures: gross, refunds, fees, net, MRR, product, market, source, experiments.
  - Monetization map and matrix CSV; CSV requires admin login.
- **Unconfigured build:** checkout, webhook and restore return honest 503s. Pricing shows a waitlist, and the dashboard says Stripe isn't connected.
- **Unit tests:** billing, experiments (deterministic assignment, weight split, sample-size guard), revenue aggregation (gross/refund/fee/net, MRR normalisation, churn, invoices by product and market, checkout funnel), signed tokens, listing ordering, disclosure rules, the feature matrix.

**Not tested:** real Stripe (test or live mode), real Resend delivery, the real Plausible API.

---

## 12. Implementation limitations

- **Premium is per browser.** There are no accounts yet. Restore by email covers other devices; saved plans themselves stay in each browser.
- **No durable records.** Without a database, webhook de-duplication is per instance. Your receiving system should de-duplicate using the forwarded `Idempotency-Key`.
- **Restore links are reusable** until they expire after 30 minutes; a database is needed for single use.
- **Download links last 7 days.** Re-issuing one after that is a manual support task.
- **Saved-plan limits are client-side,** because plans are stored in the browser. The export feature is enforced on the server.
- **Experiments measure checkout completion,** not pricing-page views. Combine with Plausible for top-of-funnel figures. Variants never change prices.
- **Business accounts, a business dashboard, Business Plus, listing analytics, enquiry storage, bookings and lead fees are not built.**
- **Affiliate and sponsorship content:** the infrastructure exists, but there are no partners or published commercial content.
- **Two kinds of revenue aren't in Stripe:** affiliate and advertising revenue are reported by those partners, outside Stripe.
- **Legal and tax compliance hasn't been assessed.** That covers auto-renewal rules, digital-content withdrawal rights, VAT/GST, healthcare advertising and referral rules, FTC and ASA disclosure, and privacy. Assess with counsel before going live.
