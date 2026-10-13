"use client";

import { useEffect, useState } from "react";
import { getAttribution } from "@/lib/attribution-client";
import { track } from "@/lib/analytics";
import { startCheckout } from "./usePlan";

export function ProductBuy({ slug }: { slug: string }) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    track("product_view", { product: slug });
    setCancelled(new URLSearchParams(window.location.search).get("checkout") === "cancelled");
  }, [slug]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!consent) return setError("Please tick the box to confirm you want immediate access.");
        setBusy(true);
        setError(null);
        track("checkout_started", { product: "digital", slug });
        const err = await startCheckout({ product: "digital", slug, immediateAccess: true, attribution: getAttribution() });
        if (err) {
          setError(err);
          setBusy(false);
        }
      }}
    >
      {cancelled && (
        <p className="callout callout-info small" role="status">
          Checkout was cancelled — no payment was taken.
        </p>
      )}
      <label className="checkbox small" style={{ marginBottom: 12 }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I want to download straight away, and I understand that once the download is available I lose my right to cancel the purchase.</span>
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Opening secure checkout…" : "Buy and download"}
      </button>
      {error && (
        <p role="alert" className="error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </form>
  );
}

export function PurchaseTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Count once per browser session; Stripe remains the source of truth for sales.
    try {
      const key = `nw:purchased:${slug}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    track("product_purchased", { product: slug });
  }, [slug]);
  return null;
}
