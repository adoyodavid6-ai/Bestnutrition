import type { NextResponse } from "next/server";
import { billingConfig, type BillingConfig } from "./config";
import { ENTITLEMENT_COOKIE, signEntitlement, verifyEntitlement, type Entitlement } from "./entitlement";
import { ACTIVE_STATUSES, getSubscription, periodEnd, type StripeSubscription } from "./stripe";

/** Grace added past the period end so a renewal that settles a little late doesn't drop access. */
const GRACE_SEC = 3 * 24 * 3600;
/** Re-check at least daily, so a cancellation or failed payment is picked up promptly. */
const MAX_TTL_SEC = 24 * 3600;

export type PlanState = { plan: "free" | "premium"; entitlement?: Entitlement; token?: string | null };

export function entitlementFromSubscription(sub: StripeSubscription, nowSec = Math.floor(Date.now() / 1000)): Entitlement | null {
  if (!ACTIVE_STATUSES.includes(sub.status)) return null;
  const end = periodEnd(sub) ?? nowSec;
  return {
    plan: "premium",
    cus: sub.customer,
    sub: sub.id,
    exp: Math.min(end + GRACE_SEC, nowSec + MAX_TTL_SEC),
    cancelAtPeriodEnd: sub.cancel_at_period_end || undefined,
    trial: sub.status === "trialing" || undefined,
    pastDue: sub.status === "past_due" || undefined,
  };
}

/**
 * Resolve this request's plan from the signed cookie. When the token has expired, the
 * subscription is re-checked with Stripe; `token` is then the replacement cookie value
 * (or null to clear it). Callers that can set cookies should apply it with `applyToken`.
 */
export async function resolvePlan(cookieValue: string | undefined, config: BillingConfig = billingConfig()): Promise<PlanState> {
  if (!config.entitlementSecret || !cookieValue) return { plan: "free" };
  const v = verifyEntitlement(cookieValue, config.entitlementSecret);
  if (!v.valid) return { plan: "free", token: null };
  if (!v.expired) return { plan: "premium", entitlement: v.entitlement };
  try {
    const sub = await getSubscription(v.entitlement.sub, config);
    const next = entitlementFromSubscription(sub);
    if (!next) return { plan: "free", token: null };
    return { plan: "premium", entitlement: next, token: signEntitlement(next, config.entitlementSecret) };
  } catch {
    // Stripe unreachable: keep access for this request rather than punishing the subscriber.
    return { plan: "premium", entitlement: v.entitlement };
  }
}

export function applyToken(res: NextResponse, token: string | null | undefined) {
  if (token === undefined) return res;
  if (token === null) res.cookies.delete(ENTITLEMENT_COOKIE);
  else
    res.cookies.set(ENTITLEMENT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 400 * 24 * 3600,
    });
  return res;
}
