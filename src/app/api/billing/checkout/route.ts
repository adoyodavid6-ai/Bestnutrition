import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { billingConfig, listingSellable, premiumSellable, proSignupSellable } from "@/lib/billing/config";
import { ENTITLEMENT_COOKIE, verifyListing, verifyToken } from "@/lib/billing/entitlement";
import { attributionMetadata, cleanAttribution } from "@/lib/billing/attribution";
import { resolvePlan } from "@/lib/billing/server";
import { StripeError, createCheckoutSession } from "@/lib/billing/stripe";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { cleanAssignments } from "@/lib/experiments";
import { productBySlug, productPriceId, productSellable } from "@/lib/commerce/products";

const body = z.discriminatedUnion("product", [
  z.object({ product: z.literal("premium"), interval: z.enum(["month", "year"]), attribution: z.unknown().optional(), experiments: z.unknown().optional() }),
  z.object({ product: z.literal("listing-featured"), listing: z.string(), sig: z.string(), attribution: z.unknown().optional() }),
  z.object({ product: z.literal("digital"), slug: z.string().max(80), immediateAccess: z.literal(true), attribution: z.unknown().optional() }),
  z.object({ product: z.literal("pro-signup"), listing: z.string(), sig: z.string(), attribution: z.unknown().optional() }),
]);

