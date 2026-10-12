import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "What NourishWell stores, where, and the choices you have.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <InfoPage path="/privacy" eyebrow="Privacy" title="Privacy policy" updated="2026-10-01" draftNotice lede="We collect as little as possible, and we treat anything related to health as sensitive.">
      <h2>Data stored on your device</h2>
      <p>
        Saved recipes and guides, meal plans, shopping lists (including any prices you enter), preferences, habit-tracker ticks and recently viewed recipes are stored in your browser&apos;s local storage.
        This data is not sent to our servers. You can export or delete it at any time from <Link href="/account">Account &amp; preferences</Link>, or by clearing your browser data.
      </p>
      <p>We do not record health-condition pages in your recently viewed history.</p>

      <h2>Information you send us</h2>
      <ul>
        <li>
          <strong>Newsletter:</strong> your email address and consent, used only to send the newsletter. You can unsubscribe at any time.
        </li>
        <li>
          <strong>Contact form:</strong> your name, email, topic and message, used to respond to you.
        </li>
        <li>
          <strong>Listing applications:</strong> the professional or business details you provide, used to verify and publish a listing.
        </li>
      </ul>
      <p>These forms are delivered to our team through a secure integration configured by NourishWell. If a form is not connected, it tells you so and nothing is stored.</p>
      <p>Please don&apos;t send us personal medical information. We can&apos;t provide individual medical advice.</p>

      <h2 id="analytics">Analytics</h2>
      <p>
        With your permission only, we may count anonymous product events — such as a recipe being viewed, a search being made (not the search words), or a meal plan being created — to understand what
        is useful. We never send health-condition interests, form contents or personal identifiers to analytics, and never to advertising platforms. You can change your choice in{" "}
        <Link href="/account">Account &amp; preferences</Link>.
      </p>

      <h2>Cookies and storage</h2>
      <p>We use browser storage that is essential for the features you use. We don&apos;t use advertising cookies.</p>

      <h2>Future accounts</h2>
      <p>
        When online accounts launch, account data will be stored with a managed database provider with access controls. We&apos;ll update this policy before that happens and ask for consent where
        required.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete or port your data, and to object to certain processing. Contact us through the{" "}
        <Link href="/contact?topic=privacy">contact form</Link> (choose &ldquo;Privacy or data request&rdquo;).
      </p>
    </InfoPage>
  );
}
