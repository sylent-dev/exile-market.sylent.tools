// Checks that no page of the built site (dist/) is wider than the screen, on a phone and on a
// computer. A block that runs past the right edge (a large faded word, a wide image) lets Chrome
// on Android widen the page to show it, which the build and linkinator can't see: only a browser
// that lays the page out does. Each page is loaded in the Chromium of Playwright, then scrolled to
// the bottom, since some blocks move with the scroll. It also fails on an element marked
// `data-one-line` (a large title) that takes more than one line or whose text is cut; a value
// gives the width of the screen from which it must hold (`data-one-line="345"`).
// Run after `npm run build`: `node scripts/check-overflow.mjs [dist]`. Install the browser once
// with `npx playwright install --only-shell chromium`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { chromium, devices } from "playwright";
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);

// The narrowest screen still met, the narrowest common Android one and a wider one; then a small
// and a large computer screen.
const phones = [320, 360, 412];
const desktops = [1024, 1440];

// The phones call themselves an iPhone, as a real phone tells the page what it is: the download
// area shows a phone its own sentence instead of the buttons (download-area.astro). A phone
// without JavaScript keeps the buttons, so the narrowest one is also loaded without it.
const phoneAgent = devices["iPhone 13 Mini"].userAgent;
const screens = [
  ...phones.map((width) => ({ width, phone: true, name: `${width} px` })),
  {
    width: phones[0],
    phone: true,
    javaScript: false,
    name: `${phones[0]} px without JavaScript`,
  },
  ...desktops.map((width) => ({ width, phone: false, name: `${width} px` })),
];

/**
 * Every page of the site, as its URL path, the not-found page (404.html) included: the redirect
 * pages are left out.
 */
const pagesOf = (folder) =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return pagesOf(path);
    const notFound = name === "404.html" && folder === dist;
    if (name !== "index.html" && !notFound) return [];
    if (/http-equiv=["']?refresh/i.test(readFileSync(path, "utf8"))) return [];
    if (notFound) return ["/404.html"];
    const parent = relative(dist, folder).split(sep).join("/");
    return [parent ? `/${parent}/` : "/"];
  });

const { origin, close } = await serveDist(dist);

// Scrolls the page down to the bottom and returns the largest width it reached. Each step jumps at
// once: a smooth scrolling would only start a scroll that the next step interrupts. The steps and
// the waits are driven from here, since a page without JavaScript runs no timer of its own; the
// functions given to page.evaluate run in the page, with the globals of the browser.
/* global document, getComputedStyle, innerHeight, scrollTo */
const widest = async (page) => {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const measure = () =>
    page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      step: innerHeight / 2,
    }));
  let { width, height, step } = await measure();
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(50);
    const reached = await measure();
    width = Math.max(width, reached.width);
    height = reached.height;
  }
  return width;
};

// The elements marked data-one-line that take more than one line or whose text is cut, at the
// widths where they must hold. An element kept on one line by CSS can't wrap: its text then runs
// past its box, so the text is measured, against the first ancestor that clips it. Runs in the
// page.
const wrapped = () =>
  [...document.querySelectorAll("[data-one-line]")].flatMap((element) => {
    const screen = document.documentElement.clientWidth;
    if (screen < Number(element.dataset.oneLine)) return [];
    const style = getComputedStyle(element);
    const line =
      parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    const lines = Math.round(element.getBoundingClientRect().height / line);
    const text = element.textContent.trim();
    if (lines > 1) return [`« ${text} » on ${lines} lines`];
    const range = document.createRange();
    range.selectNodeContents(element);
    let limit = screen;
    for (let box = element.parentElement; box; box = box.parentElement) {
      if (getComputedStyle(box).overflowX !== "visible") {
        limit = Math.min(limit, box.getBoundingClientRect().right);
        break;
      }
    }
    return range.getBoundingClientRect().right > limit
      ? [`« ${text} » cut at ${Math.round(limit)} px`]
      : [];
  });

const pages = pagesOf(dist);
if (pages.length === 0) {
  console.error(`No page in ${dist}/: build the site first.`);
  process.exit(1);
}
const browser = await chromium.launch();
const errors = [];

try {
  for (const { width, phone, javaScript = true, name } of screens) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
      deviceScaleFactor: phone ? 3 : 1,
      isMobile: phone,
      hasTouch: phone,
      javaScriptEnabled: javaScript,
      ...(phone && { userAgent: phoneAgent }),
    });
    // Only the local server is reached: a slow third-party script would fail the check.
    await context.route(
      (url) => url.origin !== origin,
      (route) => route.abort(),
    );
    // A few tabs at once, each taking the next page of the list. A page that fails to load, or
    // whose scripts throw, is reported with the others instead of stopping the check.
    const queue = [...pages];
    const tab = async () => {
      const page = await context.newPage();
      let current = "";
      page.on("pageerror", (error) => {
        errors.push(`${current}: script error at ${name}, ${error.message}`);
      });
      for (let path; (path = queue.shift());) {
        current = path;
        try {
          await page.goto(`${origin}${path}`, { waitUntil: "load" });
          const reached = await widest(page);
          if (reached > width) {
            errors.push(`${path}: ${reached} px wide on a screen of ${name}`);
          }
          for (const element of await page.evaluate(wrapped)) {
            errors.push(`${path}: ${element} at ${name}`);
          }
        } catch (error) {
          errors.push(`${path}: not checked at ${name}, ${error.message}`);
        }
      }
    };
    await Promise.all(Array.from({ length: 4 }, tab));
    await context.close();
  }
} finally {
  await browser.close();
  close();
}

if (errors.length > 0) {
  const report = errors.sort().join("\n- ");
  console.error(
    `Pages wider than the screen, elements on several lines, or pages not checked:\n- ${report}`,
  );
  process.exit(1);
}
console.log(
  `${pages.length} pages fit a screen of ${screens.map(({ name }) => name).join(", ")}.`,
);
