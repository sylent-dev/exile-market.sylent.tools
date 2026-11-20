// Checks the red fluid of the grids (src/lib/grid-fluid.ts) in the Chromium of Playwright, on
// every page with a grid of the built site (dist/):
// - each grid gets its canvas, laid over it;
// - a mouse that moves over the first grid lights some of its lines;
// - with reduced motion, no grid gets a canvas.
// Run after `npm run build`: `node scripts/check-grid-fluid.mjs [dist]`.
import { chromium } from "playwright";
import urls from "../src/data/urls.json" with { type: "json" };
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);
const server = await serveDist(dist);
const browser = await chromium.launch();
const errors = [];

/* global document */
/** Whether a canvas of the page has any pixel that isn't transparent. */
const lit = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".grid-fluid canvas")].some((canvas) => {
      const { data } = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
      return false;
    }),
  );

for (const path of urls.pages) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(server.origin + path);
  const grids = await page.locator(".grid-zone, .grid-band").count();
  const layers = await page.locator(".grid-fluid canvas").count();
  if (grids === 0) {
    await page.close();
    continue;
  }
  if (layers !== grids) {
    errors.push(`${path}: ${grids} grids and ${layers} canvases of the fluid`);
  }
  const box = await page
    .locator(".grid-zone, .grid-band")
    .first()
    .boundingBox();
  const y = box.y + Math.min(box.height / 2, 120);
  for (let i = 0; i <= 12; i += 1) {
    await page.mouse.move(box.x + 300 + i * 30, y);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(100);
  if (!(await lit(page))) errors.push(`${path}: the mouse lights no line`);
  await page.close();

  const still = await browser.newPage({ reducedMotion: "reduce" });
  await still.goto(server.origin + path);
  if ((await still.locator(".grid-fluid").count()) > 0) {
    errors.push(`${path}: the fluid is there with reduced motion`);
  }
  await still.close();
}

await browser.close();
server.close();
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "The fluid runs on every grid under a mouse, and never with reduced motion.",
);
