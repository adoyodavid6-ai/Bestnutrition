
export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";
import { billingConfig } from "@/lib/billing/config";
import { signEntitlement } from "@/lib/billing/entitlement";
import { applyToken, entitlementFromSubscription } from "@/lib/billing/server";
import { getCheckoutSession, getSubscription } from "@/lib/billing/stripe";

/**
 * Stripe Checkout returns here. The session is verified with Stripe (never trusted from the
 * URL alone) before this browser is given the signed Premium entitlement.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id") ?? "";
  const origin = req.nextUrl.origin;
  const back = (q: string) => NextResponse.redirect(`${origin}${q}`, { status: 303 });
  const config = billingConfig();
  if (!/^cs_[A-Za-z0-9_]{6,}$/.test(id) || !config.secretKey || !config.entitlementSecret) return back("/pricing?checkout=error");

  try {
    const session = await getCheckoutSession(id, config);
    if (session.status !== "complete" || session.mode !== "subscription" || !session.subscription || session.metadata?.product !== "premium") return back("/pricing?checkout=error");
    const sub = await getSubscription(session.subscription, config);
    const ent = entitlementFromSubscription(sub);
    if (!ent) return back("/pricing?checkout=error");
    return applyToken(back(`/account/billing?status=success${ent.trial ? "&trial=1" : ""}`), signEntitlement(ent, config.entitlementSecret));
  } catch (e) {
    console.error("confirm failed", e);
    return back("/pricing?checkout=error");
  }
}
