/**
 * Transactional email through Resend's HTTP API (no SDK). If RESEND_API_KEY or EMAIL_FROM is
 * missing, `emailConfigured()` is false and callers must tell the user honestly.
 */
export function emailConfig(env: Record<string, string | undefined> = process.env) {
  return {
    apiKey: env.RESEND_API_KEY?.trim() || undefined,
    from: env.EMAIL_FROM?.trim() || undefined,
    apiBase: env.RESEND_API_BASE?.trim() || "https://api.resend.com",
  };
}

export const emailConfigured = (c = emailConfig()) => Boolean(c.apiKey && c.from);

export async function sendEmail(msg: { to: string; subject: string; text: string; html: string }, c = emailConfig()) {
  if (!c.apiKey || !c.from) throw new Error("Email is not configured");
  const res = await fetch(`${c.apiBase}/emails`, {
    method: "POST",
    headers: { authorization: `Bearer ${c.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: c.from, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** A plain, accessible email layout in the brand serif. */
export function emailHtml(heading: string, paragraphs: string[], cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4efed;font-family:'Source Serif 4',Georgia,serif;color:#2C3E39">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:20px;margin:0 0 24px"><strong style="color:#0A2610">Nourish</strong><span style="color:#1f0e2f">Well</span></p>
<h1 style="font-size:24px;color:#1f0e2f;margin:0 0 16px">${esc(heading)}</h1>
${paragraphs.map((p) => `<p style="font-size:16px;line-height:1.6;margin:0 0 14px">${esc(p)}</p>`).join("")}
${cta ? `<p style="margin:24px 0"><a href="${esc(cta.url)}" style="background:#1f0e2f;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">${esc(cta.label)}</a></p><p style="font-size:13px;color:#5b6a66">Or paste this link into your browser: ${esc(cta.url)}</p>` : ""}
<p style="font-size:13px;color:#5b6a66;margin-top:32px">Eat Better. Feel Stronger. Live Well.</p>
</div></body></html>`;
}
