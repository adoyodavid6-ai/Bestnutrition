"use client";

import { useState } from "react";
import { getAttribution } from "@/lib/attribution-client";
import { track } from "@/lib/analytics";
import { startCheckout } from "./usePlan";

export function FeaturedCheckout({ listing, sig }: { listing: string; sig: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          track("checkout_started", { product: "listing-featured" });
          const err = await startCheckout({ product: "listing-featured", listing, sig, attribution: getAttribution() });
          if (err) {
            setError(err);
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening secure checkout…" : "Continue to secure payment"}
      </button>
      {error && (
        <p role="alert" className="form-status" style={{ marginTop: 12, background: "var(--warning-bg)", color: "var(--warning)" }}>
          {error}
        </p>
      )}
    </>
  );
}
