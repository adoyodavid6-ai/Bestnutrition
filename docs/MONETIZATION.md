# Monetization setup guide

This guide is for the owner. It explains how to set up and run NourishWell's revenue: the Premium subscription, paid featured listings and sponsorships. It also covers testing, going live, policies and the numbers to watch.

Nothing here sets a price. You set prices in Stripe, and the site reads them from Stripe. Until Stripe is configured, the site shows Premium as "Coming soon" with a waitlist and takes no payments.

Related documents: `docs/PROMPT_v3.md` (section 15), `docs/MARKETING.md`, `docs/OPERATIONS.md`.

---

## 1. How it fits together

| Piece | Where it lives | What it does |
| --- | --- | --- |
| Products and prices | Stripe Dashboard | You create them and choose the amounts and currencies |
| `/pricing` | Site | Reads the live Stripe Price objects on the server (cached for up to one hour) and shows them, with a monthly/yearly toggle, the trial if set, an FAQ and the renewal terms |
| `POST /api/billing/checkout` | Site | Creates a Stripe Checkout Session (Premium or featured listing) and sends the customer to Stripe's payment page |
| Stripe Checkout | Stripe | Takes the payment. Card details never touch the site |
| `GET /api/billing/confirm` | Site | Verifies the Checkout Session with Stripe, then sets a signed Premium cookie `nw_ent` and redirects to `/account/billing` |
| `/account/billing` | Site | Shows status; "Manage billing" opens the Stripe Customer Portal; "Remove Premium from this device" signs this browser out of Premium |
| Stripe Customer Portal | Stripe | Cancel, switch monthly/yearly, update card, receipts, invoices and billing history |
| `POST /api/billing/webhook` | Site | Verifies Stripe's signature on each event and forwards a short summary (no card data) to `BILLING_EVENTS_WEBHOOK_URL` if set |
| `POST /api/premium/export` | Site | A Premium feature enforced on the server: plan and shopping list as CSV, and a calendar .ics |
| `/admin` | Site | Shows which billing settings are configured, generates signed featured-listing payment links, builds UTM links |

The integration calls Stripe's API with `fetch`. There is no Stripe SDK to update.

---

## 2. Before you start

1. Create a Stripe account in the country where your business is registered, and complete account activation (business details, bank account, identity checks).
2. Decide the business name customers will see, a support email address and a statement descriptor (the text on bank statements, for example `NOURISHWELL`). Set them under Settings → Business → Public details.
3. Under Settings → Branding, add the logo colours (Midnight Violet `#1f0e2f`, Parchment `#f4efed`) so Checkout, the Customer Portal, receipts and invoices look like NourishWell.
4. Have draft versions of `/terms` (subscription, renewal, cancellation and refund terms) and `/privacy` ready. They will be linked from Checkout and the Customer Portal. Get them reviewed by a lawyer before going live.
5. Talk to an accountant about tax registration (VAT, GST, US sales tax) in the markets you sell to. Do this before setting prices, because it affects whether prices include tax.

Do everything in this guide in **test mode** first (the "Test mode" toggle in the Dashboard). Test mode and live mode have separate products, prices, webhooks and keys.

---

## 3. Create products and prices

Stripe Dashboard → Product catalogue → Add product. Create three prices across two products.

### 3.1 Product: NourishWell Premium

- Name: `NourishWell Premium`
- Description: a plain description, for example "More saved meal plans and export of your plan and shopping list to spreadsheet and calendar."
- Tax code: choose the code for electronically supplied digital services. Confirm the choice with your accountant.
- Price 1 (monthly): Recurring, billing period Monthly, your amount in your main currency.
- Price 2 (yearly): Recurring, billing period Yearly, your amount. Make it cheaper than 12 monthly payments; the site calculates and shows the saving from the live prices.
- Copy each Price ID (`price_…`) into `STRIPE_PRICE_PREMIUM_MONTHLY` and `STRIPE_PRICE_PREMIUM_YEARLY`.

Only monthly and yearly prices with an interval count of 1 are shown. A "every 3 months" price will not appear.

### 3.2 Product: Featured listing

- Name: `NourishWell Featured Listing`
- Price: Recurring, Monthly, your amount.
- Copy the Price ID into `STRIPE_PRICE_LISTING_FEATURED`.
- Checkout for listings collects a billing address and lets businesses enter a tax ID.