const fail = (message: string, status: number) => NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (rateLimited(`checkout:${clientIp(req.headers)}`, 10, 10 * 60 * 1000)) return fail("Too many attempts. Please wait a few minutes and try again.", 429);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request.", 400);
  const input = parsed.data;
  const config = billingConfig();
  const origin = req.nextUrl.origin;
  const experiments = "experiments" in input ? cleanAssignments(input.experiments) : {};
  const metadata = {
    product: input.product,
    ...attributionMetadata(cleanAttribution(input.attribution)),
    ...Object.fromEntries(Object.entries(experiments).map(([k, v]) => [`exp_${k}`, v])),
  };

  // Prices are in US dollars (the settlement currency). Adaptive Pricing lets buyers see and pay the
  // converted amount in their local currency at Checkout; any card can also pay a USD charge directly.
  const localCurrency = config.adaptivePricing ? { adaptive_pricing: { enabled: true } } : {};

  try {
    if (input.product === "pro-signup") {
      if (!proSignupSellable(config)) return fail("Professional sign-up payments aren't open yet, so no payment was taken. We'll email you when they are.", 503);
      const grant = verifyToken<{ exp: number; listing: string }>("pro-signup", input.sig, config.entitlementSecret!);
      if (!grant || grant.listing !== input.listing)
        return fail("This payment link isn't valid or has expired. Please use the link we sent after verifying your profile.", 403);
      const proMeta = { ...metadata, listing: input.listing };
      const session = await createCheckoutSession(
        {
          mode: "payment",
          line_items: [{ price_data: { currency: "usd", unit_amount: config.usd.proSignup, product_data: { name: "NourishWell professional sign-up (one-time)" } }, quantity: 1 }],
          ...localCurrency,
          success_url: `${origin}/professionals/join?status=success`,
          cancel_url: `${origin}/professionals/join?listing=${encodeURIComponent(input.listing)}&sig=${encodeURIComponent(input.sig)}&status=cancelled`,
          billing_address_collection: "required",
          tax_id_collection: { enabled: true },
          invoice_creation: { enabled: true, invoice_data: { metadata: proMeta } },
          ...(process.env.STRIPE_AUTOMATIC_TAX === "true" ? { automatic_tax: { enabled: true } } : {}),
          metadata: proMeta,
        },
        config,
      );
      return NextResponse.json({ ok: true, url: session.url }, { headers: { "Cache-Control": "no-store" } });
    }

    if (input.product === "premium") {
      if (!premiumSellable(config)) return fail("Premium isn't open for sign-up yet, so no payment was taken. Join the waitlist to hear when it opens.", 503);
      // Monthly: the Stripe Price if configured, otherwise the owner's US-dollar list price.
      const lineItem =
        input.interval === "year"
          ? config.prices.premiumYearly && { price: config.prices.premiumYearly, quantity: 1 }
          : config.prices.premiumMonthly
            ? { price: config.prices.premiumMonthly, quantity: 1 }
            : { price_data: { currency: "usd", unit_amount: config.usd.premiumMonthly, recurring: { interval: "month" }, product_data: { name: "NourishWell Premium" } }, quantity: 1 };
      if (!lineItem) return fail("Yearly billing isn't available. Please choose monthly.", 400);
      const current = await resolvePlan(req.cookies.get(ENTITLEMENT_COOKIE)?.value, config);
      if (current.plan === "premium") return fail("This browser already has Premium. Manage your subscription from Account → Billing.", 409);

      const session = await createCheckoutSession(
        {
          mode: "subscription",
          line_items: [lineItem],
          ...localCurrency,
          success_url: `${origin}/api/billing/confirm?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/pricing?checkout=cancelled`,
          allow_promotion_codes: true,
          billing_address_collection: "auto",
          ...(process.env.STRIPE_AUTOMATIC_TAX === "true" ? { automatic_tax: { enabled: true } } : {}),
          subscription_data: { metadata, ...(config.trialDays ? { trial_period_days: config.trialDays } : {}) },
          metadata,
        },
        config,
      );
      return NextResponse.json({ ok: true, url: session.url }, { headers: { "Cache-Control": "no-store" } });
    }

    if (input.product === "digital") {
      const p = productBySlug(input.slug);
      if (!p || !productSellable(p, config)) return fail("This product isn't on sale yet, so no payment was taken.", 503);
      const productMeta = { ...metadata, product: "digital-product", product_slug: p.slug, immediate_access_consent: "yes" };
      const session = await createCheckoutSession(
        {
          mode: "payment",
          line_items: [{ price: productPriceId(p), quantity: 1 }],
          ...localCurrency,
          success_url: `${origin}/api/products/confirm?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/resources/${p.slug}?checkout=cancelled`,
          allow_promotion_codes: true,
          invoice_creation: { enabled: true, invoice_data: { metadata: productMeta } },
          ...(process.env.STRIPE_AUTOMATIC_TAX === "true" ? { automatic_tax: { enabled: true } } : {}),
          metadata: productMeta,
        },
        config,
      );
      return NextResponse.json({ ok: true, url: session.url }, { headers: { "Cache-Control": "no-store" } });
    }

    if (!listingSellable(config)) return fail("Featured listings aren't open for payment yet, so no payment was taken.", 503);
    if (!verifyListing(input.listing, input.sig, config.entitlementSecret!)) return fail("This payment link isn't valid. Please use the link we sent after verifying your listing.", 403);
    const listingMeta = { ...metadata, listing: input.listing };
    const session = await createCheckoutSession(
      {
        mode: "subscription",
        line_items: [{ price: config.prices.listingFeatured, quantity: 1 }],
        ...localCurrency,
        success_url: `${origin}/for-businesses/upgrade?listing=${encodeURIComponent(input.listing)}&status=success`,
        cancel_url: `${origin}/for-businesses/upgrade?listing=${encodeURIComponent(input.listing)}&sig=${encodeURIComponent(input.sig)}&status=cancelled`,
        allow_promotion_codes: true,
        billing_address_collection: "required",
        tax_id_collection: { enabled: true },
        ...(process.env.STRIPE_AUTOMATIC_TAX === "true" ? { automatic_tax: { enabled: true } } : {}),
        subscription_data: { metadata: listingMeta },
        metadata: listingMeta,
      },
      config,
    );
    return NextResponse.json({ ok: true, url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("checkout failed", e instanceof StripeError ? `${e.status} ${e.message}` : e);
    return fail("We couldn't start checkout just now. No payment was taken. Please try again shortly.", 502);
  }
}
