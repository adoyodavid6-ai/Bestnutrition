import { afterEach, describe, expect, it, vi } from "vitest";
import type { Professional } from "@/content/directory";
import { checkBooking, deliverBooking } from "./booking-delivery";
import { billingConfig, usdToCents } from "./billing/config";
import { premiumOffers, proSignupOffer } from "./billing/offers";

const pro: Professional = {
  slug: "jane-doe",
  name: "Jane Doe",
  profession: "Registered Dietitian",
  credentials: [{ body: "HCPC", registrationNumber: "DT000", verifiedAt: "2026-10-01" }],
  specialties: [],
  languages: ["English"],
  locations: [{ city: "London", country: "UK" }],
  remote: true,
  bio: "",
  hourlyRate: { amount: 80, currency: "GBP" },
  availability: { timezone: "Europe/London", weekly: [{ day: 2, start: "09:00", end: "11:00" }], sessionMinutes: [60], minNoticeHours: 24, horizonDays: 14 },
  modes: ["video"],
  bookingEmail: "jane@example.com",
  verification: "verified",
  tier: "basic",
  promoted: false,
};
const now = new Date("2026-10-13T08:00:00Z");
const req = { professional: "jane-doe", start: "2026-10-20T08:00:00.000Z", minutes: 60, mode: "video", name: "Sam", email: "sam@example.com", consent: true, timezone: "America/New_York", note: "Meal planning help" };
const find = (s: string) => (s === pro.slug ? pro : undefined);

describe("pricing configuration", () => {
  it("uses the owner's USD list prices unless overridden", () => {
    expect(usdToCents(undefined, "37.99")).toBe(3799);
    expect(usdToCents("49.5", "37.99")).toBe(4950);
    expect(usdToCents("-3", "100")).toBe(10000);
    const c = billingConfig({});
    expect(c.usd).toEqual({ premiumMonthly: 3799, proSignup: 10000 });
    expect(c.adaptivePricing).toBe(true);
    expect(billingConfig({ STRIPE_ADAPTIVE_PRICING: "off" }).adaptivePricing).toBe(false);
  });

  it("offers Premium at US$37.99/month without a Stripe Price, and shows it before launch", async () => {
    const live = await premiumOffers(billingConfig({ STRIPE_SECRET_KEY: "sk_test_x", ENTITLEMENT_SECRET: "s".repeat(40) }));
    expect(live.sellable).toBe(true);
    expect(live.month).toMatchObject({ amount: 3799, currency: "usd", display: "$37.99", interval: "month" });
    const before = await premiumOffers(billingConfig({}));
    expect(before.sellable).toBe(false);
    expect(before.listMonthly.display).toBe("$37.99");
    expect(proSignupOffer(billingConfig({}))).toBeNull();
    expect(proSignupOffer(billingConfig({ STRIPE_SECRET_KEY: "sk_test_x", ENTITLEMENT_SECRET: "s".repeat(40) }))!.display).toBe("$100");
  });
});

describe("booking requests", () => {
  it("accept only published slots, modes and lengths", () => {
    expect(checkBooking(req, find, now).ok).toBe(true);
    expect(checkBooking({ ...req, professional: "nobody" }, find, now)).toMatchObject({ ok: false, status: 404 });
    expect(checkBooking({ ...req, mode: "phone" }, find, now)).toMatchObject({ ok: false, status: 422 });
    expect(checkBooking({ ...req, start: "2026-10-20T08:15:00.000Z" }, find, now)).toMatchObject({ ok: false, status: 409 });
    expect(checkBooking({ ...req, minutes: 30 }, find, now)).toMatchObject({ ok: false, status: 409 });
    expect(checkBooking({ ...req, consent: false }, find, now)).toMatchObject({ ok: false, status: 422 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("emails the professional (reply to client) and acknowledges the client; the webhook omits the note", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "NourishWell <hello@example.com>");
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return new Response("{}", { status: 200 });
    });
    const check = checkBooking(req, find, now);
    if (!check.ok) throw new Error("expected ok");
    await deliverBooking(check.request, check.pro, "https://hooks.example.com/b");
    const [toPro, toClient, hook] = calls;
    expect(toPro.body).toMatchObject({ to: ["jane@example.com"], reply_to: "sam@example.com" });
    expect(String(toPro.body.text)).toContain("£80");
    expect(String(toPro.body.text)).toContain("Meal planning help");
    expect(toClient.body).toMatchObject({ to: ["sam@example.com"], reply_to: "jane@example.com" });
    expect(String(toClient.body.text)).toMatch(/paid directly to Jane Doe/);
    expect(hook.url).toBe("https://hooks.example.com/b");
    expect(JSON.stringify(hook.body)).not.toContain("Meal planning help");
  });
});
