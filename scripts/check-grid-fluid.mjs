// Checks the red fluid of the grids (src/lib/grid-fluid.ts) in the Chromium of Playwright, on
// every page with a grid of the built site (dist/):
// - each grid gets its canvas, laid over it;
// - a mouse that moves over a grid lights some of its lines, on every grid of the page;
// - a finger lights nothing;
// - with reduced motion, no grid gets a canvas.
// Run after `npm run build`: `node scripts/check-grid-fluid.mjs [dist]`.
import { chromium } from "playwright";
import urls from "../src/data/urls.json" with { type: "json" };
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);
const server = await serveDist(dist);
const browser = await chromium.launch();
const errors = [];

/* global document, PointerEvent */
/** Whether the canvas of a grid of the page has any pixel that isn't transparent. */
const lit = (page, index) =>
  page.evaluate((index) => {
    const canvas = document.querySelectorAll(".grid-fluid canvas")[index];
    const { data } = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
    return false;
  }, index);

/** Moves a pointer across the middle of a grid, in sight. */
const sweep = async (page, grid, move) => {
  await grid.scrollIntoViewIfNeeded();
  const box = await grid.boundingBox();
  const y = box.y + Math.min(box.height / 2, 120);
  for (let i = 0; i <= 12; i += 1) {
    await move(box.x + 300 + i * 30, Math.max(1, y));
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(100);
};

// The pages, and the not-found page, which no link leads to.
for (const path of [...urls.pages, "/404.html"]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(server.origin + path);
  const grids = page.locator(".grid-zone, .grid-band");
  const count = await grids.count();
  if (count === 0) {
    await page.close();
    continue;
  }
  const layers = await page.locator(".grid-fluid canvas").count();
  if (layers !== count) {
    errors.push(`${path}: ${count} grids and ${layers} canvases of the fluid`);
  }

  // A finger first, on the first grid, while nothing is lit yet.
  await sweep(page, grids.first(), (x, y) =>
    page.evaluate(
      ([x, y]) =>
        document.dispatchEvent(
          new PointerEvent("pointermove", {
            pointerType: "touch",
            clientX: x,
            clientY: y,
            bubbles: true,
          }),
        ),
      [x, y],
    ),
  );
  if (await lit(page, 0)) errors.push(`${path}: a finger lights the grid`);

  for (let index = 0; index < count; index += 1) {
    await sweep(page, grids.nth(index), (x, y) => page.mouse.move(x, y));
    if (!(await lit(page, index))) {
      errors.push(`${path}: the mouse lights no line of grid ${index + 1}`);
    }
  }
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
