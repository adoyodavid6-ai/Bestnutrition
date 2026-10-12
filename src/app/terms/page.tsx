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
      <h2>Paid services</h2>
      <p>Paid Premium plans and paid listings are not yet available. Pricing, renewal, cancellation and refund terms will be published before any payment is taken.</p>
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
