# The NourishWell Meal-Planning Workbook

Source for the printable workbook sold/given away as a digital product.

| File | Purpose |
| --- | --- |
| `workbook.html` | Page content and structure. The four weekly sections come from one `<template>`; a small inline script expands them, draws writing lines, tables and recipe cards, and fills in page numbers, footers and the contents page. |
| `workbook.css` | Print styles: brand colours, one serif family (Source Serif 4), fixed-size page boxes. |
| `build-workbook.cjs` | Renders the HTML with Playwright Chromium and writes the PDFs. |

## Regenerate

From the repo root:

```sh
node scripts/workbook/build-workbook.cjs
```

Outputs:

- `src/products/files/nourishwell-meal-planning-workbook-a4.pdf` (A4)
- `src/products/files/nourishwell-meal-planning-workbook-letter.pdf` (US Letter)

Requirements: the repo's `playwright` dev dependency and an installed Chromium
(set `PLAYWRIGHT_BROWSERS_PATH` if browsers live outside the default cache).
No dev server is needed; the page is loaded straight from disk.

## How it works

- For each size the script adds `class="size-a4"` or `class="size-letter"` to `<html>`
  and injects `@page { size: A4 | letter; margin: 0 }` plus the `@font-face`
  rules, which point at `src/assets/fonts/SourceSerif4-{400,600,700}.ttf` via
  absolute `file://` URLs. Chromium subsets the fonts when printing.
- Every `.page` is a fixed-size box (`height: sheet height - 1px`,
  `break-after: page`), so each section starts on a new sheet and tables can
  never split mid-row. Tables and writing lines stretch to fill the page, so
  the same markup suits both A4 and the shorter Letter sheet.
- Before printing, the script fails if any page, table, panel or header runs
  past its box, so layout regressions show up as a build error.

## Editing tips

- Use only characters covered by Source Serif 4 (Latin, common punctuation,
  arrows); anything else would fall back to another font. Check with
  `pdffonts <file>.pdf`, which should list only `SourceSerif4-*`.
- Don't use `font-style: italic`: there is no italic file, so Chromium would
  synthesise one.
- Preview pages with `pdftoppm -r 60 -png <file>.pdf out/page`.
- Content rules: no statistics, testimonials, medical or weight-loss claims,
  calorie targets, brand names, prices or URLs.
