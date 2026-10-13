import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { billingConfig, premiumSellable } from "@/lib/billing/config";
import { signToken } from "@/lib/billing/entitlement";
import { entitlementFromSubscription } from "@/lib/billing/server";
import { listCustomersByEmail, listSubscriptions } from "@/lib/billing/stripe";
import { emailConfigured, emailHtml, sendEmail } from "@/lib/email";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const RESTORE_TTL_SEC = 30 * 60;
const GENERIC = "If that email has an active Premium subscription, we've sent it a sign-in link. It works for 30 minutes. Check your spam folder if it doesn't arrive.";

/**
 * Restore Premium on another browser. Responds identically whether or not a subscription
 * exists, so it can't be used to discover who subscribes.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (rateLimited(`restore:${ip}`, 5, 60 * 60 * 1000)) return NextResponse.json({ ok: false, message: "Too many attempts. Please try again in an hour." }, { status: 429 });
  const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter the email address you used at checkout." }, { status: 422 });
  const config = billingConfig();
  if (!premiumSellable(config) || !emailConfigured()) {
    return NextResponse.json({ ok: false, configured: false, message: "Automatic restore isn't switched on yet, so nothing was sent. Please contact us and we'll restore Premium for you." }, { status: 503 });
  }
  const email = parsed.data.email;
  if (rateLimited(`restore-email:${email}`, 3, 60 * 60 * 1000)) return NextResponse.json({ ok: true, message: GENERIC });

  try {
    const customers = await listCustomersByEmail(email, config);
    for (const c of customers.data) {
      const subs = await listSubscriptions({ customer: c.id, status: "all", limit: 20 }, config);
      const sub = subs.data.find((s) => s.metadata?.product === "premium" && entitlementFromSubscription(s));
      if (!sub) continue;
      const token = signToken("restore", { cus: c.id, sub: sub.id, exp: Math.floor(Date.now() / 1000) + RESTORE_TTL_SEC }, config.entitlementSecret!);
      const url = `${req.nextUrl.origin}/api/billing/restore/confirm?token=${encodeURIComponent(token)}`;
      await sendEmail({
        to: email,
        subject: "Your NourishWell Premium sign-in link",
        text: `Use this link within 30 minutes to turn on Premium in the browser you opened it in:\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
        html: emailHtml("Turn on Premium in this browser", ["Open this link in the browser where you want Premium. It works for 30 minutes.", "If you didn't ask for this, you can ignore this email — nothing changes."], { label: "Turn on Premium", url }),
      });
      break;
    }
  } catch (e) {
    console.error("restore failed", e);
    return NextResponse.json({ ok: false, message: "We couldn't check right now. Please try again shortly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: GENERIC });
}
