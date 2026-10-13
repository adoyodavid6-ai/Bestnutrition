import { NextResponse, type NextRequest } from "next/server";
import { billingConfig, premiumSellable } from "@/lib/billing/config";
import { ENTITLEMENT_COOKIE } from "@/lib/billing/entitlement";
import { applyToken, resolvePlan } from "@/lib/billing/server";
import { planById } from "@/lib/plans";

export const dynamic = "force-dynamic";

/** The current browser's plan. Read-only for the client: it cannot change the signed cookie. */
export async function GET(req: NextRequest) {
  const config = billingConfig();
  const state = await resolvePlan(req.cookies.get(ENTITLEMENT_COOKIE)?.value, config);
  const e = state.entitlement;
  const res = NextResponse.json(
    {
      plan: state.plan,
      sellable: premiumSellable(config),
      limits: planById(state.plan).limits,
      cancelAtPeriodEnd: Boolean(e?.cancelAtPeriodEnd),
      trial: Boolean(e?.trial),
      pastDue: Boolean(e?.pastDue),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  return applyToken(res, state.token);
}
