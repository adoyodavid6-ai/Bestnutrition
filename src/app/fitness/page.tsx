import type { Metadata } from "next";
import Link from "next/link";
import { FITNESS_CATEGORIES, fitnessGuides } from "@/content/fitness";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Fitness & Wellness",
  description: "Beginner-friendly walking plans, home strength workouts, mobility routines, sleep, stress and habit guides — with modifications and safety notes.",
  alternates: { canonical: "/fitness" },
};

export default function FitnessIndex() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/fitness", label: "Fitness & wellness" }]} />
      <PageHead
        eyebrow="Move, rest, recover"
        title="Fitness & wellness for every body"
        lede="Practical routines with clear audiences, durations, equipment, modifications and safety notes. No single routine suits everyone — choose what fits your body and your day."
      >
        <div className="row" style={{ marginTop: 20 }}>
          <Link href="/wellness" className="btn btn-secondary btn-sm">
            Wellness tools &amp; lifestyle
          </Link>
        </div>
      </PageHead>
      <div className="container" style={{ paddingBottom: 48 }}>
        {FITNESS_CATEGORIES.map((cat) => {
          const items = fitnessGuides.filter((g) => g.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat} className="section-tight" aria-labelledby={`fc-${cat}`}>
              <h2 id={`fc-${cat}`} style={{ fontSize: "var(--fs-xl)" }}>
                {cat}
              </h2>
              <div className="grid grid-3">
                {items.map((g) => (
                  <Link key={g.slug} href={`/fitness/${g.slug}`} className="card card-link">
                    <div className="row xs muted" style={{ marginBottom: 8 }}>
                      <span className="chip chip-outline">{g.difficulty}</span>
                      <span className="row" style={{ gap: 4 }}>
                        <Icon name="clock" size={14} /> {g.durationMin} min
                      </span>
                    </div>
                    <h3 className="serif" style={{ fontWeight: 500, fontSize: "1.25rem" }}>
                      {g.title}
                    </h3>
                    <p className="small muted">{g.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
