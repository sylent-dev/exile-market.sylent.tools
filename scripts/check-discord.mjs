// Checks that the link to Discord (discord-message.astro) ends whole on the home page, in both
// languages: its words come in by a clip that the script of the download area lifts once the
// message is in sight, and a mistake there (a class renamed, the script moved after the first
// paint) would leave « Join us on Discord » hidden while every other check stays green, the
// overflow check measuring the text without its clip. Each system of the download area is
// loaded (a computer, macOS and a phone, also a short one, where the message waits out of sight
// until scrolled to), then with reduced motion and without JavaScript, where it must
// show at once, and on paper before it was seen. Run after `npm run build`: `node scripts/check-discord.mjs [dist]`.
import { chromium, devices } from "playwright";
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);

// The longest the entrance may take, from the moment the message is in sight.
const ceiling = 6000;

/* global document, getComputedStyle, window */

const macAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const phone = devices["iPhone 13 Mini"];

const ways = [
  { name: "on a computer", options: {}, plays: true },
  { name: "on macOS", options: { userAgent: macAgent }, plays: true },
  {
    name: "on a phone",
    options: {
      viewport: { width: 360, height: 800 },
      userAgent: phone.userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
    plays: true,
  },
  // On a short screen, the message waits out of sight, under the video.
  {
    name: "on a short phone",
    options: {
      viewport: { width: 360, height: 480 },
      userAgent: phone.userAgent,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
    plays: true,
    paper: true,
  },
  { name: "with reduced motion", options: { reducedMotion: "reduce" } },
  { name: "without JavaScript", options: { javaScriptEnabled: false } },
];

// How the message stands: how many there are in the download area, its state, and what of it is
// hidden; an empty list of hidden parts when it is whole.
const state = (page) =>
  page.evaluate(() => {
    const messages = document.querySelectorAll(".download .discord-message");
    const message = messages[0];
    if (!message) return { count: 0 };
    const words = message.querySelector(".discord-words");
    const unread = message.querySelector(".discord-unread");
    const hidden = [];
    if (getComputedStyle(words).clipPath !== "none")
      hidden.push("its words clipped");
    if (
      !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(
        getComputedStyle(unread).transform,
      )
    )
      hidden.push("its red dot scaled");
    return {
      count: messages.length,
      waiting: message.classList.contains("is-waiting"),
      in: message.classList.contains("is-in"),
      hidden,
    };
  });

const { origin, close } = await serveDist(dist);
const browser = await chromium.launch();
const errors = [];
let cases = 0;
let papers = 0;

try {
  for (const path of ["/", "/fr/"]) {
    for (const way of ways) {
      const name = `${path} ${way.name}`;
      cases += 1;
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        ...way.options,
      });
      // Only the local server is reached.
      await context.route(
        (url) => url.origin !== origin,
        (route) => route.abort(),
      );
      // The observer of the entrance is held until paper is checked: at the first paint, the
      // headline still in its fallback font is shorter, and the message stands about 200 px
      // higher, in sight; laying the page out for paper wakes the observer too.
      if (way.paper)
        await context.addInitScript(() => {
          window.onPaper = true;
          const Observer = window.IntersectionObserver;
          window.IntersectionObserver = class extends Observer {
            constructor(callback, options) {
              super((entries, observer) => {
                if (!window.onPaper) callback(entries, observer);
              }, options);
            }
          };
        });
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        errors.push(`${name}: page error: ${error.message}`),
      );
      try {
        await page.goto(`${origin}${path}`, { waitUntil: "load" });
        const first = await state(page);
        if (first.count !== 1) {
          errors.push(`${name}: ${first.count} messages in the download area`);
          continue;
        }
        if (way.plays) {
          // Out of sight, the message waits; on paper, it shows whole all the same.
          if (!first.in && !first.waiting)
            errors.push(`${name}: no waiting state`);
          if (way.paper) {
            await page.emulateMedia({ media: "print" });
            papers += 1;
            for (const part of (await state(page)).hidden)
              errors.push(`${name}: on paper before it was seen, ${part}`);
            await page.emulateMedia({ media: "screen" });
            await page.evaluate(() => (window.onPaper = false));
          }
          await page
            .locator(".download .discord-message")
            .scrollIntoViewIfNeeded();
          await page.waitForFunction(
            () => {
              const message = document.querySelector(
                ".download .discord-message",
              );
              return (
                message.classList.contains("is-in") &&
                message
                  .getAnimations({ subtree: true })
                  .every((animation) => animation.playState === "finished")
              );
            },
            undefined,
            { timeout: ceiling },
          );
        } else if (first.waiting) {
          errors.push(`${name}: a waiting state, which nothing would lift`);
        }
        for (const part of (await state(page)).hidden)
          errors.push(`${name}: ${part}`);
      } catch (error) {
        errors.push(`${name}: ${error.message.split("\n")[0]}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  close();
}

if (errors.length > 0) {
  console.error(
    `The link to Discord doesn't end whole:\n- ${errors.join("\n- ")}`,
  );
  process.exit(1);
}
console.log(
  `The link to Discord ends whole in ${cases} ways of loading the home page, and on paper in ${papers}.`,
);
