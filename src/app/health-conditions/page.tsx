import type { Metadata } from "next";
import Link from "next/link";
import { CONDITION_GROUPS, conditions } from "@/content/conditions";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalNotice, PageHead } from "@/components/Editorial";

export const metadata: Metadata = {
  title: "Health Conditions & Nutrition Guides",
  description: "Medically responsible guides to how nutrition relates to blood pressure, cholesterol, diabetes, digestive health, kidney and liver conditions, pregnancy and more.",
  alternates: { canonical: "/health-conditions" },
};

export default function ConditionsIndex() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/health-conditions", label: "Health conditions" }]} />
      <PageHead
        eyebrow="Evidence-informed guides"
        title="Nutrition and health conditions"
        lede="Every guide explains what nutrition can reasonably contribute, what it cannot do, the strength of the evidence, warning signs and when to see a clinician. No food or supplement cures disease."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <MedicalNotice />
        {CONDITION_GROUPS.map((g) => (
          <section key={g} className="section-tight" aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} style={{ fontSize: "var(--fs-xl)" }}>
              {g}
            </h2>
            <div className="grid grid-3">
              {conditions
                .filter((c) => c.group === g)
                .map((c) => (
                  <Link key={c.slug} href={`/health-conditions/${c.slug}`} className="card card-link">
                    {c.specialized && <span className="chip chip-warning" style={{ marginBottom: 10 }}>Clinical supervision needed</span>}
                    <h3 className="serif" style={{ fontWeight: 500, fontSize: "1.25rem" }}>
                      {c.title}
                    </h3>
                    <p className="small muted">{c.summary}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
