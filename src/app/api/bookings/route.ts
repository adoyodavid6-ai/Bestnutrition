import { NextResponse, type NextRequest } from "next/server";
import { publishedProfessionals } from "@/content/directory";
import { checkBooking, deliverBooking } from "@/lib/booking-delivery";
import { emailConfigured } from "@/lib/email";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * Booking requests. Validated against the professional's published availability, then emailed to
 * the professional (and acknowledged to the client). No payment is taken: clients pay the
 * professional directly. Without email delivery configured, the request is refused honestly.
 */
export async function POST(req: NextRequest) {
  if (rateLimited(`booking:${clientIp(req.headers)}`, 6, 60 * 60 * 1000)) return NextResponse.json({ ok: false, message: "Too many requests. Please try again later." }, { status: 429 });
  const body = await req.json().catch(() => null);
  if (body && typeof body.company_website === "string" && body.company_website) return NextResponse.json({ ok: true, message: "Thank you." });
  const check = checkBooking(body, (slug) => publishedProfessionals().find((p) => p.slug === slug));
  if (!check.ok) return NextResponse.json({ ok: false, message: check.message, errors: check.errors }, { status: check.status });
  if (!emailConfigured()) {
    return NextResponse.json({ ok: false, configured: false, message: "Booking requests can't be delivered yet, so nothing was sent. Please contact the professional through their website for now." }, { status: 503 });
  }
  try {
    await deliverBooking(check.request, check.pro, process.env.BOOKINGS_WEBHOOK_URL?.trim() || undefined);
  } catch (e) {
    console.error("booking delivery failed", e);
    return NextResponse.json({ ok: false, message: "We couldn't send your request just now. Please try again shortly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: `Your request has gone to ${check.pro.name}. It isn't confirmed until they reply by email — check your inbox (and spam folder). You'll pay ${check.pro.name} directly.` });
}
