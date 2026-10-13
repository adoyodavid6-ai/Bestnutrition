import { NextResponse, type NextRequest } from "next/server";
import { billingConfig } from "@/lib/billing/config";
import { getCheckoutSession } from "@/lib/billing/stripe";
import { DOWNLOAD_TTL_SEC, signDownload } from "@/lib/commerce/delivery";
import { productBySlug } from "@/lib/commerce/products";
import { emailConfigured, emailHtml, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Checkout returns here. Payment is verified with Stripe before any download link is issued. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const id = req.nextUrl.searchParams.get("session_id") ?? "";
  const config = billingConfig();
  const fail = () => NextResponse.redirect(`${origin}/resources?checkout=error`, { status: 303 });
  if (!/^cs_[A-Za-z0-9_]{6,}$/.test(id) || !config.secretKey || !config.entitlementSecret) return fail();
  try {
    const s = await getCheckoutSession(id, config);
    const product = productBySlug(s.metadata?.product_slug ?? "");
    if (s.status !== "complete" || s.payment_status !== "paid" || s.mode !== "payment" || s.metadata?.product !== "digital-product" || !product) return fail();
    const token = signDownload({ slug: product.slug, session: s.id, exp: Math.floor(Date.now() / 1000) + DOWNLOAD_TTL_SEC }, config.entitlementSecret);
    const page = `${origin}/resources/${product.slug}/download?token=${encodeURIComponent(token)}`;
    const email = s.customer_details?.email;
    if (email && emailConfigured()) {
      // A copy of the link, so the buyer can download again on another device.
      await sendEmail({
        to: email,
        subject: `Your download: ${product.name}`,
        text: `Thank you for your purchase. Download ${product.name} here (link valid for 7 days):\n\n${page}\n\nYour receipt comes separately from Stripe.`,
        html: emailHtml("Your download is ready", [`Thank you for buying ${product.name}.`, "This link works for 7 days. Your receipt comes separately from Stripe."], { label: "Download now", url: page }),
      }).catch((e) => console.error("download email failed", e));
    }
    return NextResponse.redirect(page, { status: 303 });
  } catch (e) {
    console.error("product confirm failed", e);
    return fail();
  }
}
