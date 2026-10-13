"use client";

import { useEffect, useState } from "react";

export interface PlanInfo {
  plan: "free" | "premium";
  sellable: boolean;
  limits: { savedPlans: number };
  cancelAtPeriodEnd: boolean;
  trial: boolean;
  pastDue: boolean;
}

const FALLBACK: PlanInfo = { plan: "free", sellable: false, limits: { savedPlans: 3 }, cancelAtPeriodEnd: false, trial: false, pastDue: false };
let pending: Promise<PlanInfo> | null = null;

function load(force = false) {
  if (!pending || force)
    pending = fetch("/api/billing/entitlement", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<PlanInfo>) : FALLBACK))
      .catch(() => FALLBACK);
  return pending;
}

/** This browser's plan, as reported by the server. Shared across components on a page. */
export function usePlan() {
  const [info, setInfo] = useState<PlanInfo | null>(null);
  useEffect(() => {
    let live = true;
    load().then((i) => live && setInfo(i));
    return () => {
      live = false;
    };
  }, []);
  return {
    info: info ?? FALLBACK,
    loading: info === null,
    refresh: () => load(true).then(setInfo),
  };
}

/** Start Stripe Checkout. Returns an error message, or navigates away on success. */
export async function startCheckout(body: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.url) {
      window.location.assign(json.url);
      return null;
    }
    return json.message ?? "We couldn't start checkout. No payment was taken.";
  } catch {
    return "We couldn't reach the server. Check your connection and try again.";
  }
}
