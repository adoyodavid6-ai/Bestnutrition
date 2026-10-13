import { NextResponse, type NextRequest } from "next/server";
import { WEBHOOK_ENV, formSchemas, isFormType } from "@/lib/forms";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isFormType(type)) return NextResponse.json({ ok: false, message: "Unknown form." }, { status: 404 });

  if (rateLimited(`${type}:${clientIp(req.headers)}`, MAX_PER_WINDOW, WINDOW_MS)) {
    return NextResponse.json({ ok: false, message: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this field.
  if (typeof body.company_website === "string" && body.company_website.length > 0) {
    return NextResponse.json({ ok: true, delivered: false, message: "Thank you." });
  }

  const parsed = formSchemas[type].safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return NextResponse.json({ ok: false, message: "Please check the highlighted fields.", errors }, { status: 422 });
  }

  const webhook = process.env[WEBHOOK_ENV[type]];
  if (!webhook) {
    // Honest failure: we never pretend a submission was stored or sent.
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          type === "newsletter"
            ? "Our newsletter isn't connected to an email service yet, so we couldn't save your address. Nothing was stored. Please check back soon."
            : "This form isn't connected to our inbox yet, so your message wasn't sent and nothing was stored. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, data: parsed.data, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch {
    return NextResponse.json({ ok: false, message: "We couldn't deliver your submission just now. Please try again shortly." }, { status: 502 });
  }

  const messages = {
    newsletter: "Thanks — you're on the list. You can unsubscribe from any email.",
    contact: "Thanks — your message has been sent. We aim to reply within 5 working days.",
    listing: "Thanks — your application has been received. Listings appear only after verification.",
  } as const;
  return NextResponse.json({ ok: true, delivered: true, message: messages[type] });
}
