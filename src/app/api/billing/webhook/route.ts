import { NextResponse, type NextRequest } from "next/server";
import { billingConfig } from "@/lib/billing/config";
import { verifyWebhookSignature } from "@/lib/billing/stripe";

const HANDLED = new Set(["checkout.session.completed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed"]);

/**
 * Duplicate-event protection. Stripe may deliver the same event more than once; each event id is
 * processed once per server instance, and the id is forwarded as an Idempotency-Key so the
 * receiving system can de-duplicate across instances too. Entitlements never depend on these
 * events (they're re-checked against Stripe), so a duplicate can't grant or remove access.
 */
const processed = new Map<string, number>();
const SEEN_TTL_MS = 3 * 24 * 3600 * 1000;
function alreadyProcessed(id: string, now = Date.now()) {
  for (const [k, t] of processed) if (now - t > SEEN_TTL_MS) processed.delete(k);
  return processed.has(id);
}

type StripeEvent = { id: string; type: string; created: number; livemode: boolean; data: { object: Record<string, unknown> } };

/**
 * Stripe webhook. Entitlements are re-checked against Stripe when they expire, so this endpoint
 * doesn't need a database to keep access correct; it verifies each event and forwards a short,
 * card-free summary to BILLING_EVENTS_WEBHOOK_URL (e.g. Slack/Zapier) for the team.
 */
export async function POST(req: NextRequest) {
  const config = billingConfig();
  if (!config.webhookSecret) return NextResponse.json({ ok: false, message: "Webhook not configured" }, { status: 503 });
  const payload = await req.text();
  if (!verifyWebhookSignature(payload, req.headers.get("stripe-signature"), config.webhookSecret)) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 400 });
  }
  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }
  if (typeof event.id !== "string" || !event.data?.object) return NextResponse.json({ ok: false, message: "Invalid event" }, { status: 400 });
  if (alreadyProcessed(event.id)) return NextResponse.json({ received: true, duplicate: true });
  if (!HANDLED.has(event.type) || !config.eventsWebhook) {
    processed.set(event.id, Date.now());
    return NextResponse.json({ received: true });
  }

  const o = event.data.object;
  const pick = (k: string) => (typeof o[k] === "string" || typeof o[k] === "number" || typeof o[k] === "boolean" ? o[k] : undefined);
  const metadata = (o.metadata ?? {}) as Record<string, string>;
  const summary = {
    id: event.id,
    type: event.type,
    livemode: event.livemode,
    created: new Date(event.created * 1000).toISOString(),
    object: {
      id: pick("id"),
      customer: pick("customer"),
      status: pick("status"),
      amount: pick("amount_paid") ?? pick("amount_total"),
      currency: pick("currency"),
      cancelAtPeriodEnd: pick("cancel_at_period_end"),
      product: metadata.product,
      listing: metadata.listing,
      campaign: metadata.attr_utm_campaign,
      source: metadata.attr_utm_source,
    },
  };
  try {
    const res = await fetch(config.eventsWebhook, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": event.id }, body: JSON.stringify({ type: "billing", data: summary }), signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`forward responded ${res.status}`);
    processed.set(event.id, Date.now());
  } catch (e) {
    // Ask Stripe to retry later rather than silently losing the notification.
    console.error("billing event forward failed", e);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ received: true });
}
