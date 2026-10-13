import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ListingForm } from "@/components/forms/ListingForm";
import Link from "next/link";
import { featuredListingOffer } from "@/lib/billing/offers";
import { LISTING_PACKAGES } from "@/lib/commerce/listings";

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
            { t: "Direct enquiries", d: "Readers contact you or request an appointment through your own website or booking link — we never take a cut of your bookings." },
            { t: "Featured listings", d: "Shown first in the directory with a photo gallery, extended description and a prominent booking button. Featured placements are always labelled as promoted." },
          ].map((x) => (
            <div key={x.t} className="card">
              <h2 style={{ fontSize: "1.2rem" }}>{x.t}</h2>
              <p className="small muted">{x.d}</p>
            </div>
          ))}
        </div>

        <section aria-labelledby="packages-h" style={{ marginTop: 32 }}>
          <h2 id="packages-h">Listing packages</h2>
          <div className="grid grid-3" style={{ gap: 16 }}>
            {LISTING_PACKAGES.map((p) => (
              <div key={p.id} className={`price-card${p.id === "featured" ? " featured" : ""}`}>
                <h3>
                  {p.name} {!p.available && <span className="chip">In development</span>}
                </h3>
                <p className="price-amount" style={{ fontSize: "1.6rem" }}>
                  {p.id === "basic" ? "Free" : p.id === "featured" ? (featured ? `${featured.display} / ${featured.interval}` : "Price to be announced") : "Not yet available"}
                </p>
                <p className="small">{p.summary}</p>
                <ul className={p.available ? "check-list small" : "planned-list small"}>
                  {p.benefits.map((b) => (
                    <li key={b.text}>{b.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="xs muted" style={{ marginTop: 8 }}>
            Business Plus is listed so you know what&apos;s coming; it isn&apos;t sold until every feature in it exists. Prices exclude any taxes shown at checkout.
          </p>
        </section>

        <section className="section-tight two-col-list" aria-label="Listing terms" style={{ marginTop: 24 }}>
          <div className="card card-muted">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>How listings work</h2>
            <ul className="small">
              <li>Every listing starts with verification. Featured is offered only after you&apos;re verified: we email a secure payment link.</li>
              <li>Featured renews monthly until you cancel; at the end of the paid period your listing reverts to Basic.</li>
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
