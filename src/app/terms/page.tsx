import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Terms of Use", description: "The terms for using NourishWell.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <InfoPage path="/terms" eyebrow="Legal" title="Terms of use" updated="2026-10-01" draftNotice>
      <h2>Using NourishWell</h2>
      <p>
        NourishWell provides recipes, nutrition education and planning tools for personal, non-commercial use. By using the site you agree to these terms and to our{" "}
        <Link href="/medical-disclaimer">medical disclaimer</Link>.
      </p>
      <h2>No medical advice</h2>
      <p>Our content is general information and does not create a clinician–patient relationship.</p>
      <h2>Your content</h2>
      <p>Plans, lists and preferences you create belong to you. On this version of the site they remain on your device.</p>
      <h2>Listings</h2>
      <p>
        Professionals and businesses who apply for listings must provide accurate information and consent to verification. We may decline, suspend or remove listings that are inaccurate, unverifiable or
        that make prohibited health claims. Promoted listings are labelled.
      </p>
      <h2 id="subscriptions">Paid services</h2>
      <p>
        <strong>Premium.</strong> Premium is an optional subscription. The price, currency, any taxes and the billing period (monthly or yearly) are shown before you pay. It renews automatically at the end of each
        period until you cancel. If a free trial is offered, you won&apos;t be charged until it ends, and you can cancel before then at no cost.
      </p>
      <p>
        <strong>Cancelling.</strong> You can cancel at any time from Account → Billing → Manage billing, or from the link in any receipt. Cancelling stops future renewals; you keep Premium until the end of the
        period you&apos;ve paid for. We&apos;ll tell you in advance, by email, about any price change, and it will apply only from your next renewal.
      </p>
      <p>
        <strong>Refunds.</strong> If something has gone wrong with a payment, contact us and we&apos;ll put it right. Where the law in your country gives you a right to cancel and get a refund (for example a
        cooling-off period), that right applies in full.
      </p>
      <p>
        <strong>Featured listings.</strong> Featured listings are offered only to verified listings, renew monthly until cancelled, and revert to a basic listing at the end of the paid period. Payment never affects
        verification or editorial decisions, and we may end a featured listing that breaks our listing standards, refunding any unused period.
      </p>
      <p>Payments are processed by Stripe. Premium is currently linked to the browser you subscribed in until accounts launch; contact us to move it to another device.</p>
      <h2>Intellectual property</h2>
      <p>Site content is owned by NourishWell or its licensors. You may print or share recipes for personal use with a link back to the original page.</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, NourishWell is not liable for decisions made based on general information on the site. Always check allergens and food safety for your situation.</p>
      <h2>Contact</h2>
      <p>
        Questions about these terms: <Link href="/contact">contact us</Link>.
      </p>
    </InfoPage>
  );
}
