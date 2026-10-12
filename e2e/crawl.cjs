const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push({ url: page.url(), text: m.text() });
  });
  page.on("pageerror", (e) => errors.push({ url: page.url(), text: "PAGEERROR " + e.message }));

  const queue = ["/"];
  const seen = new Set(queue);
  const results = [];
  const titles = new Map();
  const descs = new Map();
  while (queue.length) {
    const path = queue.shift();
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const status = res ? res.status() : 0;
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      imgNoAlt: [...document.querySelectorAll("img:not([alt])")].length,
      svgImgNoLabel: [...document.querySelectorAll('svg[role="img"]:not([aria-label])')].length,
    }));
    results.push({ path, status, ...info, links: undefined });
    if (info.title) titles.set(info.title, [...(titles.get(info.title) || []), path]);
    if (info.desc) descs.set(info.desc, [...(descs.get(info.desc) || []), path]);
    for (const href of info.links) {
      if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
      const clean = href.split("#")[0].split("?")[0];
      if (!clean || seen.has(clean) || clean.startsWith("/api")) continue;
      seen.add(clean);
      queue.push(clean);
    }
  }
  const bad = results.filter((r) => r.status !== 200 || r.h1 !== 1 || r.overflow > 1 || r.imgNoAlt || r.svgImgNoLabel || !r.desc);
  console.log("Pages crawled:", results.length);
  console.log("Problems:", JSON.stringify(bad, null, 1));
  console.log("Duplicate titles:", JSON.stringify([...titles].filter(([, v]) => v.length > 1)));
  console.log("Duplicate descriptions:", JSON.stringify([...descs].filter(([, v]) => v.length > 1).map(([k, v]) => [k.slice(0, 50), v])));
  console.log("Console errors:", JSON.stringify(errors.slice(0, 30), null, 1));
  await browser.close();
  process.exitCode = bad.length || errors.length ? 1 : 0;
})();
