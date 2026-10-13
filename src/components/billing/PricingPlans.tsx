"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAttribution } from "@/lib/attribution-client";
import { track } from "@/lib/analytics";
import type { Offer } from "@/lib/billing/offers";
import { NewsletterForm } from "../forms/NewsletterForm";
import { startCheckout, usePlan } from "./usePlan";

export interface PricingPlansProps {
  sellable: boolean;
  month: Offer | null;
  year: Offer | null;
  trialDays: number;
  saving: number;
  freeItems: string[];
  premiumItems: string[];
  plannedItems: string[];
}

export function PricingPlans({ sellable, month, year, trialDays, saving, freeItems, premiumItems, plannedItems }: PricingPlansProps) {
  const [interval, setInterval] = useState<"month" | "year">(year && !month ? "year" : "month");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { info } = usePlan();
  const offer = interval === "year" ? year : month;

  useEffect(() => {
    track("pricing_view", { sellable: sellable ? "yes" : "no" });
  }, [sellable]);

  const buy = async () => {
    setBusy(true);
    setError(null);
    track("checkout_started", { interval });
    const err = await startCheckout({ product: "premium", interval, attribution: getAttribution() });
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <div className="pricing-grid">
      <div className="price-card">
        <h2>Free</h2>
        <p className="price-amount">
          No cost<span className="price-per">, ever</span>
        </p>
        <p className="muted">Everything you need to eat well, free for everyone — no card, no trial.</p>
        <Link href="/meal-planner" className="btn btn-primary" style={{ margin: "8px 0 16px" }}>
          Start planning
        </Link>
        <ul className="check-list">
          {freeItems.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="price-card featured" aria-live="polite">
        <h2>
          Premium {!sellable && <span className="chip" style={{ verticalAlign: "middle" }}>Coming soon</span>}
        </h2>

        {sellable && (month || year) ? (
          <>
            {month && year && (
              <div className="seg seg-dark" role="group" aria-label="Billing period" style={{ margin: "8px 0 4px" }}>
                <button type="button" aria-pressed={interval === "month"} onClick={() => setInterval("month")}>
                  Monthly
                </button>
                <button type="button" aria-pressed={interval === "year"} onClick={() => setInterval("year")}>
                  Yearly{saving > 0 ? ` · save ${saving}%` : ""}
                </button>
              </div>
            )}
            {offer && (
              <p className="price-amount">
                {offer.display}
                <span className="price-per"> / {offer.interval}</span>
              </p>
            )}
            {offer && offer.otherCurrencies.length > 0 && <p className="xs" style={{ margin: 0, opacity: 0.85 }}>Also billed in {offer.otherCurrencies.join(", ")} — your currency is confirmed at checkout.</p>}
            {info.plan === "premium" ? (
              <>
                <p style={{ marginTop: 12 }}>You have Premium in this browser. Thank you for supporting NourishWell.</p>
                <Link href="/account/billing" className="btn btn-light" style={{ margin: "8px 0 16px" }}>
                  Manage billing
                </Link>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-light" onClick={buy} disabled={busy || !offer} style={{ margin: "12px 0 8px" }}>
                  {busy ? "Opening secure checkout…" : trialDays ? `Start ${trialDays}-day free trial` : "Get Premium"}
                </button>
                <p className="xs" style={{ margin: "0 0 12px", opacity: 0.9 }}>
                  {trialDays ? `Free for ${trialDays} days, then ` : ""}
                  {offer ? `${offer.display} every ${offer.interval}` : ""}, renewing automatically until you cancel. Cancel any time in Account → Billing; access continues to the end of the period you&apos;ve paid for. Payments are processed securely
                  by Stripe.
                </p>
                {error && (
                  <p role="alert" className="form-status" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>
                    {error}
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <p className="price-amount" style={{ fontSize: "1.6rem" }}>
              Price to be announced
            </p>
            <p>More planning power for busy households. Health information will always stay free.</p>
            <div className="waitlist">
              <NewsletterForm variant="dark" source="premium-waitlist" heading="Get told when Premium opens" consentText="Email me when Premium launches, plus the weekly newsletter." button="Notify me" />
            </div>
          </>
        )}

        <h3 className="price-sub">Included today</h3>
        <ul className="check-list">
          <li>Everything in Free</li>
          {premiumItems.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {plannedItems.length > 0 && (
          <>
            <h3 className="price-sub">Planned — not yet included</h3>
            <ul className="planned-list">
              {plannedItems.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="xs" style={{ opacity: 0.85, marginBottom: 0 }}>
              We only charge for what works today. Planned features are added to Premium at no extra cost when they launch.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function CheckoutNotice() {
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    setStatus(new URLSearchParams(window.location.search).get("checkout"));
  }, []);
  if (status === "cancelled")
    return (
      <p className="callout callout-info" role="status">
        Checkout was cancelled — no payment was taken. You can start again whenever you like.
      </p>
    );
  if (status === "error")
    return (
      <p className="callout callout-warning" role="alert">
        We couldn&apos;t confirm your subscription. If you were charged, <Link href="/contact?topic=general">contact us</Link> with the email you used and we&apos;ll sort it out.
      </p>
    );
  return null;
}
