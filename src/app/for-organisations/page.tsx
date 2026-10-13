import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "For Workplaces & Organisations",
  description: "Practical nutrition education and meal-planning tools for teams, schools and community groups — no clinical promises and no collection of employee health data.",
  alternates: { canonical: "/for-organisations" },
};

const OFFERS = [
  { t: "Practical workshops", d: "Live or recorded sessions such as planning a week of meals, reading food labels, or batch cooking on a budget — delivered with qualified professionals where the topic needs one." },
  { t: "Group Premium access", d: "Premium planning tools for a team or membership, paid by the organisation. Available once Premium is open to the public." },
  { t: "Custom resources", d: "Printable planners and recipe collections adapted to your canteen, region or community, using the same editorial and nutrition standards as the website." },
];

export default function ForOrganisationsPage() {
  return (
    <InfoPage
      path="/for-organisations"
      eyebrow="Workplaces & organisations"
      title="Healthy eating, made practical for your people"
      lede="Help your team, members or students plan and cook better everyday meals — with education that respects their privacy and doesn't overpromise."
      updated="2026-10-13"
    >
      <h2>What we can offer</h2>
      <div className="grid grid-3" style={{ gap: 16, margin: "16px 0 24px" }}>
        {OFFERS.map((o) => (
          <div key={o.t} className="card">
            <h3 style={{ fontSize: "var(--fs-lg)" }}>{o.t}</h3>
            <p className="small" style={{ marginBottom: 0 }}>
              {o.d}
            </p>
          </div>
        ))}
      </div>
      <p>Packages are scoped and quoted for each organisation, so there&apos;s no price list. We&apos;ll tell you plainly what we can deliver well and what we can&apos;t.</p>

      <h2>Our ground rules</h2>
      <ul>
        <li>No promises of clinical, weight or productivity outcomes.</li>
        <li>We don&apos;t collect employees&apos; or members&apos; health information, and we never share individual usage with an employer.</li>
        <li>Any reporting is aggregate only — for example, how many people attended a session.</li>
        <li>Clinical topics are taught by appropriately qualified professionals, or not at all.</li>
      </ul>

      <div className="cta-band" style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Tell us what you need</h2>
        <p style={{ marginBottom: 16 }}>Share your organisation, the size of the group and what you&apos;d like to achieve. We reply within five working days.</p>
        <Link href="/contact?topic=workplace" className="btn btn-light">
          Make an enquiry
        </Link>
      </div>
    </InfoPage>
  );
}
