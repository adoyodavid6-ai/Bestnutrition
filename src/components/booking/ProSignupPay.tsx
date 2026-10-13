"use client";

import { useState } from "react";
import { getAttribution } from "@/lib/attribution-client";
import { track } from "@/lib/analytics";
import { startCheckout } from "../billing/usePlan";

export function ProSignupPay({ listing, sig, display }: { listing: string; sig: string; display: string }) {
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
          track("checkout_started", { product: "pro-signup" });
          const err = await startCheckout({ product: "pro-signup", listing, sig, attribution: getAttribution() });
          if (err) {
            setError(err);
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening secure checkout…" : `Pay ${display} and publish my profile`}
      </button>
      {error && (
        <p role="alert" className="error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </>
  );
}
