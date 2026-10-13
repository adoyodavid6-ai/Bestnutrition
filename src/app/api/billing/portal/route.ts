import { NextResponse, type NextRequest } from "next/server";
import { billingConfig } from "@/lib/billing/config";
import { ENTITLEMENT_COOKIE } from "@/lib/billing/entitlement";
import { applyToken, resolvePlan } from "@/lib/billing/server";
import { createPortalSession } from "@/lib/billing/stripe";

/** Opens the Stripe Customer Portal: change plan, update card, cancel, receipts and billing history. */
export async function POST(req: NextRequest) {
  const config = billingConfig();
  const state = await resolvePlan(req.cookies.get(ENTITLEMENT_COOKIE)?.value, config);
  if (state.plan !== "premium" || !state.entitlement) {
    return applyToken(NextResponse.json({ ok: false, message: "No active subscription was found in this browser." }, { status: 404 }), state.token);
  }
  try {
    const portal = await createPortalSession(state.entitlement.cus, `${req.nextUrl.origin}/account/billing`, config);
    return applyToken(NextResponse.json({ ok: true, url: portal.url }, { headers: { "Cache-Control": "no-store" } }), state.token);
  } catch (e) {
    console.error("portal failed", e);
    return NextResponse.json({ ok: false, message: "We couldn't open billing management just now. Please try again shortly." }, { status: 502 });
  }
}
