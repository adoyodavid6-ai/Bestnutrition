const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR || require("path").join(__dirname, "..", ".e2e-shots");
require("fs").mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/status of (422|503|404)/.test(m.text()) && errors.push(m.text()));

  // Home
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  check("Home hero headline", (await page.textContent("h1")).includes("Feel Better Starts on"));
  await page.screenshot({ path: SHOTS + "/home-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Essential only" }).click();
  check("Consent banner dismissable", (await page.locator(".consent-banner").count()) === 0);

  // Recipe page: scaling, units, shopping, save
  await page.goto(BASE + "/recipes/ugali-with-sukuma-wiki", { waitUntil: "networkidle" });
  const firstQty = () => page.locator(".ingredient-list li .qty").first().textContent();
  check("Base quantity 400 g", (await firstQty()) === "400 g", await firstQty());
  await page.getByRole("button", { name: "More servings" }).click();
  check("Scaled to 5 servings → 500 g", (await firstQty()) === "500 g", await firstQty());
  await page.locator(".seg").first().getByRole("button", { name: "US" }).click();
  check("US units shows lb/oz", /lb|oz/.test(await firstQty()), await firstQty());
  await page.locator(".seg").first().getByRole("button", { name: "Metric" }).click();
  await page.getByRole("button", { name: "Add to shopping list" }).click();
  const shop = await page.evaluate(() => JSON.parse(localStorage.getItem("nw:shopping") || "[]"));
  check("Shopping list populated from recipe", shop.length > 3, `${shop.length} items`);
  check("Shopping qty scaled (maize 500 g)", shop.find((i) => i.key === "maize-flour|g")?.qty === 500);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  check("Saved recipe stored", (await page.evaluate(() => localStorage.getItem("nw:saved-recipes"))).includes("ugali"));
  check("Nutrition breakdown present", (await page.locator("text=How we calculated this").count()) === 1);
  await page.screenshot({ path: SHOTS + "/recipe-desktop.png", fullPage: false });

  // Shopping list
  await page.goto(BASE + "/shopping-list", { waitUntil: "networkidle" });
  const boxes = page.locator('.shop-item input[type="checkbox"]');
  await boxes.first().check();
  check("Check-off updates progress", (await page.textContent(".card strong")).startsWith("1 of"));
  await page.locator(".shop-item .price").first().fill("120");
  await page.selectOption("#currency", "KES");
  check("Price total updates", (await page.locator(".serif").last().textContent()).includes("120"), await page.locator(".serif").last().textContent());
  await page.fill("#new-item", "Tea leaves");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  check("Custom item added", (await page.locator("text=Tea leaves").count()) > 0);

  // Planner
  await page.goto(BASE + "/meal-planner", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Vegetarian" }).first().click();
  await page.locator("main").getByRole("button", { name: "Build my meal plan" }).last().click();
  await page.waitForSelector(".plan-day");
  check("Plan has 7 days", (await page.locator(".plan-day").count()) === 7);
  const entries = await page.locator(".plan-entry").count();
  check("Plan has ≥21 meals", entries >= 21, `${entries}`);
  const firstTitle = await page.locator(".plan-entry .title").first().textContent();
  const rep = page.locator('select[id^="rep-"]').first();
  const opt = await rep.locator("option").nth(1).getAttribute("value");
  await rep.selectOption(opt);
  const afterTitle = await page.locator(".plan-entry .title").first().textContent();
  check("Replace meal works", firstTitle !== afterTitle, `${firstTitle} → ${afterTitle}`);
  const monDinner = await page.locator(".plan-day").nth(0).locator(".plan-entry .title").nth(2).textContent();
  await page.locator(".plan-day").nth(0).locator('select[id^="mv-"]').nth(2).selectOption("1");
  const tueDinner = await page.locator(".plan-day").nth(1).locator(".plan-entry .title").nth(2).textContent();
  check("Move meal to Tuesday", monDinner === tueDinner, `${monDinner} / ${tueDinner}`);
  await page.locator(".plan-day").nth(0).getByRole("button", { name: "More servings" }).first().click();
  check("Servings adjust in plan", (await page.locator(".plan-day").nth(0).locator(".servings-control output").first().textContent()) === "3");
  const vegOk = await page.evaluate(() => {
    const plans = JSON.parse(localStorage.getItem("nw:plans"));
    return plans[0].prefs.diet === "vegetarian";
  });
  check("Plan persisted with prefs", vegOk);
  check("Batch-cooking ideas shown", (await page.locator("#batch-heading").count()) === 1);
  await page.screenshot({ path: SHOTS + "/planner-desktop.png", fullPage: false });
  await page.getByRole("button", { name: "Make shopping list" }).click();
  await page.waitForURL("**/shopping-list");
  const shop2 = await page.evaluate(() => JSON.parse(localStorage.getItem("nw:shopping") || "[]"));
  check("Plan → consolidated shopping list", shop2.length > 15, `${shop2.length} items`);
  check("Custom item kept after regeneration", shop2.some((i) => i.name === "Tea leaves"));
  check("Consolidation lists multiple recipes on an item", shop2.some((i) => i.recipes.length > 1));

  // Library filters
  await page.goto(BASE + "/recipes?diet=vegan", { waitUntil: "networkidle" });
  const veganCount = await page.locator(".recipe-card").count();
  await page.goto(BASE + "/recipes", { waitUntil: "networkidle" });
  const allCount = await page.locator(".recipe-card").count();
  check("Vegan filter narrows results", veganCount > 0 && veganCount < allCount, `${veganCount}/${allCount}`);
  await page.getByRole("button", { name: "Breakfast", exact: true }).click();
  await page.waitForURL(/meal=breakfast/);
  check("Meal chip updates URL + results", (await page.locator(".recipe-card").count()) < allCount);
  await page.getByRole("button", { name: "More filters" }).click();
  await page.selectOption("#f-ingredient", "eggs");
  await page.waitForURL(/ingredient=eggs/);
  check("Ingredient filter", (await page.locator(".recipe-card").count()) >= 1);

  // Search
  await page.goto(BASE + "/search?q=beans", { waitUntil: "networkidle" });
  check("Search returns results", (await page.locator("main ol li").count()) > 2);
  await page.goto(BASE + "/search?q=sukuma", { waitUntil: "networkidle" });
  check("Search matches regional ingredient names", (await page.locator("main ol li").count()) >= 1);

  // Newsletter (not configured)
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const form = page.locator("#news-h").locator("xpath=ancestor::section").locator("form");
  await form.locator('input[type="email"]').fill("not-an-email");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await page.waitForTimeout(500);
  check("Newsletter validates email", (await form.locator(".error").count()) > 0);
  await form.locator('input[type="email"]').fill("test@example.com");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Subscribe" }).click();
  await page.waitForTimeout(800);
  check("Newsletter honest 'not connected' message", (await form.textContent()).includes("isn't connected"));

  // Admin disabled without env
  const admin = await page.goto(BASE + "/admin");
  check("Admin disabled without credentials (404)", admin.status() === 404);

  // Account export & delete
  await page.goto(BASE + "/account", { waitUntil: "networkidle" });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Export my data/ }).click()]);
  const content = require("fs").readFileSync(await download.path(), "utf8");
  check("Data export contains plans", content.includes('"plans"'));
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /Delete all my data/ }).click();
  await page.waitForTimeout(300);
  check("Delete clears device data", (await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("nw:")).length)) === 0);

  // Keyboard: skip link
  await page.goto(BASE + "/recipes", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  check("Skip link is first focusable", (await page.evaluate(() => document.activeElement?.textContent)) === "Skip to main content");

  // 404
  const nf = await page.goto(BASE + "/recipes/does-not-exist");
  check("Unknown recipe → 404", nf.status() === 404);

  // Mobile screenshots
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mp = await m.newPage();
  await mp.goto(BASE + "/", { waitUntil: "networkidle" });
  await mp.evaluate(() => localStorage.setItem("nw:consent", '"denied"'));
  await mp.reload({ waitUntil: "networkidle" });
  await mp.screenshot({ path: SHOTS + "/home-mobile.png", fullPage: false });
  await mp.goto(BASE + "/recipes/canjeero-somali-pancakes", { waitUntil: "networkidle" });
  await mp.screenshot({ path: SHOTS + "/recipe-mobile.png", fullPage: false });
  await mp.getByRole("button", { name: "Open menu" }).click();
  await mp.screenshot({ path: SHOTS + "/menu-mobile.png" });
  check("Mobile no horizontal overflow", (await mp.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1);

  // Health condition page shot
  await page.goto(BASE + "/health-conditions/type-2-diabetes", { waitUntil: "networkidle" });
  await page.screenshot({ path: SHOTS + "/condition-desktop.png", fullPage: false });

  check("No console/page errors", errors.length === 0, errors.slice(0, 5).join(" | "));
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
  await browser.close();
  process.exitCode = results.every((r) => r.ok) ? 0 : 1;
})().catch((e) => {
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  console.error("SCRIPT ERROR", e);
  process.exit(1);
});
