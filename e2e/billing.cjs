/**
 * End-to-end test of monetization and marketing flows against the mock Stripe API.
 *
 *   node e2e/mock-stripe.cjs &
 *   STRIPE_API_BASE=http://localhost:4242 STRIPE_SECRET_KEY=sk_test_mock \
 *   STRIPE_PRICE_PREMIUM_MONTHLY=price_premium_month STRIPE_PRICE_PREMIUM_YEARLY=price_premium_year \
 *   STRIPE_PRICE_LISTING_FEATURED=price_listing_month PREMIUM_TRIAL_DAYS=14 \
 *   ENTITLEMENT_SECRET=<32+ chars> STRIPE_WEBHOOK_SECRET=whsec_mock \
 *   BILLING_EVENTS_WEBHOOK_URL=http://localhost:4242/__events NEWSLETTER_WEBHOOK_URL=http://localhost:4242/__events \
 *   STRIPE_PRICE_PRODUCT_WORKBOOK=price_workbook RESEND_API_BASE=http://localhost:4242 \
 *   RESEND_API_KEY=re_test_mock EMAIL_FROM="NourishWell <hello@example.com>" \
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=<pw> npm run build && npm start
 *   (same env) node e2e/billing.cjs
 */
const { chromium } = require("playwright");
const { createHmac } = require("node:crypto");
const fs = require("node:fs");

