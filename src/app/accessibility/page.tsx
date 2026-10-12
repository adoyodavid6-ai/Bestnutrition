import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Accessibility", description: "Our approach to accessibility and how to report a barrier.", alternates: { canonical: "/accessibility" } };

export default function AccessibilityPage() {
  return (
    <InfoPage path="/accessibility" eyebrow="Accessibility" title="Accessibility statement" updated="2026-10-01">
      <p>We want NourishWell to be usable by everyone, including people who use screen readers, keyboard navigation, magnification or voice control.</p>
      <h2>What we&apos;ve built in</h2>
      <ul>
        <li>Semantic headings, landmarks and a skip-to-content link.</li>
        <li>Visible focus indicators and full keyboard operation of menus, filters, the planner and shopping list.</li>
        <li>Text alternatives for illustrations; decorative images are hidden from assistive technology.</li>
        <li>Form fields with labels, hints and error messages linked to the field.</li>
        <li>Colour contrast designed to meet WCAG 2.2 AA for text, and support for reduced-motion preferences.</li>
        <li>Print-friendly recipes, meal plans and shopping lists.</li>
      </ul>
      <h2>Known limitations</h2>
      <ul>
        <li>We have not yet completed an independent accessibility audit. We&apos;ll publish the results when we do.</li>
        <li>Some data tables (such as nutrition breakdowns) are wide and scroll horizontally on small screens.</li>
      </ul>
      <h2>Report a barrier</h2>
      <p>
        If something doesn&apos;t work for you, please <Link href="/contact?topic=accessibility">tell us</Link>. Include the page and what you were trying to do.
      </p>
    </InfoPage>
  );
}
