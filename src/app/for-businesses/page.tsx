import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ListingForm } from "@/components/forms/ListingForm";
import Link from "next/link";
import { featuredListingOffer } from "@/lib/billing/offers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "For Professionals & Businesses",
  description: "Reach people who want to eat well. Apply for a verified NourishWell listing as a dietitian, nutritionist, healthy meal provider, gym or wellness business.",
  alternates: { canonical: "/for-businesses" },
};

export default async function ForBusinessesPage() {
  const featured = await featuredListingOffer();
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
            { t: "Featured listings", d: "Priority placement in the directory and on relevant guides, an enhanced profile and extra media. Featured placements are always labelled as promoted." },
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
                <strong>Featured listing — {featured ? `${featured.display} per ${featured.interval}` : "pricing to be announced"}:</strong> enhanced profile, gallery, priority placement labelled as promoted, and a monthly
                summary of profile views and enquiries.
              </li>
              <li>Featured listings are offered only after verification. We send a secure payment link; you can cancel any time and the listing reverts to Basic at the end of the paid period.</li>
              <li>
                Paying never buys verification, reviews or editorial coverage. See <Link href="/how-we-make-money">how we make money</Link>.
              </li>
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
