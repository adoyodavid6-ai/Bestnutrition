"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { toast } from "../Toaster";
import { usePlan } from "./usePlan";

function RestoreForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ status: "idle" | "busy" | "done" | "error"; message?: string }>({ status: "idle" });
  return (
    <form
      className="row"
      style={{ alignItems: "flex-end" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ status: "busy" });
        const res = await fetch("/api/billing/restore", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => null);
        const json = res ? await res.json().catch(() => ({})) : {};
        setState({ status: res?.ok ? "done" : "error", message: json.message ?? "We couldn't reach the server. Please try again." });
      }}
    >
      <div className="field" style={{ margin: 0, flex: "1 1 240px" }}>
        <label htmlFor="restore-email">Email used at checkout</label>
        <input id="restore-email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-secondary" disabled={state.status === "busy"}>
        {state.status === "busy" ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state.message && (
        <p role="status" className="small" style={{ flexBasis: "100%", margin: "8px 0 0", color: state.status === "error" ? "var(--warning)" : undefined }}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export function BillingPanel() {
  const { info, loading, refresh } = usePlan();
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState<{ trial: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("status") === "success") {
      setWelcome({ trial: q.get("trial") === "1" });
      track("subscription_started", { trial: q.get("trial") === "1" ? "yes" : "no" });
      window.history.replaceState(null, "", "/account/billing");
    }
    const notices: Record<string, string> = {
      restored: "Premium is now on in this browser.",
      "restore-expired": "That sign-in link has expired or isn't valid. Request a new one below.",
      "restore-failed": "We couldn't find an active Premium subscription for that link. If you think this is wrong, contact us.",
    };
    const st = q.get("status");
    if (st && notices[st]) {
      setNotice(notices[st]);
      window.history.replaceState(null, "", "/account/billing");
    }
  }, []);

  const manage = async () => {
    setBusy(true);
    const res = await fetch("/api/billing/portal", { method: "POST" }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok && json.url) window.location.assign(json.url);
    else {
      toast(json.message ?? "We couldn't open billing management. Please try again.");
      setBusy(false);
    }
  };

  const removeFromDevice = async () => {
    if (!window.confirm("Remove Premium from this browser? This does NOT cancel your subscription — use Manage billing to cancel.")) return;
    await fetch("/api/billing/signout", { method: "POST" }).catch(() => null);
    await refresh();
    toast("Premium removed from this browser");
  };

  if (loading) return <div className="card" aria-busy="true" style={{ minHeight: 160 }} />;

  return (
    <div className="stack" style={{ display: "grid", gap: 16 }}>
      {welcome && (
        <div className="callout callout-success" role="status">
          <span className="callout-title">Welcome to Premium</span>
          {welcome.trial ? "Your free trial has started. " : "Your subscription is active. "}A receipt is on its way from Stripe. Your extra saved plans and exports are ready in the <Link href="/meal-planner">meal planner</Link> and{" "}
          <Link href="/shopping-list">shopping list</Link>.
        </div>
      )}

      {notice && (
        <p className="callout callout-info" role="status">
          {notice}
        </p>
      )}
      {info.pastDue && (
        <div className="callout callout-warning" role="alert">
          <span className="callout-title">Your last payment didn&apos;t go through</span>
          Stripe will retry automatically. To keep Premium, open <strong>Manage billing</strong> and update your payment method.
        </div>
      )}

      <section className="card" aria-labelledby="plan-h">
        <h2 id="plan-h" style={{ fontSize: "var(--fs-xl)" }}>
          Your plan: {info.plan === "premium" ? "Premium" : "Free"}
        </h2>
        {info.plan === "premium" ? (
          <>
            <p className="small">
              {info.trial ? "You're on a free trial. " : ""}
              {info.cancelAtPeriodEnd ? "Your subscription is set to end at the close of the current billing period — you can resume it from Manage billing." : "Your subscription renews automatically until you cancel."}
            </p>
            <p className="small muted">Manage billing opens our payment provider, Stripe, where you can change between monthly and yearly, update your card, cancel, and download receipts and invoices.</p>
            <div className="row">
              <button type="button" className="btn btn-primary" onClick={manage} disabled={busy}>
                {busy ? "Opening…" : "Manage billing"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={removeFromDevice}>
                Remove Premium from this browser
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="small">You&apos;re using NourishWell free — recipes, guides, the meal planner, shopping lists and the shopping calendar are all yours to use.</p>
            <div className="row">
              <Link href="/pricing" className="btn btn-primary">
                {info.sellable ? "See Premium" : "Premium — join the waitlist"}
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="card card-muted" aria-labelledby="devices-h">
        <h2 id="devices-h" style={{ fontSize: "var(--fs-lg)" }}>
          Using Premium on another device
        </h2>
        <p className="small">
          Until accounts launch, Premium is turned on per browser. To use it here, enter the email you used at checkout and we&apos;ll send a sign-in link. You can always cancel or download receipts from the
          link in any Stripe receipt email.
        </p>
        <RestoreForm />
      </section>
    </div>
  );
}
