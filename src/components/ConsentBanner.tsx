"use client";

import Link from "next/link";
import { KEYS, useStored } from "@/lib/storage";

export function ConsentBanner() {
  const [consent, setConsent, hydrated] = useStored<string | null>(KEYS.consent, null);
  if (!hydrated || consent) return null;
  return (
    <div className="consent-banner no-print" role="region" aria-label="Privacy choices">
      <p style={{ marginBottom: 12 }}>
        <strong>Your privacy.</strong> NourishWell stores your saved recipes, plans and lists only on this device. With your permission we&apos;d also count anonymous product usage (like recipe
        views) to improve the site — never your health interests. <Link href="/privacy#analytics">Learn more</Link>.
      </p>
      <div className="row">
        <button className="btn btn-primary btn-sm" onClick={() => setConsent("granted")}>
          Allow anonymous analytics
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setConsent("denied")}>
          Essential only
        </button>
      </div>
    </div>
  );
}
