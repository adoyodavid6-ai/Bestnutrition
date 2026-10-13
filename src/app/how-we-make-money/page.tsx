import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "How We Make Money",
  description: "How NourishWell is funded: optional Premium subscriptions, verified business listings and clearly labelled partnerships. What we never do with your data or our editorial content.",
  alternates: { canonical: "/how-we-make-money" },
};

export default function HowWeMakeMoneyPage() {
  return (
    <InfoPage
      path="/how-we-make-money"
      eyebrow="Transparency"
      title="How we make money"
      lede="NourishWell is free to use. These are the ways we earn money to keep it that way — and the lines we don't cross."
      updated="2026-10-13"
    >
      <h2>Where our money comes from</h2>
      <ol>
        <li>
          <strong>Premium subscriptions.</strong> Optional extras for busy households, such as more saved meal plans and exports. See <Link href="/pricing">Free &amp; Premium</Link>. Health information is never part
          of Premium.
        </li>
        <li>
          <strong>Directory listings.</strong> Verified professionals and businesses can list for free; a featured listing is a paid upgrade, available only after verification and always labelled “Promoted”. See{" "}
          <Link href="/for-businesses">for businesses</Link>.
        </li>
        <li>
          <strong>Printable resources.</strong> Original one-time purchases such as the <Link href="/resources">meal-planning workbook</Link>. They&apos;re optional extras; everything on the website stays free.
        </li>
        <li>
          <strong>Workplace programmes.</strong> Quoted workshops and group access for organisations, with aggregate-only reporting. See <Link href="/for-organisations">for workplaces</Link>.
        </li>
        <li>
          <strong>Sponsorships and partnerships.</strong> Labelled sponsored collections, newsletter sponsor slots and brand partnerships. See <Link href="/advertise">advertise with us</Link>.
        </li>
        <li>
          <strong>Affiliate links (if and when we use them).</strong> If we link to a product and may earn a commission, the link is labelled at the point you see it, and that commission never affects what we
          recommend. We don&apos;t use affiliate links in health-condition or supplement guidance.
        </li>
      </ol>

      <h2>Labels you&apos;ll see</h2>
      <ul>
        <li>
          <strong>Promoted</strong> — a paid placement in the professional or business directory.
        </li>
        <li>
          <strong>Sponsored by …</strong> — content paid for by a brand. Our editors create it and the nutrition is calculated the usual way.
        </li>
        <li>
          <strong>Partner</strong> — content created together with a partner organisation.
        </li>
        <li>
          <strong>Affiliate link</strong> — we may earn a commission if you buy.
        </li>
      </ul>

      <h2>What we never do</h2>
      <ul>
        <li>Sell or share your personal information, or use health information for advertising.</li>
        <li>Load third-party advertising or tracking pixels. Analytics are anonymous and only run if you allow them.</li>
        <li>Let money buy verification, reviews, ratings or editorial coverage.</li>
        <li>Put health-condition guides, nutrition education or basic meal planning behind a paywall.</li>
      </ul>

      <h2>How we measure marketing</h2>
      <p>
        When you arrive from one of our own links (for example a newsletter or a social post), the campaign name is stored in your browser. It is sent to us only if you then subscribe, apply for a listing or start a
        Premium checkout, so we can tell which campaigns are useful. It never includes what you read. Details are in our <Link href="/privacy">privacy policy</Link>.
      </p>
      <p>
        Questions? <Link href="/contact">Contact us</Link>.
      </p>
    </InfoPage>
  );
}
