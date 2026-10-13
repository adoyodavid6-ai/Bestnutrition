import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { FeaturedCheckout } from "@/components/billing/FeaturedCheckout";
import { billingConfig } from "@/lib/billing/config";
import { verifyListing } from "@/lib/billing/entitlement";
import { featuredListingOffer } from "@/lib/billing/offers";
import { LISTING_PACKAGES } from "@/lib/commerce/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Featured Listing",
  description: "Upgrade a verified NourishWell listing to a featured listing.",
  robots: { index: false, follow: false },
};

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ listing?: string; sig?: string; status?: string }> }) {
  const { listing = "", sig, status } = await searchParams;
  const config = billingConfig();
  const valid = Boolean(config.entitlementSecret) && verifyListing(listing, sig, config.entitlementSecret!);
  const offer = valid ? await featuredListingOffer(config) : null;

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/for-businesses", label: "For businesses" },
          { href: "/for-businesses/upgrade", label: "Featured listing" },
        ]}
      />
      <PageHead eyebrow="Verified listings" title="Upgrade to a featured listing" />
      <div className="container" style={{ paddingBottom: 48, maxWidth: 760 }}>
        {status === "success" ? (
          <div className="callout callout-success" role="status">
            <span className="callout-title">Thank you — payment received</span>
            Stripe has emailed your receipt. Our team will switch your listing to featured within two working days and confirm by email, including how to manage or cancel your billing at any time.
          </div>
        ) : !valid ? (
          <div className="card">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>This link isn&apos;t valid</h2>
            <p className="small">
              Featured listings are available only to verified professionals and businesses, using the personal payment link we email after verification. If you haven&apos;t applied yet,{" "}
              <Link href="/for-businesses#apply">apply for a listing</Link>. If your link has stopped working, <Link href="/contact?topic=partnership">contact us</Link>.
            </p>
          </div>
        ) : !offer ? (
          <div className="card">
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Payments aren&apos;t open yet</h2>
            <p className="small">Your listing is verified, but featured-listing payments aren&apos;t switched on yet, so nothing can be charged. We&apos;ll email you when they open.</p>
          </div>
        ) : (
          <div className="card">
            {status === "cancelled" && (
              <p className="callout callout-info" role="status">
                Checkout was cancelled — no payment was taken.
              </p>
            )}
            <h2 style={{ fontSize: "var(--fs-xl)" }}>Featured listing for “{listing}”</h2>
            <p className="price-amount">
              {offer.display}
              <span className="price-per"> / {offer.interval}</span>
            </p>
            <ul className="check-list small">
              {LISTING_PACKAGES.find((x) => x.id === "featured")!
                .benefits.filter((b) => b.status === "live")
                .map((b) => (
                  <li key={b.text}>{b.text}</li>
                ))}
            </ul>
            <p className="xs muted">
              Renews automatically every {offer.interval} until you cancel. Cancel any time by contacting us or through the billing link we send you; your listing reverts to Basic at the end of the paid period. Prices exclude any applicable
              taxes, which are shown at checkout. Paying never affects verification or editorial coverage.
            </p>
            <FeaturedCheckout listing={listing} sig={sig!} />
          </div>
        )}
      </div>
    </>
  );
}
