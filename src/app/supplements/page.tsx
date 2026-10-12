import type { Metadata } from "next";
import Link from "next/link";
import { supplements } from "@/content/supplements";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";

export const metadata: Metadata = {
  title: "Supplement Knowledge Centre",
  description: "Independent, evidence-graded guides to vitamins, minerals, omega-3, probiotics, protein powders and more — including risks, interactions and safety limits.",
  alternates: { canonical: "/supplements" },
};

const strengthClass = { Strong: "chip-success", Moderate: "chip-violet", Limited: "chip-warning", Mixed: "chip-warning" } as const;

export default function SupplementsIndex() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/supplements", label: "Supplements" }]} />
      <PageHead
        eyebrow="Supplement knowledge centre"
        title="Supplements, without the sales pitch"
        lede="What each supplement does, who might benefit, how strong the evidence is, and the risks and interactions to know. We don't sell supplements and we never promote cures, detoxes or guaranteed weight loss."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="callout callout-info" style={{ marginBottom: 32 }}>
          <span className="callout-title">Food first</span>
          <p className="small">
            Most people can meet their needs through a varied diet. Supplements are useful for specific groups and deficiencies. Higher doses aren&apos;t better and can be harmful. Talk to a pharmacist or
            doctor before starting a supplement, especially if you take medicine, are pregnant, or have a long-term condition.
          </p>
        </div>
        <div className="grid grid-3">
          {supplements.map((s) => (
            <Link key={s.slug} href={`/supplements/${s.slug}`} className="card card-link">
              <div className="spread" style={{ marginBottom: 10 }}>
                <span className="eyebrow" style={{ margin: 0 }}>
                  {s.type}
                </span>
                <span className={`chip ${strengthClass[s.evidence.strength]}`}>Evidence: {s.evidence.strength.toLowerCase()}</span>
              </div>
              <h2 className="serif" style={{ fontWeight: 500, fontSize: "1.3rem" }}>
                {s.name}
              </h2>
              <p className="small muted">{s.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