const B = process.env.BASE_URL || "http://localhost:3000";
const MOCK = process.env.MOCK_STRIPE || "http://localhost:4242";
const SECRET = process.env.ENTITLEMENT_SECRET;
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET;
const ADMIN = { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD };
const SHOTS = process.env.SHOTS_DIR || ".e2e-shots";
let failed = 0;
const ok = (c, m) => {
  console.log(`${c ? "PASS" : "FAIL"}  ${m}`);
  if (!c) failed++;
};
const mac = (d) => createHmac("sha256", SECRET).update(d).digest("base64url");
const token = (e) => {
  const body = Buffer.from(JSON.stringify(e)).toString("base64url");
  return `${body}.${mac(`ent.${body}`)}`;
};
const mock = (path, body) => fetch(`${MOCK}${path}`, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined).then((r) => r.json());

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => localStorage.setItem("nw:consent", '"denied"'));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Attribution: first touch from a campaign link.
  await page.goto(`${B}/?utm_source=instagram&utm_medium=social&utm_campaign=launch`, { waitUntil: "networkidle" });
  const attr = await page.evaluate(() => JSON.parse(localStorage.getItem("nw:attribution")));
  ok(attr?.utm_source === "instagram" && attr.landing === "/", "first-touch attribution captured");

  // Pricing shows live prices from Stripe.
  await page.goto(`${B}/pricing`, { waitUntil: "networkidle" });
  const card = page.locator(".price-card.featured");
  ok((await card.textContent()).includes("$4.99"), "monthly price read from Stripe");
  ok((await card.textContent()).includes("Also billed in GBP"), "other currencies listed");
  await page.getByRole("button", { name: /Yearly/ }).click();
  ok((await card.textContent()).includes("$39.99"), "yearly price shown");
  ok(/save 33%/.test(await card.textContent()), "yearly saving computed");
  ok((await card.textContent()).includes("Planned — not yet included"), "roadmap features marked as not included");
  ok(/renewing automatically until you cancel/.test(await card.textContent()), "auto-renewal disclosed before payment");
  await page.screenshot({ path: `${SHOTS}/billing-pricing.png`, fullPage: true });
  await page.getByRole("button", { name: /Monthly/ }).click();

  // Free browser: export is blocked server-side with an upgrade prompt.
  const free = await (await fetch(`${B}/api/premium/export`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "shopping-csv", items: [] }) })).status;
  ok(free === 402, `export without Premium is refused (${free})`);

  // Checkout → mock hosted page → confirm → account/billing.
  await page.getByRole("button", { name: /Start 14-day free trial|Get Premium/ }).click();
  await page.waitForURL(/\/account\/billing/, { timeout: 15000 });
  await page.waitForSelector("text=Welcome to Premium");
  ok(true, "checkout completes and returns to billing");
  ok((await page.locator("#plan-h").textContent()).includes("Premium"), "billing page shows Premium");
  await page.screenshot({ path: `${SHOTS}/billing-account.png`, fullPage: true });
  const sessions = Object.values(await mock("/__sessions"));
  const s = sessions[sessions.length - 1];
  ok(s.price === "price_premium_month" && s.trial === "14" && s.promo === "true", "checkout session: price, trial, promo codes");
  ok(s.metadata.product === "premium" && s.metadata.attr_utm_source === "instagram" && s.metadata.attr_utm_campaign === "launch", "checkout carries attribution metadata");
  ok(/^(monthly|yearly)-first$/.test(s.metadata["exp_pricing-default-interval"] || "") && /^(see-premium|name-the-benefit)$/.test(s.metadata["exp_upgrade-prompt-copy"] || ""), "checkout carries experiment variants");
  const cookie = (await ctx.cookies()).find((c) => c.name === "nw_ent");
  ok(cookie && cookie.httpOnly && cookie.sameSite === "Lax", "entitlement cookie is httpOnly");

  // Second checkout is refused while Premium.
  const again = await page.evaluate(() => fetch("/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ product: "premium", interval: "month" }) }).then((r) => r.status));
  ok(again === 409, "no double subscription");

  // Premium features: plan limit and exports.
  await page.goto(`${B}/meal-planner`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Build my meal plan/i }).first().click();
  await page.waitForSelector("#plan-name");
  ok((await page.locator('label[for="plan-select"]').textContent()).includes("/50"), "Premium raises the saved-plan limit");
  const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /^Spreadsheet/ }).click()]);
  const csvText = fs.readFileSync(await csv.path(), "utf8");
  ok(csvText.startsWith("Day,Meal,Recipe") && csvText.split("\r\n").length > 10, "plan CSV export");
  const [ics] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Add to calendar/ }).click()]);
  ok(/BEGIN:VEVENT/.test(fs.readFileSync(await ics.path(), "utf8")), "plan calendar export");

  // Manage billing opens the (mock) Stripe portal.
  await page.goto(`${B}/account/billing`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Manage billing" }).click();
  await page.waitForURL(/__portal\?customer=cus_test_1/);
  ok(true, "customer portal opens for this customer");

  // Expired token is re-checked with Stripe: cancelled → free, active → renewed.
  const expired = token({ plan: "premium", cus: "cus_test_1", sub: "sub_test_1", exp: Math.floor(Date.now() / 1000) - 10 });
  await mock("/__state", { subscription: "canceled" });
  let r = await fetch(`${B}/api/billing/entitlement`, { headers: { cookie: `nw_ent=${expired}` } });
  ok((await r.json()).plan === "free" && /nw_ent=;/.test(r.headers.get("set-cookie") || ""), "cancelled subscription ends access and clears cookie");
  await mock("/__state", { subscription: "active", cancelAtPeriodEnd: true });
  r = await fetch(`${B}/api/billing/entitlement`, { headers: { cookie: `nw_ent=${expired}` } });
  const renewed = await r.json();
  ok(renewed.plan === "premium" && renewed.cancelAtPeriodEnd && /nw_ent=[^;]+/.test(r.headers.get("set-cookie") || ""), "active subscription renews the token");
  await mock("/__state", { cancelAtPeriodEnd: false });
  const forged = Buffer.from(JSON.stringify({ plan: "premium", cus: "x", sub: "y", exp: 4e9 })).toString("base64url") + ".forged";
  r = await fetch(`${B}/api/billing/entitlement`, { headers: { cookie: `nw_ent=${forged}` } });
  ok((await r.json()).plan === "free", "forged cookie is rejected");

  // Webhook: verified, forwarded; bad signature refused.
  const evt = JSON.stringify({ id: "evt_1", type: "customer.subscription.deleted", created: Math.floor(Date.now() / 1000), livemode: false, data: { object: { id: "sub_test_1", customer: "cus_test_1", status: "canceled", metadata: { product: "premium", attr_utm_campaign: "launch" } } } });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", WHSEC).update(`${t}.${evt}`).digest("hex");
  r = await fetch(`${B}/api/billing/webhook`, { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}` }, body: evt });
  ok(r.status === 200, "signed webhook accepted");
  const events = await mock("/__events");
  ok(events.some((e) => e.type === "billing" && e.data.type === "customer.subscription.deleted" && e.data.object.campaign === "launch"), "billing event forwarded with campaign");
  r = await fetch(`${B}/api/billing/webhook`, { method: "POST", headers: { "stripe-signature": `t=${t},v1=deadbeef` }, body: evt });
  ok(r.status === 400, "unsigned webhook rejected");
  const forwardedBefore = (await mock("/__events")).filter((e) => e.data?.id === "evt_1").length;
  r = await fetch(`${B}/api/billing/webhook`, { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}` }, body: evt });
  const dup = await r.json();
  const forwardedAfter = (await mock("/__events")).filter((e) => e.data?.id === "evt_1").length;
  ok(r.status === 200 && dup.duplicate === true && forwardedAfter === forwardedBefore, "duplicate webhook event is not processed twice");

  // Remove Premium from this browser.
  page.once("dialog", (d) => d.accept());
  await page.goto(`${B}/account/billing`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Remove Premium from this browser" }).click();
  await page.waitForSelector("text=Your plan: Free");
  ok(true, "Premium removed from this browser");

  // Featured listing: admin generates a signed link, business pays.
  const admin = await browser.newContext({ httpCredentials: ADMIN });
  const ap = await admin.newPage();
  await ap.goto(`${B}/admin?listing=green-table-kitchen`, { waitUntil: "networkidle" });
  const link = await ap.locator("#pay-link").inputValue();
  ok(link.includes("/for-businesses/upgrade?listing=green-table-kitchen&sig="), "admin generates signed payment link");
  ok((await ap.locator("#subs-h").locator("..").textContent()).includes("$29"), "admin shows live listing price");
  await ap.screenshot({ path: `${SHOTS}/billing-admin.png`, fullPage: true });
  const path = new URL(link).pathname + new URL(link).search;
  await page.goto(`${B}${path.replace("green-table-kitchen", "other-listing")}`, { waitUntil: "networkidle" });
  ok(await page.getByText("This link isn't valid").isVisible(), "tampered payment link refused");
  await page.goto(`${B}${path}`, { waitUntil: "networkidle" });
  ok((await page.locator(".price-amount").textContent()).includes("$29"), "listing price shown");
  await page.getByRole("button", { name: /Continue to secure payment/ }).click();
  await page.waitForURL(/status=success/);
  ok(await page.getByText("payment received").isVisible(), "featured listing payment completes");
  const ls = Object.values(await mock("/__sessions")).pop();
  ok(ls.metadata.listing === "green-table-kitchen" && ls.price === "price_listing_month", "listing session metadata");

  // Lead magnet → newsletter with source + attribution; "make it mine" saves a plan.
  await page.goto(`${B}/free-meal-plan`, { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "British kitchen" }).click();
  ok((await page.locator("#starter-panel h2").first().textContent()).includes("British"), "kitchen tabs switch plans");
  await page.screenshot({ path: `${SHOTS}/lead-magnet.png`, fullPage: true });
  const form = page.locator(".lead-hero form");
  await form.locator('input[type="email"]').fill("reader@example.com");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Send me plans" }).click();
  await page.waitForSelector("text=you're on the list");
  const nl = (await mock("/__events")).find((e) => e.type === "newsletter");
  ok(nl && nl.data.source === "free-meal-plan" && nl.data.attribution?.utm_campaign === "launch", "newsletter sign-up carries source and attribution");
  const before = await page.evaluate(() => (JSON.parse(localStorage.getItem("nw:plans")) || []).length);
  await page.getByRole("button", { name: /Make it mine/ }).click();
  await page.waitForURL(/meal-planner/);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("nw:plans")).length);
  ok(after === before + 1, "starter plan saved into the planner");

  // Restore Premium in a different browser via an emailed link.
  const other = await browser.newContext();
  await other.addInitScript(() => localStorage.setItem("nw:consent", '"denied"'));
  const op = await other.newPage();
  await op.goto(`${B}/account/billing`, { waitUntil: "networkidle" });
  await op.fill("#restore-email", "nobody@example.com");
  await op.getByRole("button", { name: "Email me a sign-in link" }).click();
  await op.waitForSelector("text=If that email has an active Premium subscription");
  ok((await mock("/__emails")).length === 0, "unknown email: same message, no email sent");
  await op.fill("#restore-email", "buyer@example.com");
  await op.getByRole("button", { name: "Email me a sign-in link" }).click();
  await op.waitForSelector("text=If that email has an active Premium subscription");
  const mails = await mock("/__emails");
  const restoreMail = mails.find((m) => /sign-in link/.test(m.subject));
  ok(restoreMail && restoreMail.to[0] === "buyer@example.com", "restore email sent to the subscriber");
  const restoreUrl = restoreMail.text.match(/https?:\/\/\S+/)[0];
  await op.goto(restoreUrl);
  await op.waitForSelector("text=Premium is now on in this browser");
  ok((await op.locator("#plan-h").textContent()).includes("Premium"), "restore link turns on Premium in another browser");
  await op.goto(`${B}/api/billing/restore/confirm?token=${encodeURIComponent(restoreUrl.split("token=")[1])}x`);
  ok(op.url().includes("restore-expired"), "tampered restore link refused");
  await other.close();

  // Digital product: consent, checkout, verified delivery.
  await page.goto(`${B}/resources/meal-planning-workbook`, { waitUntil: "networkidle" });
  ok((await page.locator(".product-buy .price-amount").textContent()).includes("$9"), "product price read from Stripe");
  ok((await page.locator(".product-previews img").count()) === 4, "sample pages shown");
  await page.screenshot({ path: `${SHOTS}/product-page.png`, fullPage: true });
  await page.getByRole("button", { name: "Buy and download" }).click();
  ok(await page.getByText("confirm you want immediate access").isVisible(), "immediate-access consent required");
  await page.locator(".product-buy input[type=checkbox]").check();
  await page.getByRole("button", { name: "Buy and download" }).click();
  await page.waitForURL(/\/resources\/meal-planning-workbook\/download\?token=/);
  ok(await page.getByText("your download is ready").isVisible(), "download page after verified payment");
  const ps = Object.values(await mock("/__sessions")).pop();
  ok(ps.mode === "payment" && ps.metadata.product_slug === "meal-planning-workbook" && ps.metadata.immediate_access_consent === "yes" && ps.invoice === "true", "one-time checkout with consent and invoice");
  const dlHref = await page.locator("a", { hasText: "Download A4 PDF" }).getAttribute("href");
  r = await page.request.get(`${B}${dlHref}`);
  const pdf = await r.body();
  ok(r.status() === 200 && pdf.subarray(0, 4).toString() === "%PDF" && pdf.length > 100000, `A4 PDF delivered (${pdf.length} bytes)`);
  r = await page.request.get(`${B}${dlHref.replace("token=", "token=x")}`);
  ok(r.status() === 403, "tampered download token refused");
  r = await fetch(`${B}/products/files/nourishwell-meal-planning-workbook-a4.pdf`);
  ok(r.status === 404, "product files are not publicly reachable");
  ok((await mock("/__emails")).some((m) => /Your download/.test(m.subject) && m.to[0] === "buyer@example.com"), "download link emailed to buyer");

  // Revenue dashboard and monetization map (admin).
  await ap.goto(`${B}/admin/revenue`, { waitUntil: "networkidle" });
  const rev = await ap.locator("main").textContent().catch(() => ap.textContent("body"));
  ok(/Gross sales\s*\$33\.99/.test(rev) && /Refunds\s*\$4\.99/.test(rev) && /Stripe fees\s*\$1\.59/.test(rev), "revenue: gross, refunds, fees from Stripe");
  ok(/Net receipts\s*\$27\.41/.test(rev), "revenue: net receipts");
  ok(/Premium MRR\s*\$4\.99/.test(rev) && /Featured listing MRR\s*\$29/.test(rev), "revenue: MRR by stream");
  ok(/Premium \(monthly\)/.test(rev) && /GB/.test(rev) && /instagram \/ launch/.test(rev), "revenue: by product, market and source");
  ok(/pricing-default-interval/.test(rev) && /Not enough data yet/.test(rev), "revenue: experiments guarded by sample size");
  await ap.screenshot({ path: `${SHOTS}/admin-revenue.png`, fullPage: true });
  await ap.goto(`${B}/admin/monetization`, { waitUntil: "networkidle" });
  ok(/Built — needs configuration|Live/.test(await ap.textContent("body")) && (await ap.locator("#matrix-h").isVisible()), "monetization map renders");
  r = await ap.request.get(`${B}/admin/revenue-matrix.csv`);
  ok(r.status() === 200 && (await r.text()).startsWith("feature,routes,problem"), "matrix CSV export");
  ok((await fetch(`${B}/admin/revenue-matrix.csv`)).status === 401, "matrix CSV requires admin login");

  // Cancelled checkout notice.
  await page.goto(`${B}/pricing?checkout=cancelled`, { waitUntil: "networkidle" });
  ok(await page.getByText("no payment was taken").first().isVisible(), "cancelled checkout notice");

  ok(errors.length === 0, `no page errors ${errors.join(" | ")}`);
  await browser.close();
  console.log(failed ? `\n${failed} failed` : "\nAll billing checks passed");
  process.exit(failed ? 1 : 0);
})();
