import type { Professional } from "@/content/directory";
import { MODE_LABELS, bookingRequestSchema, formatInZone, isBookableSlot, sessionFee, type BookingRequest } from "./booking";
import { emailConfigured, emailHtml, sendEmail } from "./email";

export type BookingCheck = { ok: true; request: BookingRequest; pro: Professional } | { ok: false; status: number; message: string; errors?: Record<string, string> };

/** Validate a booking request against the professional's published availability. */
export function checkBooking(input: unknown, findPro: (slug: string) => Professional | undefined, now = new Date()): BookingCheck {
  const parsed = bookingRequestSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[i.path.join(".")] ??= i.message;
    return { ok: false, status: 422, message: "Please check the highlighted fields.", errors };
  }
  const r = parsed.data;
  const pro = findPro(r.professional);
  if (!pro || !pro.availability || !pro.bookingEmail) return { ok: false, status: 404, message: "This professional isn't taking booking requests through NourishWell." };
  if (!pro.modes.includes(r.mode)) return { ok: false, status: 422, message: "Please choose a consultation type this professional offers." };
  if (!isBookableSlot(pro.availability, r.start, r.minutes, now)) return { ok: false, status: 409, message: "That time is no longer available. Please choose another." };
  return { ok: true, request: r, pro };
}

/** Email the professional (reply goes to the client) and send the client an acknowledgement. */
export async function deliverBooking(r: BookingRequest, pro: Professional, webhook?: string) {
  const proTz = pro.availability!.timezone;
  const clientTz = r.timezone ?? proTz;
  const when = formatInZone(r.start, proTz);
  const fee = sessionFee(pro.hourlyRate, r.minutes);
  const summary = [`When: ${when}${clientTz !== proTz ? ` (client's time: ${formatInZone(r.start, clientTz)})` : ""}`, `Length: ${r.minutes} minutes · ${MODE_LABELS[r.mode]}`, `At your rate: about ${fee.display}`];
  let delivered = false;
  if (emailConfigured() && pro.bookingEmail) {
    await sendEmail({
      to: pro.bookingEmail,
      replyTo: r.email,
      subject: `Booking request: ${r.name}, ${when}`,
      text: [`New booking request through NourishWell.`, ...summary, `Client: ${r.name} <${r.email}>${r.phone ? `, ${r.phone}` : ""}`, r.note ? `Note: ${r.note}` : "", "", "Reply to this email to confirm or suggest another time. Payment is arranged between you and the client."].filter(Boolean).join("\n"),
      html: emailHtml("New booking request", ["A client asked to book a session with you through NourishWell.", ...summary, `Client: ${r.name} (${r.email}${r.phone ? `, ${r.phone}` : ""})`, ...(r.note ? [`Their note: ${r.note}`] : []), "Reply to this email to confirm or suggest another time. Payment is arranged between you and the client."]),
    });
    await sendEmail({
      to: r.email,
      replyTo: pro.bookingEmail,
      subject: `Your request to ${pro.name}`,
      text: `We've sent your request for ${formatInZone(r.start, clientTz)} (${r.minutes} minutes, ${MODE_LABELS[r.mode]}) to ${pro.name}. It isn't confirmed until ${pro.name} replies. The fee (about ${fee.display}) is paid directly to ${pro.name}.`,
      html: emailHtml("Your booking request was sent", [`We've sent your request for ${formatInZone(r.start, clientTz)} (${r.minutes} minutes, ${MODE_LABELS[r.mode]}) to ${pro.name}.`, `It isn't confirmed until ${pro.name} replies. The fee — about ${fee.display} at their hourly rate — is paid directly to them, not to NourishWell.`, "NourishWell lists verified professionals but doesn't provide medical care. In an emergency, contact your local emergency services."]),
    }).catch((e) => console.error("client acknowledgement failed", e));
    delivered = true;
  }
  if (webhook) {
    // Team record without the client's note (which may contain health details).
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "booking", data: { professional: pro.slug, start: r.start, minutes: r.minutes, mode: r.mode, clientEmail: r.email }, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok && !delivered) throw new Error(`Webhook responded ${res.status}`);
  }
  return delivered;
}
