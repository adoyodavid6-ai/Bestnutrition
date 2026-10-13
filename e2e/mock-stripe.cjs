/**
 * A tiny stand-in for the Stripe API, for end-to-end tests of the billing flow.
 * Start it, then run the app with STRIPE_API_BASE=http://localhost:4242.
 *
 *   node e2e/mock-stripe.cjs            # listens on :4242 (MOCK_STRIPE_PORT to change)
 *
 * Test hooks: POST /__state {"subscription":"canceled"} changes the subscription status;
 * GET /__events returns billing events forwarded by the app's webhook.
 */
const http = require("node:http");
const { URLSearchParams } = require("node:url");

const PORT = Number(process.env.MOCK_STRIPE_PORT || 4242);
const BASE = `http://localhost:${PORT}`;
const prices = {
  price_premium_month: { id: "price_premium_month", active: true, currency: "usd", unit_amount: 499, recurring: { interval: "month", interval_count: 1 }, currency_options: { usd: { unit_amount: 499 }, gbp: { unit_amount: 399 } } },
  price_premium_year: { id: "price_premium_year", active: true, currency: "usd", unit_amount: 3999, recurring: { interval: "year", interval_count: 1 } },
  price_listing_month: { id: "price_listing_month", active: true, currency: "usd", unit_amount: 2900, recurring: { interval: "month", interval_count: 1 } },
};
const state = { sessions: {}, subscription: "active", cancelAtPeriodEnd: false, events: [], portalSessions: 0 };
let n = 0;

const send = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};
const read = (req) => new Promise((r) => {
  let b = "";
  req.on("data", (c) => (b += c));
  req.on("end", () => r(b));
});

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, BASE);
    const body = await read(req);
    const auth = req.headers.authorization || "";
    if (url.pathname.startsWith("/v1/") && !auth.startsWith("Bearer sk_test_")) return send(res, 401, { error: { message: "Invalid API key" } });

    let m;
    if ((m = url.pathname.match(/^\/v1\/prices\/(.+)$/))) return prices[m[1]] ? send(res, 200, prices[m[1]]) : send(res, 404, { error: { message: "No such price" } });

    if (url.pathname === "/v1/checkout/sessions" && req.method === "POST") {
      const p = new URLSearchParams(body);
      const id = `cs_test_${++n}abcdef`;
      const session = {
        id,
        status: "open",
        mode: p.get("mode"),
        price: p.get("line_items[0][price]"),
        success_url: p.get("success_url"),
        cancel_url: p.get("cancel_url"),
        trial: p.get("subscription_data[trial_period_days]"),
        promo: p.get("allow_promotion_codes"),
        metadata: Object.fromEntries([...p.entries()].filter(([k]) => k.startsWith("metadata[")).map(([k, v]) => [k.slice(9, -1), v])),
      };
      state.sessions[id] = session;
      return send(res, 200, { id, url: `${BASE}/__checkout/${id}`, status: "open" });
    }
    if ((m = url.pathname.match(/^\/__checkout\/(.+)$/))) {
      // Simulates the hosted checkout page: "pays" and redirects to success_url.
      const s = state.sessions[m[1]];
      if (!s) return send(res, 404, {});
      s.status = "complete";
      res.writeHead(303, { location: s.success_url.replace("{CHECKOUT_SESSION_ID}", s.id) });
      return res.end();
    }
    if ((m = url.pathname.match(/^\/v1\/checkout\/sessions\/(.+)$/))) {
      const s = state.sessions[m[1]];
      if (!s) return send(res, 404, { error: { message: "No such session" } });
      return send(res, 200, { id: s.id, status: s.status, payment_status: "paid", mode: s.mode, customer: "cus_test_1", subscription: "sub_test_1", metadata: s.metadata });
    }
    if (url.pathname === "/v1/subscriptions/sub_test_1") {
      const end = Math.floor(Date.now() / 1000) + 30 * 86400;
      return send(res, 200, { id: "sub_test_1", customer: "cus_test_1", status: state.subscription, cancel_at_period_end: state.cancelAtPeriodEnd, items: { data: [{ current_period_end: end, price: { id: "price_premium_month" } }] } });
    }
    if (url.pathname === "/v1/billing_portal/sessions" && req.method === "POST") {
      state.portalSessions++;
      return send(res, 200, { url: `${BASE}/__portal?customer=${new URLSearchParams(body).get("customer")}` });
    }
    if (url.pathname === "/__portal") {
      res.writeHead(200, { "content-type": "text/html" });
      return res.end("<!doctype html><title>Mock portal</title><h1>Mock customer portal</h1>");
    }
    if (url.pathname === "/__state" && req.method === "POST") {
      const j = JSON.parse(body || "{}");
      if (j.subscription) state.subscription = j.subscription;
      if ("cancelAtPeriodEnd" in j) state.cancelAtPeriodEnd = j.cancelAtPeriodEnd;
      return send(res, 200, state);
    }
    if (url.pathname === "/__sessions") return send(res, 200, state.sessions);
    if (url.pathname === "/__events" && req.method === "POST") {
      state.events.push(JSON.parse(body));
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/__events") return send(res, 200, state.events);
    send(res, 404, { error: { message: `Mock has no route ${req.method} ${url.pathname}` } });
  })
  .listen(PORT, () => console.log(`mock stripe on ${BASE}`));
