import { NextResponse, type NextRequest } from "next/server";
import { billingConfig } from "@/lib/billing/config";
import { signEntitlement, verifyToken } from "@/lib/billing/entitlement";
import { applyToken, entitlementFromSubscription } from "@/lib/billing/server";
import { getSubscription } from "@/lib/billing/stripe";

export const dynamic = "force-dynamic";

/** Emailed restore link: verifies the token, re-checks the subscription, then sets the entitlement. */
export async function GET(req: NextRequest) {
  const config = billingConfig();
  const back = (q: string) => NextResponse.redirect(`${req.nextUrl.origin}${q}`, { status: 303 });
  if (!config.entitlementSecret) return back("/account/billing?status=restore-failed");
  const t = verifyToken<{ cus: string; sub: string; exp: number }>("restore", req.nextUrl.searchParams.get("token"), config.entitlementSecret);
  if (!t) return back("/account/billing?status=restore-expired");
  try {
    const sub = await getSubscription(t.sub, config);
    const ent = sub.customer === t.cus ? entitlementFromSubscription(sub) : null;
    if (!ent) return back("/account/billing?status=restore-failed");
    return applyToken(back("/account/billing?status=restored"), signEntitlement(ent, config.entitlementSecret));
  } catch (e) {
    console.error("restore confirm failed", e);
    return back("/account/billing?status=restore-failed");
  }
}
