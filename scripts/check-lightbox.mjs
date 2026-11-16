// Checks that the lightboxes of the home page (src/lib/lightbox.ts) put the page back as it was,
// however they close: no card of the deck left hidden, the video back in its frame, the page free
// to scroll, and a lightbox that opens again. A card was lost once (owner, 2026-11-16): the mouse
// passed over another card between the end of the closing move and the close event, which the
// browser sends a moment later, so the card brought back was not the one hidden. That moment is
// made here on purpose, since a real mouse hits it only by chance. Run after `npm run build`:
// `node scripts/check-lightbox.mjs [dist]`.
import { chromium } from "playwright";
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);

/* global document, PointerEvent */

// What the page looks like once a lightbox has closed; an empty list when it is right.
const wrongs = (page) =>
  page.evaluate(() => {
    const found = [];
    document.querySelectorAll(".deck-card").forEach((card, index) => {
      if (card.classList.contains("is-away"))
        found.push(`card ${index + 1} of the deck hidden`);
    });
    if (!document.querySelector(".media-frame video"))
      found.push("the video out of its frame");
    if (document.documentElement.style.overflow)
      found.push("the page unable to scroll");
    for (const dialog of document.querySelectorAll("dialog"))
      if (dialog.open) found.push(`${dialog.getAttribute("aria-label")} open`);
    return found;
  });

// The next close of the deck's lightbox is followed, after the script lets go and before the
// close event, by the mouse passing over another card than the one in front.
const hoverWhileClosing = (page) =>
  page.evaluate(() => {
    const dialog = document.querySelector("[data-deck-lightbox]");
    const close = dialog.close.bind(dialog);
    dialog.close = () => {
      close();
      delete dialog.close;
      let ticks = 0;
      const later = () => {
        if ((ticks += 1) < 20) {
          queueMicrotask(later);
          return;
        }
        const other = document.querySelector(".deck-card:not(.is-active)");
        other.dispatchEvent(
          new PointerEvent("pointerover", {
            pointerType: "mouse",
            bubbles: true,
          }),
        );
      };
      queueMicrotask(later);
    };
  });

const { origin, close } = await serveDist(dist);
const browser = await chromium.launch();
const errors = [];
let cases = 0;

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  // Only the local server is reached.
  await context.route(
    (url) => url.origin !== origin,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`page error: ${error.message}`));
  await page.goto(`${origin}/`, { waitUntil: "load" });
  // The video is in sight and has a frame, so that its button shows.
  await page.locator("[data-video-enlarge]").waitFor();

  const card = page.locator(".deck-card.is-active");
  const enlarge = page.locator("[data-video-enlarge]");
  const deckCross = page.locator(
    '[data-deck-lightbox] [data-lightbox-button="close"]',
  );
  const settle = () => page.waitForTimeout(1000);

  const ways = [
    {
      name: "the deck closed by Esc",
      open: () => card.click(),
      close: () => page.keyboard.press("Escape"),
    },
    {
      name: "the deck closed by its cross",
      open: () => card.click(),
      close: () => deckCross.click(),
    },
    {
      name: "the deck closed by a click beside the screen",
      open: () => card.click(),
      close: () => page.mouse.click(40, 450),
    },
    {
      name: "the deck closed while the mouse passes over another card",
      open: () => card.click(),
      close: async () => {
        await hoverWhileClosing(page);
        await page.keyboard.press("Escape");
      },
    },
    {
      name: "the deck closed by Esc during its opening",
      open: () => card.click(),
      close: () => page.keyboard.press("Escape"),
      early: true,
    },
    {
      name: "the video closed by Esc",
      open: () => enlarge.click(),
      close: () => page.keyboard.press("Escape"),
    },
    {
      name: "the video closed by a click beside it",
      open: () => enlarge.click(),
      close: () => page.mouse.click(20, 450),
    },
    {
      name: "the video closed by the browser during its opening",
      open: () => enlarge.click(),
      close: () =>
        page.evaluate(() =>
          document.querySelector("[data-video-lightbox]").close(),
        ),
      early: true,
    },
  ];

  for (const way of ways) {
    cases += 1;
    const target = way.name.startsWith("the deck") ? card : enlarge;
    await target.scrollIntoViewIfNeeded();
    await way.open();
    await page.waitForTimeout(way.early ? 120 : 1000);
    await way.close();
    await settle();
    for (const wrong of await wrongs(page))
      errors.push(`${way.name}: ${wrong}`);
    // It opens again, and closes.
    await target.scrollIntoViewIfNeeded();
    await way.open();
    await settle();
    const opened = await page.evaluate(
      () => document.querySelectorAll("dialog[open]").length,
    );
    if (opened !== 1) errors.push(`${way.name}: it doesn't open again`);
    await page.keyboard.press("Escape");
    await settle();
  }
  await context.close();
} finally {
  await browser.close();
  close();
}

if (errors.length > 0) {
  console.error(
    `A lightbox of the home page doesn't put the page back:\n- ${errors.join("\n- ")}`,
  );
  process.exit(1);
}
console.log(`The lightboxes put the page back in ${cases} ways of closing.`);
