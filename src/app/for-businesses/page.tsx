import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ListingForm } from "@/components/forms/ListingForm";

export const metadata: Metadata = {
  title: "For Professionals & Businesses",
  description: "Reach people who want to eat well. Apply for a verified NourishWell listing as a dietitian, nutritionist, healthy meal provider, gym or wellness business.",
  alternates: { canonical: "/for-businesses" },
};

export default function ForBusinessesPage() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/for-businesses", label: "For businesses" }]} />
      <PageHead
        eyebrow="For professionals & businesses"
        title="Reach people who want to eat well"
        lede="NourishWell readers come to plan meals, learn and find trustworthy support. A verified listing puts your practice or business in front of them — with clear labelling and no pay-to-be-trusted shortcuts."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="grid grid-3">
          {[
            { t: "Verified profile", d: "Your credentials or business details are checked and displayed with a verification date — a signal readers can trust." },
            { t: "Lead generation", d: "Readers can request appointments or contact you directly from your profile and from relevant guides." },
            { t: "Premium listings (coming)", d: "Enhanced profiles, extra media, analytics and lead management. Prominent placements will always be labelled as promoted." },
          ].map((x) => (
            <div key={x.t} className="card">
              <h2 style={{ fontSize: "1.2rem" }}>{x.t}</h2>
              <p className="small muted">{x.d}</p>
            </div>
          ))}
        </div>

        <section className="section-tight two-col-list" aria-label="Listing terms" style={{ marginTop: 24 }}>
          <div className="card card-muted">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Free and premium listings</h2>
            <ul className="small">
              <li>
                <strong>Basic listing — free:</strong> name, profession or category, service areas, languages, contact link, verification status.
              </li>
              <li>
                <strong>Premium listing — pricing to be announced:</strong> enhanced profile, gallery, analytics, lead management and labelled promoted placement.
              </li>
              <li>Renewal, cancellation and refund terms will be published before paid listings open.</li>
            </ul>
          </div>
          <div className="card card-muted">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>What we don&apos;t accept</h2>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>Claims to cure, reverse or prevent disease through food or supplements.</li>
              <li>Detox, miracle or guaranteed weight-loss products.</li>
              <li>Unverifiable credentials or fabricated reviews and testimonials.</li>
              <li>Advertising that targets people based on health conditions.</li>
            </ul>
          </div>
        </section>

        <section id="apply" className="card" style={{ marginTop: 24 }} aria-labelledby="apply-h">
          <h2 id="apply-h">Apply for a listing</h2>
          <p className="muted small">We&apos;ll contact you to verify your details. Applying doesn&apos;t guarantee a listing.</p>
          <ListingForm />
        </section>
      </div>
    </>
  );
}
