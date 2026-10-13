#!/usr/bin/env node
/*
 * Builds "The NourishWell Meal-Planning Workbook" as print-ready PDFs.
 *
 *   node scripts/workbook/build-workbook.cjs
 *
 * Renders scripts/workbook/workbook.html (+ workbook.css) with the repo's
 * Playwright Chromium and writes:
 *   src/products/files/nourishwell-meal-planning-workbook-a4.pdf
 *   src/products/files/nourishwell-meal-planning-workbook-letter.pdf
 *
 * For each size it injects the Source Serif 4 @font-face rules (absolute
 * file:// URLs to src/assets/fonts) and the matching @page size, then checks
 * that no page overflows before printing.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const HTML = path.join(__dirname, "workbook.html");
const FONT_DIR = path.join(ROOT, "src", "assets", "fonts");
const OUT_DIR = path.join(ROOT, "src", "products", "files");

const SIZES = [
  { key: "a4", cssSize: "A4", file: "nourishwell-meal-planning-workbook-a4.pdf" },
  { key: "letter", cssSize: "letter", file: "nourishwell-meal-planning-workbook-letter.pdf" },
];

const WEIGHTS = [400, 600, 700];

function fontFaceCss() {
  return WEIGHTS.map((w) => {
    const file = path.join(FONT_DIR, `SourceSerif4-${w}.ttf`);
    if (!fs.existsSync(file)) throw new Error(`Missing font: ${file}`);
    return (
      `@font-face { font-family: "Source Serif 4"; font-style: normal; font-weight: ${w}; ` +
      `font-display: block; src: url("${pathToFileURL(file).href}") format("truetype"); }`
    );
  }).join("\n");
}

async function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const size of SIZES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(pathToFileURL(HTML).href, { waitUntil: "load" });
      await page.waitForFunction(() => window.__workbookReady === true);

      await page.evaluate((key) => {
        document.documentElement.classList.remove("size-a4", "size-letter");
        document.documentElement.classList.add(`size-${key}`);
      }, size.key);
      await page.addStyleTag({
        content: `${fontFaceCss()}\n@page { size: ${size.cssSize}; margin: 0; }`,
      });
      await page.emulateMedia({ media: "print" });

      // Make sure all three weights are loaded before printing.
      await page.evaluate(async (weights) => {
        await Promise.all(weights.map((w) => document.fonts.load(`${w} 12px "Source Serif 4"`)));
        await document.fonts.ready;
      }, WEIGHTS);
      const fontsOk = await page.evaluate((weights) =>
        weights.every((w) => document.fonts.check(`${w} 12px "Source Serif 4"`)), WEIGHTS);
      if (!fontsOk) throw new Error("Source Serif 4 did not load");

      // Layout check: nothing may overflow its page box.
      const report = await page.evaluate(() => {
        const issues = [];
        const pages = Array.from(document.querySelectorAll(".page"));
        pages.forEach((p, i) => {
          if (p.scrollHeight > p.clientHeight + 1) {
            issues.push(`page ${i + 1} (${p.id || "?"}) overflows by ${p.scrollHeight - p.clientHeight}px`);
          }
          const inner = p.getBoundingClientRect().right - parseFloat(getComputedStyle(p).paddingRight) + 1;
          for (const el of p.querySelectorAll(".head *, .body *, .foot *")) {
            if (el.getBoundingClientRect().right > inner) {
              issues.push(`page ${i + 1} (${p.id || "?"}): <${el.tagName.toLowerCase()}> runs past the right margin by ${Math.round(el.getBoundingClientRect().right - inner)}px (class "${el.className}")`);
              break;
            }
          }
          const body = p.querySelector(".body, .frame, .hero");
          if (!body) return;
          const limit = body.getBoundingClientRect().bottom + 1;
          for (const el of body.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            const box = el.matches(".grid, .grid > div, .panel, .row, .col, .lines, .checks, .cards, .card, .art, .steps");
            const clipped = box && el.clientHeight > 0 && el.scrollHeight - el.clientHeight > 2;
            if ((r.height > 0 && r.bottom > limit) || clipped) {
              const cls = typeof el.className === "string" ? el.className : el.tagName;
              issues.push(`page ${i + 1} (${p.id || "?"}): <${el.tagName.toLowerCase()} class="${cls}"> overflows (${el.scrollHeight - el.clientHeight}px, bottom ${Math.round(r.bottom - limit)}px)`);
              break;
            }
          }
        });
        return { count: pages.length, issues };
      });
      if (report.issues.length) {
        throw new Error(`[${size.key}] layout problems:\n  ${report.issues.join("\n  ")}`);
      }

      const out = path.join(OUT_DIR, size.file);
      await page.pdf({
        path: out,
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        tagged: true,
        outline: false,
      });
      await context.close();

      const bytes = fs.statSync(out).size;
      results.push({ size: size.key, pages: report.count, bytes, out });
      console.log(
        `${size.key.padEnd(6)} ${report.count} pages  ${(bytes / 1024).toFixed(0)} KB  ${path.relative(ROOT, out)}`
      );
    }
  } finally {
    await browser.close();
  }
  return results;
}

build().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
