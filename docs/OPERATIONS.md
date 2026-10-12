# Operations

## Clinical review workflow

Statuses: **Draft → In review → Approved → Published**, plus **Needs update** and **Archived**.

1. **Recruit qualified reviewers.** Registered dietitians, and relevant clinicians for specialised topics (nephrology, endocrinology, obstetrics, oncology). Record each reviewer's name, credential and registration.
2. **Review.** For each guide flagged "Awaiting qualified professional review" in `/admin`, the reviewer:
   - checks claims against the cited sources;
   - confirms that "cannot do", warning signs and medication cautions are correct for the target markets;
   - approves or requests changes.
3. **Record the outcome.** On approval, set `review.reviewer = { name, credential }`, `review.lastReviewed`, and `status: "published"`. The page then shows "Reviewed by …" automatically.
4. **Re-review.** Do this every 12 months, or immediately when a guideline changes. `/admin` flags items older than 12 months.

**Priority order for review:** the specialised conditions first (CKD, type 1, type 2, gestational diabetes, pregnancy, cancer treatment, coeliac disease), then the remaining conditions, then supplements, then nutrition and fitness guides.

## Professional and business verification

1. Applications arrive at `LISTINGS_WEBHOOK_URL`.
2. **Professionals:** look up the registration number on the issuing body's public register (for example the Kenya Nutritionists and Dieticians Institute, the UK HCPC, or the relevant national regulator). Confirm the name matches and the registration is current.
3. **Businesses:** check business registration where available, the website, and the services offered. Reject health-cure claims, detox or miracle products, and fabricated reviews.
4. Record the verifier and date (`professional_credentials.verified_by` / `verified_at`). Publish with `verification = 'verified'`.
5. Re-verify every year. Suspend immediately on a credible report.
6. **Promoted (paid) placements** are always labelled "Promoted" and never affect verification.

## Corrections and reports

- Correction reports arrive through the contact form (topic: correction).
- Acknowledge within 5 working days. Fix factual errors promptly.
- For significant changes, add a public correction note (`content_revisions.is_correction`).

## Data requests

- Today, personal data is on-device: direct users to Export and Delete on `/account`.
- After accounts launch, handle access and deletion requests within the legal deadline for each market. Removing a `profiles` row cascades to the user's data.

## Payments (future)

Before enabling payments:

- Choose a provider available in the target markets (for example Stripe, Paystack or Flutterwave; consider M-Pesa for Kenya).
- Configure prices per currency in `plan_prices`.
- Write subscription state **only** from verified provider webhooks.
- Test checkout, renewal, failed payment, cancellation and refund end to end in sandbox.
- Publish renewal and cancellation terms on `/pricing` and `/terms`.
