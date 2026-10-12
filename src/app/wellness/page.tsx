import type { Metadata } from "next";
import Link from "next/link";
import { fitnessGuides } from "@/content/fitness";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { HabitTracker } from "@/components/HabitTracker";

export const metadata: Metadata = {
  title: "Wellness & Lifestyle",
  description: "Sleep, stress, hydration, meal prep and habit-building guides, plus a simple habit tracker that stays on your device.",
  alternates: { canonical: "/wellness" },
};

export default function WellnessPage() {
  const lifestyle = fitnessGuides.filter((g) => g.category === "Lifestyle" || g.category === "Recovery");
  return (
    <>
      <Breadcrumbs items={[{ href: "/fitness", label: "Fitness & wellness" }, { href: "/wellness", label: "Wellness" }]} />
      <PageHead eyebrow="Everyday wellbeing" title="Small habits, steady progress" lede="Sleep, stress, hydration and routines matter as much as what's on your plate. Start with one small change." />
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="grid grid-3">
          {lifestyle.map((g) => (
            <Link key={g.slug} href={`/fitness/${g.slug}`} className="card card-link">
              <span className="eyebrow">{g.category}</span>
              <h2 className="serif" style={{ fontWeight: 500, fontSize: "1.25rem" }}>
                {g.title}
              </h2>
              <p className="small muted">{g.summary}</p>
            </Link>
          ))}
        </div>
        <section className="section" aria-labelledby="habit-heading">
          <div className="feature-split">
            <div>
              <span className="eyebrow">Tool</span>
              <h2 id="habit-heading">Weekly habit tracker</h2>
              <p className="muted">Pick up to three small habits and tick them off each day. Your ticks stay on this device and reset when you start a new week.</p>
              <p className="small muted">
                Coming in future releases: walking planner, sleep routine planner, hydration reminders and a wellness journal. We&apos;ll only add reminders you opt in to.
              </p>
            </div>
            <HabitTracker />
          </div>
        </section>
      </div>
    </>
  );
}
