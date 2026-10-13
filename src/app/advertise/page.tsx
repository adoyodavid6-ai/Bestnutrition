import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Advertise & Partner with NourishWell",
  description: "Sponsored recipe collections, newsletter sponsorship and brand partnerships with NourishWell — clearly labelled, editorially independent and never targeted by health condition.",
  alternates: { canonical: "/advertise" },
};

const FORMATS = [
  { t: "Sponsored recipe collection", d: "A themed collection of NourishWell-developed recipes that feature your product category, labelled “Sponsored by”. Recipes are tested and calculated exactly like every other recipe; you don't approve nutrition figures." },
  { t: "Newsletter sponsorship", d: "A clearly marked sponsor slot in the weekly email, with one image, a short message and a link. Never sent to segments based on health interests." },
  { t: "Brand partnership", d: "Co-created content such as a seasonal cooking guide or a budget-shopping series, planned with our editors and labelled as a partnership." },
  { t: "Featured directory listing", d: "For verified dietitians, nutritionists, clinics, gyms and healthy meal providers: priority placement labelled “Promoted”.", href: "/for-businesses" },
];

export default function AdvertisePage() {
  return (
    <InfoPage
      path="/advertise"
      eyebrow="Partnerships"
      title="Advertise & partner with us"
      lede="Reach people who are actively planning what to cook and shop for each week — with partnerships that are clearly labelled and never compromise our editorial standards."
      updated="2026-10-13"
    >
      <h2>Ways to work with us</h2>
      <div className="grid grid-2" style={{ gap: 16, margin: "16px 0 24px" }}>
        {FORMATS.map((f) => (
          <div key={f.t} className="card">
            <h3 style={{ fontSize: "var(--fs-lg)" }}>{f.t}</h3>
            <p className="small" style={{ marginBottom: f.href ? 8 : 0 }}>
              {f.d}
            </p>
            {f.href && (
              <Link href={f.href} className="link-arrow small">
                Listing details
              </Link>
            )}
          </div>
        ))}
      </div>

      <h2>Audience and results</h2>
      <p>
        We don&apos;t publish audience estimates. Current, verified figures — monthly visitors, newsletter subscribers, open rates and audience regions — are shared in our media kit on request, with the date they were
        measured. After a campaign we report the results we can actually measure, such as clicks from labelled placements.
      </p>

      <h2>Our standards</h2>
      <ul>
        <li>Every paid placement is labelled “Sponsored”, “Partner” or “Promoted” where it appears, and links are marked as sponsored for search engines.</li>
        <li>Sponsors never write, review or approve health guidance, nutrition calculations, condition guides or recipe ratings.</li>
        <li>We never target or sell audiences based on health conditions, symptoms or other sensitive information, and we don&apos;t use advertising pixels.</li>
        <li>Our editors can decline or end any partnership that conflicts with our <Link href="/editorial-policy">editorial policy</Link>.</li>
      </ul>

      <h2>What we don&apos;t accept</h2>
      <ul>
        <li>Products or claims to cure, reverse or prevent disease, or “detox” and guaranteed weight-loss products.</li>
        <li>Supplements making claims beyond what the evidence and the law allow.</li>
        <li>Alcohol, tobacco, vaping, gambling or diet products aimed at children.</li>
        <li>Fabricated reviews, testimonials or before-and-after images.</li>
      </ul>

      <div className="cta-band" style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Request the media kit</h2>
        <p style={{ marginBottom: 16 }}>Tell us about your brand and what you&apos;d like to achieve. We reply within five working days.</p>
        <Link href="/contact?topic=partnership" className="btn btn-light">
          Contact our partnerships team
        </Link>
      </div>
    </InfoPage>
  );
}
