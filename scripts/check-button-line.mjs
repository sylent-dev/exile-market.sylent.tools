// Checks that the red line of the outlined buttons (outline-button.astro) covers their border under
// the pointer. A button often sits between two pixels, and a border and a red line rounded to
// different pixels left a strip of white beside the line (owner, 2026-11-14). Each button of the
// home page, which holds the white and the grey border, is moved by a fraction of a pixel, hovered,
// and its edge read pixel by pixel: the red line keeps the green channel low, the white of the
// border raises it. Run after `npm run build`: `node scripts/check-button-line.mjs [dist]`.
import { chromium } from "playwright";
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);

const scales = [1, 1.25, 2];
const offsets = [0, 0.25, 0.5, 0.75];
// Measured on 2026-11-14: the red line and its glow stay at 40 or below in green, the white strip
// went from 124 to 189.
const limit = 48;
// The margin taken around the button in the screenshot, in CSS pixels.
const margin = 4;

/**
 * The highest green value along the four edges of the button, read in the page from a screenshot
 * of the button and its margin. The edges are given in CSS pixels from the corner of the
 * screenshot; the band read on each edge runs from 1 px outside to 2 px inside, where the red
 * line, half a pixel outside and one and a half inside, must cover everything.
 */
/* global document, Image */
const greenOnEdges = ({ png, scale, left, top, right, bottom }) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = reject;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, image.width, image.height);
      let green = 0;
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          // The middle of the device pixel, in CSS pixels.
          const cx = (x + 0.5) / scale;
          const cy = (y + 0.5) / scale;
          const within =
            cx > left - 1 && cx < right + 1 && cy > top - 1 && cy < bottom + 1;
          const onEdge =
            cx < left + 2 || cx > right - 2 || cy < top + 2 || cy > bottom - 2;
          if (within && onEdge) {
            green = Math.max(green, data[(y * image.width + x) * 4 + 1]);
          }
        }
      }
      resolve(green);
    };
    image.src = `data:image/png;base64,${png}`;
  });

const { origin, close } = await serveDist(dist);
const browser = await chromium.launch();
const errors = [];
let buttons = 0;

try {
  for (const scale of scales) {
    for (const offset of offsets) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: scale,
        // The red line drawn at once, without waiting for its animation.
        reducedMotion: "reduce",
      });
      // Only the local server is reached.
      await context.route(
        (url) => url.origin !== origin,
        (route) => route.abort(),
      );
      const page = await context.newPage();
      await page.goto(`${origin}/`, { waitUntil: "load" });
      await page.addStyleTag({
        content: `.outline-button { left: ${offset}px; }`,
      });
      const all = page.locator(".outline-button");
      buttons = await all.count();
      for (let index = 0; index < buttons; index += 1) {
        const button = all.nth(index);
        await button.hover();
        const box = await button.boundingBox();
        // The screenshot starts on a whole CSS pixel, so that the edges fall where they are said.
        const x = Math.floor(box.x) - margin;
        const y = Math.floor(box.y) - margin;
        const clip = {
          x,
          y,
          width: Math.ceil(box.x + box.width) + margin - x,
          height: Math.ceil(box.y + box.height) + margin - y,
        };
        const png = await page.screenshot({ clip });
        const green = await page.evaluate(greenOnEdges, {
          png: png.toString("base64"),
          scale,
          left: box.x - x,
          top: box.y - y,
          right: box.x + box.width - x,
          bottom: box.y + box.height - y,
        });
        if (green > limit) {
          const name = (await button.textContent()).trim();
          errors.push(
            `« ${name} »: green ${green} on its edge at a scale of ${scale}, moved by ${offset} px`,
          );
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  close();
}

if (buttons === 0) errors.push("no outlined button on the home page");
if (errors.length > 0) {
  console.error(
    `White or grey shows beside the red line of a button under the pointer:\n- ${errors.join("\n- ")}`,
  );
  process.exit(1);
}
console.log(
  `The red line covers the border of ${buttons} buttons at scales of ${scales.join(", ")}, moved by ${offsets.join(", ")} px.`,
);
