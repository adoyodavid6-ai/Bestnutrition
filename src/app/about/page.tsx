import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "About NourishWell", description: "Why we built NourishWell and the principles behind it.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <InfoPage path="/about" eyebrow="About" title="About NourishWell" lede="Eat Better. Feel Stronger. Live Well. — a global nutrition platform that starts in real kitchens, with real budgets.">
      <h2>Why we exist</h2>
      <p>
        Most nutrition websites are either beautiful but vague, or detailed but impossible to use. Many assume that healthy eating means expensive or unfamiliar food. We think good food starts with the
        dishes people already love — a pot of chili, a cottage pie, a bowl of dal or a teriyaki rice bowl — made a little lighter, with honest, practical guidance.
      </p>
      <h2>What makes us different</h2>
      <ul>
        <li>
          <strong>Food people actually cook.</strong> American, British and Asian favourites lead the library, alongside East African, Mediterranean, Middle Eastern and Latin American recipes, with
          familiar ingredient names, US and metric measurements, and affordable substitutions.
        </li>
        <li>
          <strong>Practical meal planning.</strong> Plans reuse ingredients across the week, respect your time and budget, and turn into one consolidated shopping list.
        </li>
        <li>
          <strong>Medically responsible guidance.</strong> Every condition guide explains what nutrition cannot do, the evidence and its limits, warning signs and when to see a clinician.
        </li>
        <li>
          <strong>Transparent nutrition.</strong> Every figure is an estimate you can trace to its ingredients and reference data. We show what is estimated, what is a proxy and what has not been verified.
        </li>
      </ul>
      <h2>How we&apos;re funded</h2>
      <p>
        The core platform is free. We plan to fund it through optional Premium planning features and clearly labelled business listings. We will never sell health data or target advertising based on
        health interests. See <Link href="/pricing">plans</Link> and our <Link href="/editorial-policy">editorial policy</Link>.
      </p>
      <h2>Get in touch</h2>
      <p>
        Questions, corrections or partnership ideas: <Link href="/contact">contact us</Link>.
      </p>
    </InfoPage>
  );
}
