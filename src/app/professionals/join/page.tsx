import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ListingForm } from "@/components/forms/ListingForm";
import { BookingScheduler } from "@/components/booking/BookingScheduler";
import { ProSignupPay } from "@/components/booking/ProSignupPay";
import { billingConfig } from "@/lib/billing/config";
import { verifyToken } from "@/lib/billing/entitlement";
import { proSignupOffer } from "@/lib/billing/offers";
import type { Availability } from "@/lib/booking";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join as a Professional",
  description: "Verified dietitians, nutritionists and wellness professionals can list on NourishWell, set their own hourly rate and receive booking requests. One-time sign-up fee after verification.",
  alternates: { canonical: "/professionals/join" },
};

/** Example data for the preview only — not a real professional. */
const EXAMPLE: Availability = {
  timezone: "Europe/London",
  weekly: [
    { day: 2, start: "09:00", end: "13:00" },
    { day: 4, start: "13:00", end: "18:00" },
  ],
  sessionMinutes: [30, 60],
  minNoticeHours: 24,
  horizonDays: 21,
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ listing?: string; sig?: string; status?: string }> }) {
  const { listing, sig, status } = await searchParams;
  const config = billingConfig();
  const fee = proSignupOffer(config);
  const feeText = `US$${config.usd.proSignup % 100 ? (config.usd.proSignup / 100).toFixed(2) : config.usd.proSignup / 100}`;
  const grant = listing && sig && config.entitlementSecret ? verifyToken<{ listing: string; exp: number }>("pro-signup", sig, config.entitlementSecret) : null;
  const payable = grant && grant.listing === listing;

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/professionals", label: "Professionals" },
          { href: "/professionals/join", label: "Join as a professional" },
        ]}
      />
      <PageHead
        eyebrow="For professionals"
        title="Be found by people ready to eat well"
        lede="List your verified practice, set your own hourly rate, and let clients request appointments at times you choose. Clients pay you directly — we never take a cut of your consultations."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        {status === "success" && (
          <div className="callout callout-success" role="status" style={{ marginBottom: 24 }}>
            <span className="callout-title">Payment received — thank you</span>
            Stripe has emailed your receipt. We&apos;ll publish your profile and switch on booking requests within two working days, and email you when it&apos;s live.
          </div>
        )}
        {listing && (
          <section className="card" style={{ marginBottom: 24 }} aria-labelledby="pay-h">
            <h2 id="pay-h" style={{ fontSize: "var(--fs-xl)" }}>
              Complete your sign-up
            </h2>
            {!payable ? (
              <p className="small">
                This payment link isn&apos;t valid or has expired. <Link href="/contact?topic=partnership">Contact us</Link> and we&apos;ll send a new one.
              </p>
            ) : !fee ? (
              <p className="small">You&apos;re verified, but sign-up payments aren&apos;t switched on yet, so nothing can be charged. We&apos;ll email you when they are.</p>
            ) : (
              <>
                {status === "cancelled" && <p className="callout callout-info small">Checkout was cancelled — no payment was taken.</p>}
                <p className="price-amount">
                  {fee.display}
                  <span className="price-per"> USD · one-time</span>
                </p>
                <p className="small muted">
                  Priced in US dollars; at checkout you can pay in your local currency where available. Taxes, if any, are shown before you pay. This one-time fee covers verification and publishing your profile with
                  booking requests.
                </p>
                <ProSignupPay listing={listing} sig={sig!} display={fee.display} />
              </>
            )}
          </section>
        )}

        <div className="grid grid-3" style={{ gap: 16 }}>
          {[
            { t: "1. Apply", d: "Tell us about your qualifications, your hourly rate and when you're available. Applying is free." },
            { t: "2. Get verified", d: "We check your registration with the relevant professional body. Nobody is shown as verified until that's done." },
            { t: `3. Pay ${feeText} once`, d: "After approval we email a secure payment link. Your profile goes live with online booking requests." },
          ].map((x) => (
            <div key={x.t} className="card">
              <h2 style={{ fontSize: "1.2rem" }}>{x.t}</h2>
              <p className="small muted" style={{ marginBottom: 0 }}>
                {x.d}
              </p>
            </div>
          ))}
        </div>

        <section className="section-tight two-col-list" aria-label="How bookings work">
          <div className="card card-muted">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>How bookings work</h2>
            <ul className="small" style={{ marginBottom: 0 }}>
              <li>Your profile shows your hourly rate and the session lengths you offer; clients see the fee before they ask.</li>
              <li>Clients pick a date and time from your weekly availability, shown in their own time zone.</li>
              <li>The request is emailed to you; reply to confirm or suggest another time. Nothing is booked until you confirm.</li>
              <li>You take payment directly, in your own currency and way. NourishWell charges no commission.</li>
            </ul>
          </div>
          <div className="card">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>What clients see</h2>
            <p className="xs muted">Preview with example availability — not a real professional. Requests can&apos;t be sent from here.</p>
            <BookingScheduler preview professional={{ slug: "example", name: "the professional", hourlyRate: { amount: 80, currency: "USD" }, availability: EXAMPLE, modes: ["video", "phone"] }} />
          </div>
        </section>

        <section id="apply" className="card" style={{ marginTop: 24 }} aria-labelledby="apply-h">
          <h2 id="apply-h">Apply as a professional</h2>
          <p className="muted small">
            Applying is free. The {feeText} sign-up fee is due only after we&apos;ve verified you. Businesses can apply on the <Link href="/for-businesses#apply">for businesses</Link> page.
          </p>
          <ListingForm defaultType="professional" />
        </section>
      </div>
    </>
  );
}
