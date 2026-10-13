"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import type { AffiliatePlacement, AffiliateProduct, Sponsor } from "@/lib/commerce/disclosure";

/** Shown at the top of any sponsored or partner content. */
export function SponsorLabel({ sponsor }: { sponsor: Sponsor }) {
  return (
    <p className="sponsor-label" role="note">
      <span className="chip chip-warning">{sponsor.kind === "partner" ? "Partner" : "Sponsored"}</span>{" "}
      {sponsor.kind === "partner" ? "Created in partnership with " : "Sponsored by "}
      {sponsor.url ? (
        <a href={sponsor.url} rel="sponsored noopener" target="_blank">
          {sponsor.name}
        </a>
      ) : (
        sponsor.name
      )}
      . Our editors chose and tested the recipes; the sponsor didn&apos;t review nutrition or health information. <Link href="/how-we-make-money">How we make money</Link>
    </p>
  );
}

/** An affiliate link with its disclosure attached. Not allowed on health-condition or supplement pages. */
export function AffiliateLink({ product, placement, children }: { product: AffiliateProduct; placement: AffiliatePlacement; children?: React.ReactNode }) {
  return (
    <span className="affiliate">
      <a href={product.url} rel="sponsored nofollow noopener" target="_blank" onClick={() => track("affiliate_click", { product: product.id, placement })}>
        {children ?? `${product.name} at ${product.merchant}`}
      </a>{" "}
      <span className="chip chip-outline xs" title="We may earn a commission if you buy. It never affects what we recommend.">
        Affiliate link
      </span>
    </span>
  );
}