### 3.3 Multi-currency prices

Use one Price with several currencies rather than separate Prices per country. The site uses one Price ID per interval.

1. When creating or editing the price, use the option to add more currencies (Stripe calls these currency options).
2. Add at least USD and GBP. Add Asian currencies you want to sell in, for example SGD, INR or MYR. Set each amount as a local price point (for example a figure ending in .99 or a round number), not a raw conversion.
3. Stripe Checkout shows the customer the price in their local currency when you have configured that currency. The amount they see in Checkout is what they pay.
4. On `/pricing`, the site currently shows the price in the Price's default currency and lists the other currencies it is available in. Make sure the default currency is the one most visitors use.

Things to know:

- **Price amounts cannot be edited.** To change a price, create a new Price, put its ID in the environment variable and redeploy. Existing subscribers stay on the old Price until you migrate them (Stripe lets you do this from the subscription page, with notice to customers as required by law).
- **Tax behaviour is set per Price**, so all its currencies share it. "Inclusive" (tax included in the price) is simpler for consumers and is the norm for UK consumer prices. "Exclusive" adds tax on top in Checkout, which is common in the US. Decide with your accountant. If you need different behaviour per currency, you would need separate Prices and a code change.
- Stripe also offers automatic currency conversion features for Checkout. If you prefer those to fixed local prices, read Stripe's current documentation on them first, including who pays the conversion fee.

### 3.4 Free trial (optional)

Set `PREMIUM_TRIAL_DAYS` to a whole number from 1 to 90. Leave it unset (or 0) for no trial. When set, `/pricing` and Checkout show the trial and what happens when it ends. Checkout still collects a card at the start.

### 3.5 Promotion codes

Checkout shows an "Add promotion code" field. To create a code: Product catalogue → Coupons → create a coupon (percentage or amount, duration), then add a customer-facing promotion code to it. Set expiry dates and redemption limits. Never advertise a discount as time-limited unless it truly ends.

---

## 4. Configure the Customer Portal

Stripe Dashboard → Settings → Billing → Customer portal.

| Setting | Choose |
| --- | --- |
| Invoice history | On |
| Customer information (email, billing address) | On |
| Payment methods (update card) | On |
| Cancel subscriptions | On. Cancel **at end of billing period**. Optionally collect a cancellation reason (keep it optional) |
| Switch plans | On. Add the Premium product with both the monthly and yearly prices. Do not add the featured listing product |
| Proration when switching | Your choice. Prorating is fairer to customers; check the result in test mode |
| Pause subscriptions | Off (the site treats paused as not Premium) |
| Business information | Headline, links to `/terms` and `/privacy` |
| Default redirect link | `https://<your-domain>/account/billing` |

Save. The site opens the portal through `POST /api/billing/portal`.

Featured-listing customers do not have a page on the site to open the portal. In Settings → Billing → Subscriptions and emails, turn on the option to include a link to the customer portal in emails (the exact wording changes in Stripe's Dashboard), so businesses can manage billing from their receipt. The `/for-businesses/upgrade` success message tells them to use that link.

### 4.1 Customer emails

- Settings → Customer emails: turn on emails for successful payments and refunds (receipts).
- Settings → Billing → Subscriptions and emails: turn on emails for failed payments, expiring cards and upcoming renewals. Turn on Smart Retries for failed payments. Turn on trial-ending reminders if you offer a trial.
- Some laws require a reminder before an annual renewal or before a free trial converts. Configure Stripe's reminder emails accordingly and confirm the timing with your lawyer.

---

## 5. Webhook endpoint

Stripe Dashboard → Developers (Workbench) → Webhooks → add an endpoint (Stripe may call it an event destination).

- URL: `https://<your-domain>/api/billing/webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created` (optional; the route handles it)
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

What the webhook does today: it rejects any request without a valid Stripe signature (HTTP 400), then, if `BILLING_EVENTS_WEBHOOK_URL` is set, forwards a short summary (event type, customer and subscription IDs, status, amount, currency, product, listing, first-touch source and campaign). If forwarding fails it returns an error so Stripe retries. Premium access does not depend on the webhook (see section 8); the webhook keeps you informed and becomes the source of truth when accounts and a database launch.

Use `BILLING_EVENTS_WEBHOOK_URL` for a Slack incoming webhook, a Zapier or Make hook that writes to a spreadsheet, or your own endpoint. That gives you a running log of new subscriptions, cancellations, failed payments and paid listings.

Test mode and live mode need separate endpoints with separate signing secrets.

For local development, the Stripe CLI can forward events: `stripe listen --forward-to localhost:3000/api/billing/webhook`. It prints a temporary signing secret to use locally.

---

## 6. Stripe Tax

1. Stripe Dashboard → Settings → Tax. Set your business address (origin) and a default tax code.
2. Add a registration for each place where you are registered to collect tax (for example UK VAT). Stripe only calculates and collects tax where you have added a registration.
3. Use Stripe Tax's threshold monitoring to see where you may need to register. Your accountant decides when to register.
4. Make sure each Price has the right tax behaviour (section 3.3).
5. Set `STRIPE_AUTOMATIC_TAX=true` in the environment. The checkout route turns on automatic tax only when this is set. Do not set it until steps 1 to 4 are done, or Checkout may fail.
6. Test a purchase with a UK and a US billing address in test mode and check the tax line in Checkout and on the invoice.

Stripe Tax has its own fees. Check Stripe's pricing page for your country.

---

## 7. Environment variables

Set these in your host (for example Vercel → Project → Settings → Environment Variables). Use test-mode values in Preview and live-mode values in Production. Never put secret values in code, in `NEXT_PUBLIC_*` variables, or in public documents.

| Variable | Required | Value | Notes |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes, for any payment | `sk_test_…` or `sk_live_…` (or a restricted key) | `/admin` shows whether it is test or live mode |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_…` from the webhook endpoint | Different in test and live mode |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | At least one Premium price | `price_…` | Monthly recurring Price |
| `STRIPE_PRICE_PREMIUM_YEARLY` | At least one Premium price | `price_…` | Yearly recurring Price |
| `STRIPE_PRICE_LISTING_FEATURED` | For featured listings | `price_…` | Monthly recurring Price |
| `PREMIUM_TRIAL_DAYS` | No | Whole number 1 to 90 | Unset or 0 means no trial |
| `ENTITLEMENT_SECRET` | Yes | At least 32 random characters | Signs the `nw_ent` cookie and listing payment links. Values shorter than 32 characters are ignored and Premium stays "Coming soon". Generate with a password manager or `openssl rand -base64 48` |
| `BILLING_EVENTS_WEBHOOK_URL` | No | HTTPS URL | Receives a summary of each verified Stripe event |
| `STRIPE_AUTOMATIC_TAX` | No | `true` | Only after Stripe Tax is configured (section 6) |
| `PREMIUM_MONTHLY_PRICE_USD` | No | Default `37.99` | Premium list price in US dollars, charged with inline Stripe `price_data`. `STRIPE_PRICE_PREMIUM_MONTHLY`, if set, overrides it |
| `PRO_SIGNUP_FEE_USD` | No | Default `100` | One-time professional sign-up fee, charged only via a signed link after verification |
| `STRIPE_ADAPTIVE_PRICING` | No | Unset (on) or `off` | Lets buyers see and pay the converted amount in their local currency; settlement stays USD. Requires Adaptive Pricing to be available on your Stripe account — if Checkout returns an error mentioning it, set `off` (cards in any currency can still pay a USD charge) |
| `BOOKINGS_WEBHOOK_URL` | No | HTTPS URL | Optional team record of booking requests (no client notes) |
| `STRIPE_PRICE_PRODUCT_WORKBOOK` | For the workbook | `price_…` | A **one-time** Price (not recurring). The product shows "Coming soon" until set |
| `RESEND_API_KEY`, `EMAIL_FROM` | For restore and download emails | Resend API key; `NourishWell <hello@yourdomain>` from a verified domain | Without them, restore by email says "contact us" and download links aren't emailed |
| `PLAUSIBLE_API_KEY` | No | Plausible Stats API key | Adds traffic and landing-page conversion to `/admin/revenue` |
| `RESEND_API_BASE` | No (testing only) | URL | Defaults to `https://api.resend.com` |
| `STRIPE_API_BASE` | No (testing only) | URL | Defaults to `https://api.stripe.com`. Used to point tests at a mock server. Never set in production |

Premium becomes sellable when `STRIPE_SECRET_KEY`, `ENTITLEMENT_SECRET` and at least one Premium Price ID are set and the Price can be read from Stripe. Featured listings become sellable when `STRIPE_SECRET_KEY`, `ENTITLEMENT_SECRET` and `STRIPE_PRICE_LISTING_FEATURED` are set.

**Rotating `ENTITLEMENT_SECRET`** removes Premium from every device (subscribers restore with "Email me a sign-in link" in Account → Billing) and invalidates every listing payment link you have sent. Only rotate it if it may have leaked.

---

## 8. How Premium entitlements work

Until accounts launch, Premium is tied to the browser where the customer subscribed. To add another browser, the subscriber enters their checkout email in Account → Billing; if Stripe has an active Premium subscription for that email, a 30-minute signed link is emailed (the response is identical either way, so it can't reveal who subscribes).

1. The customer pays in Stripe Checkout.
2. Stripe redirects to `/api/billing/confirm?session_id=…`. The site retrieves that Checkout Session from Stripe (it never trusts the URL alone), checks it is complete and for Premium, and reads the subscription.
3. The site sets `nw_ent`: an httpOnly cookie signed with `ENTITLEMENT_SECRET`. It holds the Stripe customer ID, the subscription ID and a re-check time. It holds no name, email or card data.
4. The re-check time is the earlier of 24 hours from now and the end of the paid period plus 3 days' grace. At the re-check, the site asks Stripe for the subscription:
   - Active, trialing or past due (Stripe is retrying a failed payment): Premium continues.
   - Cancelled, unpaid, incomplete or paused: Premium is removed from that browser.
   - Stripe unreachable: Premium continues for that request; it re-checks next time.
5. A cancellation in the Customer Portal takes effect at the end of the paid period, so the customer keeps Premium until then.
6. "Remove Premium from this device" on `/account/billing` deletes the cookie. It does not cancel the subscription.

### 8.1 The per-device limitation

- Premium does not follow the customer to a new phone, a different browser or a private window, and is lost if they clear cookies.
- This is stated on `/pricing` (FAQ) and `/account/billing`. Mention it in support replies too.
- **Restoring on a new device goes through support.** Process: the customer contacts you via `/contact` with the email used at checkout. Find the customer in Stripe, confirm the subscription is active, and help them restore access. Until a self-serve restore exists, the reliable method is for them to sign in on the original device; if that is not possible, decide case by case (for example a refund or a partial refund) and record it.
- When accounts (Supabase) launch, Premium will be linked to the account and will work on any device after sign-in.

### 8.2 Saved-plan limits

Free: 3 saved weekly plans. Premium: 50. The limit is checked on the device today and will be enforced on the server once plans are stored in a database. Export (`/api/premium/export`) is already enforced on the server.

---

## 9. Featured listings: verify, link, pay, feature

1. **Application.** A business applies at `/for-businesses`. The application, with its attribution, arrives at `LISTINGS_WEBHOOK_URL`.
2. **Verification.** Follow `docs/OPERATIONS.md`: check registration where available, the website and the services; reject cure, detox and miracle claims and fabricated reviews. Record who verified it and when.
3. **Publish the free basic listing.** Add the entry to `src/content/directory.ts` with `verification: "verified"`. Unverified entries never appear, paid or not.
4. **Generate the payment link.** In `/admin`, open "Featured listing payment links", enter the listing slug and generate the link. It looks like `https://<domain>/for-businesses/upgrade?listing=<slug>&sig=<signature>`. The signature means it cannot be edited to upgrade a different listing.
5. **Send it** to the business with the price, what "Featured" includes, that it renews monthly until cancelled, and how to cancel.
6. **Payment.** The business pays in Checkout (billing address and optional tax ID collected). Stripe emails a receipt. If `BILLING_EVENTS_WEBHOOK_URL` is set, you get a notification with the listing slug.
7. **Mark it featured.** Confirm the payment in Stripe, then set the listing's paid-placement flag in `src/content/directory.ts` (currently the field `promoted: true`) and deploy. The success page tells the business this happens within two working days, so keep to that or change the wording.
8. **Label.** Featured entries always show a visible "Featured" (or "Promoted") label. Payment never grants verification, a badge, a rating or editorial endorsement.
9. **Cancellation.** When you see `customer.subscription.deleted` for a listing, set the flag back to `false` at the end of the paid period.
10. **Re-verify yearly.** If a featured business fails re-verification, remove the listing, cancel the subscription and refund in line with your policy.

---

## 10. Test-mode end-to-end test plan

Run this in test mode on a preview deployment with test keys. Record results with the date in `docs/QA_REPORT.md`.

### 10.1 Test cards

Use any future expiry date, any 3-digit CVC and any postcode.

| Card | Behaviour |
| --- | --- |
| `4242 4242 4242 4242` | Succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication; succeeds after you approve it |
| `4000 0000 0000 0341` | Attaches to the customer successfully, but charges fail. Use with a trial to test a failed renewal |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Declined: insufficient funds |

Check Stripe's testing documentation for the current list.

### 10.2 Test cases

| # | Test | Steps | Expected |
| --- | --- | --- | --- |
| 1 | Not configured | Remove all Stripe variables. Open `/pricing` | Free plan; Premium "Coming soon" with waitlist; no price; no Subscribe button. `POST /api/billing/checkout` returns 503 |
| 2 | Live prices | Set test variables. Open `/pricing` | Monthly and yearly amounts and currency match the Stripe test Prices exactly; saving shown matches the maths; other currencies listed |
| 3 | Terms before payment | Read `/pricing` | Price, interval, auto-renewal, trial terms (if any) and how to cancel are visible before the button |
| 4 | Monthly subscription | Subscribe monthly with `4242…` | Returns to `/account/billing` showing Active; `nw_ent` cookie set (httpOnly); webhook events received |
| 5 | Yearly subscription | New browser profile; subscribe yearly | As above with yearly billing |
| 6 | 3D Secure | Subscribe with `4000 0025 0000 3155` and approve | Active |
| 7 | 3D Secure failed | Same card, fail the authentication | No subscription; Premium not granted |
| 8 | Decline | Subscribe with `4000 0000 0000 0002` | Checkout shows the decline; no Premium |
| 9 | Trial | Set `PREMIUM_TRIAL_DAYS=7`; subscribe | `/pricing` and Checkout mention the trial; `/account/billing` shows Trialing |
| 10 | Failed renewal | With a trial set, subscribe using `4000 0000 0000 0341`; end the trial from the subscription in the Dashboard (or wait) | `invoice.payment_failed` received; subscription past due; Premium continues while Stripe retries; Stripe emails the customer (if failed-payment emails are on). `/account/billing` shows "Your last payment didn't go through" with a prompt to update the card |
| 11 | Promotion code | Create a test promotion code; apply it in Checkout | Discount shown in Checkout and on the invoice |
| 12 | Customer Portal | "Manage billing" on `/account/billing` | Portal opens with your branding; shows invoices; can update card; can switch monthly and yearly |
| 13 | Cancel at period end | Cancel in the portal | `/account/billing` shows "cancels on [date]"; Premium remains |
| 14 | Cancellation takes effect | In the Dashboard, cancel a test subscription immediately; wait for the next re-check (up to 24 hours) | Premium removed from that browser |
| 15 | Remove from device | "Remove Premium from this device" | Cookie removed; subscription still active in Stripe |
| 16 | Tampered cookie | Edit the `nw_ent` value in browser dev tools | Treated as Free; cookie cleared |
| 17 | Already Premium | Try to subscribe again from the same browser | Refused with a message pointing to Account → Billing |
| 18 | Premium export | Free browser vs Premium browser: call export | Free refused (HTTP 402) with a clear message; Premium receives CSV and .ics |
| 19 | Webhook signature | Send a request to `/api/billing/webhook` without a valid signature | 400 |
| 20 | Events forwarding | Set `BILLING_EVENTS_WEBHOOK_URL` to a test hook | A summary arrives for each subscribed event type |
| 21 | Featured listing | Generate a link in `/admin`; pay with `4242…` | Success page; receipt; event forwarded with the listing slug |
| 22 | Forged listing link | Change the `listing` or `sig` value in the link | Refused before Checkout |
| 23 | Tax | With Stripe Tax configured and `STRIPE_AUTOMATIC_TAX=true`, pay with UK and US addresses | Tax line correct for your registrations |
| 24 | Attribution | Visit with `?utm_source=test&utm_medium=email&utm_campaign=qa`, then subscribe | `attr_utm_source=test` etc. in the subscription metadata |
| 25 | Refund | Refund a test payment from the Dashboard | Refund email sent; decide whether to cancel the subscription too |

---

## 11. Going-live checklist

- [ ] All tests in section 10 passed in test mode and are recorded in `docs/QA_REPORT.md`.
- [ ] Stripe account fully activated; payouts enabled; public business details, support email and statement descriptor set.
- [ ] Live-mode products and prices created (test-mode objects do not carry over). Amounts and currencies double-checked.
- [ ] Live-mode Customer Portal configured (section 4); portal link in emails turned on.
- [ ] Live-mode webhook endpoint created with the events in section 5; live `whsec_` secret set.
- [ ] Stripe Tax registrations added and reviewed by your accountant, or `STRIPE_AUTOMATIC_TAX` left unset by decision.
- [ ] Customer emails (receipts, failed payments, renewal and trial reminders) turned on in live mode.
- [ ] Production variables set: live secret key, live Price IDs, live webhook secret, a new `ENTITLEMENT_SECRET` (not the test one), optional trial days, events webhook.
- [ ] `/terms` contains subscription, renewal, cancellation and refund terms, reviewed by a lawyer; draft notices removed only after review.
- [ ] `/privacy` names Stripe as a payment processor.
- [ ] `/how-we-make-money` describes the live revenue streams.
- [ ] One real live purchase made with your own card, then refunded and cancelled. Confirm receipt, portal, cancellation and refund emails.
- [ ] `/admin` shows every billing item as configured and "Live mode".
- [ ] Support process for "restore Premium on a new device" written down (section 8.1).
- [ ] Someone checks the billing events channel at least daily.

---

## 12. Sponsorships and partnerships

### 12.1 Packages

| Package | What the sponsor gets | Rules |
| --- | --- | --- |
| Sponsored collection | A curated collection page (for example "Asian weeknight pantry") with recipes that use the sponsor's product category, labelled "In partnership with {brand}" | Recipes meet normal quality rules; NourishWell keeps editorial control; no health claims about the product |
| Newsletter sponsorship | One clearly labelled sponsor block in the weekly email | "Sponsored" label; one sponsor per email; bottom or clearly separated position |
| Brand partnership | A custom project (for example a recipe series or a seasonal planner) | Written agreement covering labelling, editorial control, approval limits and duration |

Not available to sponsors: health-condition pages, health guides, review outcomes, the directory's verification status, user data, targeting by health interest, or third-party tracking pixels.

Excluded categories: weight-loss guarantees, detox and cleanse products, unproven supplements, products claiming to treat or cure disease, alcohol, tobacco and vaping, gambling, and foods with poor nutritional profiles marketed to children.

### 12.2 Rate card structure (you fill in the prices)

Do not publish audience numbers you do not have. The media kit gives current numbers on request, taken directly from Plausible, your email provider and Search Console on the date you send it.

| Package | Deliverables | Duration | Price (USD) | Price (GBP) | Notes |
| --- | --- | --- | --- | --- | --- |
| Sponsored collection | Collection page, {n} recipes, labelled placement on `/discover` | {n} weeks | | | |
| Newsletter sponsorship: single | One sponsor block | One send | | | |
| Newsletter sponsorship: series | One block per send | {n} sends | | | |
| Brand partnership | Scoped per project | Agreed | | | Quote individually |

Media kit contents: what NourishWell is, the audience profile (described, not invented), current numbers with their source and date, formats, rules (section 12.1), and contact details.

### 12.3 Affiliate links (later)

Only add affiliate links when you have chosen programmes and written their disclosure. Use `rel="sponsored noopener"`, a short disclosure near the first link on each page, and the site-wide note on `/how-we-make-money`. Never on health-condition pages.

---

## 13. Refund and cancellation policy template

**Draft. Have a lawyer review this for each market before publishing.** Consumer law differs by country and state, and some rules (for example cooling-off periods for digital services in the UK and EU, and automatic-renewal laws in US states such as California) may require different wording or terms.

> **Subscriptions, cancellation and refunds**
>
> **Renewal.** NourishWell Premium renews automatically at the end of each billing period (monthly or yearly) at the price shown at checkout, until you cancel. We will tell you in advance about any price change, and you can cancel before it applies.
>
> **Free trial.** If your plan includes a free trial, you will not be charged until the trial ends. We will remind you before it ends. Cancel before the end of the trial and you will not be charged.
>
> **How to cancel.** Go to Account → Billing → Manage billing and choose Cancel. You can also contact us at {support email}. Cancellation takes effect at the end of the period you have paid for, and you keep Premium until then.
>
> **Refunds.** {Choose one, with legal advice: (a) "If you are not happy, contact us within {n} days of a payment and we will refund that payment in full." or (b) "Payments are not refundable except where required by law or where we have made an error."} If you are in the UK or EU, you may have a legal right to cancel within 14 days of first subscribing; {describe how this applies, as advised by your lawyer}.
>
> **Featured listings.** Featured listings renew monthly until cancelled. Cancel at any time from the link in your receipt email or by contacting us; the listing stays featured until the end of the paid month. If we remove a listing because it no longer meets our verification standards, we will refund {policy}.
>
> **Device access.** Until accounts launch, Premium works in the browser where you subscribed. If you need it on another device, contact us.
>
> **Contact.** {support email}, {business name and address}.

---

## 14. Revenue KPIs

Use Stripe's Billing reports for most of these, but check Stripe's definitions against the ones below before comparing periods.

| KPI | Formula | Notes |
| --- | --- | --- |
| MRR (monthly recurring revenue) | sum over active paid subscriptions of monthly-normalised price (yearly price / 12), after discounts, excluding tax | Exclude trials. Report Premium and featured listings separately |
| Net new MRR | new MRR + expansion MRR − contraction MRR − churned MRR | Expansion: monthly to yearly upgrades show as a change in normalised value |
| Visitor-to-paid conversion | new paid subscriptions in period / unique visitors in period | Plausible visitors are consenting visitors only, so this overstates conversion; use it for trends |
| Pricing-page conversion | `subscription_started` / visitors with `pricing_view` | Plausible |
| Checkout completion | completed Checkout Sessions / Checkout Sessions created | Stripe |
| Trial-to-paid conversion | trials that become paid / trials that ended in period | Only if you offer a trial |
| Customer churn (monthly) | subscriptions cancelled or ended in month / paying subscriptions at start of month | Count yearly subscribers in the month their subscription ends |
| Revenue churn (monthly) | MRR lost to cancellations and downgrades in month / MRR at start of month | |
| ARPU (average revenue per paying user) | MRR / number of paying subscribers | Per product |
| LTV (lifetime value), simple | ARPU × gross margin % / monthly customer churn | Gross margin after payment and tax fees. Unreliable until you have several months of churn data |
| Failed-payment recovery | failed invoices later paid / failed invoices | Stripe |
| Refund rate | refunded amount / gross revenue | Stripe |
| Featured listing revenue | sum of listing subscription revenue in period | Separate line |
| Sponsorship revenue | invoiced sponsorship revenue in period | Track in your accounts, not Stripe if invoiced elsewhere |

Set targets only after two or three months of data. Do not publish revenue figures on the site.

---

## 15. Pricing research

Retrieved on **13 October 2026** using web search. The vendor and app-store pages could not be opened directly from the environment used to prepare this document, so each figure below comes from the search result for the cited page. Treat every figure as **to be verified** by opening the page yourself before you rely on it. Prices change often and differ by country and by app store versus website.

### 15.1 Comparable products

| Product | Model | USD (as found) | GBP (as found) | Sources and notes |
| --- | --- | --- | --- | --- |
| Mealime Pro | Subscription | $5.99/month in 2026 reviews; an App Store listing showed $2.99/month (may be outdated); one article cites about $50/year | Not verified | [iPhone Life review](https://iphonelife.com/content/mealime-pro-review-perfect-recipe-app-busy-professionals); [My Subscription Addiction](https://www.mysubscriptionaddiction.com/b/mealime); [US App Store listing](https://apps.apple.com/US/app/id1079999103); [Tools and Toys](https://toolsandtoys.net/mealime-meal-planning-app/) (yearly figure, date unclear). Sources conflict; check in the app |
| Eat This Much Premium | Subscription | Company help centre: $5/month billed annually, or $9 month-to-month, 14-day trial, 30-day refund guarantee (may be older). A 2026 third-party review: about $5/month annually or $14.99 monthly. US App Store in-app purchases range from $8.99 to $84.99, including $14.99 and $59.99 | Not verified | [Eat This Much help centre](https://eatthismuch.groovehq.com/knowledge_base/categories/subscription-management/topics); [ProMealPlan review 2026](https://www.promealplan.com/en/blog/eat-this-much-review-2026); [US App Store listing](https://apps.apple.com/us/app/eat-this-much-meal-planner/id981637806) |
| Plan to Eat | Subscription | $49/year or $5.95/month on the website; $54.99/year through the Apple App Store | Not verified | [Plan to Eat help: how much does it cost](https://learn.plantoeat.com/help/how-much-does-plan-to-eat-cost) |
| PlateJoy | Subscription | $12.99 for 1 month, $69 for 6 months, $99 for 12 months; 10-day free trial | Not verified | [Healthline](https://www.healthline.com/nutrition/platejoy); [Garage Gym Reviews](https://www.garagegymreviews.com/?p=164095). Current availability and prices not confirmed |
| Paprika Recipe Manager 3 | One-time purchase per platform | iOS $4.99; Mac $29.99; Windows $29.99 (official site, "local pricing and tax can vary"); Android not verified | Not verified | [Paprika for Windows](https://paprikaapp.com/windows/); [App price tracker (iOS)](https://apppricinglab.com/app/apple/1303222868). A recipe manager rather than a meal planner; included as a one-time-price reference |
| Samsung Food+ | Subscription | $6.99/month (US launch announcement); about $59.99/year in later reviews | £6.99/month or £58.99/year **at launch (September 2024)**; current price not verified | [Samsung UK newsroom](https://news.samsung.com/uk/upgraded-samsung-food-raises-the-bar-for-food-experiences-at-ifa-2024); [Samsung US newsroom](https://news.samsung.com/us/upgraded-samsung-food-raises-bar-for-food-experiences-ifa-2024/) |

Summary of what was found (unverified): subscription meal planners cluster at roughly US$6 to US$15 a month on monthly billing and roughly US$49 to US$99 a year on annual billing (about US$4 to US$8 a month). The only sterling figure found was Samsung Food+ at launch (£6.99 a month, £58.99 a year). No current GBP prices could be verified for the others.

### 15.2 Recommendation (for the owner to decide; not a site price)

This is a recommendation to help you choose. It is not a price the site will show. The site only ever shows the Prices you create in Stripe.

**Suggested launch range:**

| Currency | Monthly | Yearly |
| --- | --- | --- |
| USD | US$3.99 to US$5.99 | US$29.99 to US$49.99 |
| GBP (including VAT) | £3.49 to £4.99 | £24.99 to £39.99 |
| Asian currencies | Set local price points; consider lower amounts where purchasing power is lower (for example INR) | Same principle |

**Reasoning:**

1. **Start below the established apps.** The comparables have years of features, mobile apps and large recipe libraries. NourishWell Premium at launch adds more saved plans and export, on the web, on one device, with 51 recipes. That justifies the lower end of the market range, not the middle.
2. **The per-device limitation lowers perceived value** until accounts launch. A lower price and a clear FAQ reduce refund requests and complaints.
3. **Make yearly the better deal.** Comparables discount annual plans heavily (for example Eat This Much and Plan to Eat). A yearly price of roughly 7 to 9 times the monthly price is a common pattern; it also reduces the share of each payment lost to per-transaction card fees, which weigh more heavily on small monthly charges. Check Stripe's fees for your country.
4. **Consider a trial only once Premium has enough to try.** With the current feature set, a short trial (7 days) or none is reasonable. A long trial mostly delays revenue and adds failed-renewal handling.
5. **Plan the next step up.** When accounts, cross-device sync and household planning ship, Premium is closer to the comparables and a higher price is easier to justify. Keep existing subscribers on their price for a stated period when you raise it, and give the notice the law requires.
6. **Do not anchor on fake discounts.** Show only the real yearly saving the site calculates from your prices.

**Featured listings:** none of the products above is a comparable for directory listings, and no listing prices were researched. Start by talking to a few verified businesses about what a featured placement is worth to them, set a monthly Price, and review after three months against enquiries they receive.
