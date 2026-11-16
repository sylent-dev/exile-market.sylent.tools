// Checks that the lightboxes of the home page (src/lib/lightbox.ts) put the page back as it was,
// however they close: no card of the deck left hidden, the video back in its frame, the page free
// to scroll, and a lightbox that opens again. A card was lost once (owner, 2026-11-16): the mouse
// passed over another card between the end of the closing move and the close event, which the
// browser sends a moment later, so the card brought back was not the one hidden. That moment is
// made here on purpose, since a real mouse hits it only by chance. Each way runs with the motion,
// then without it, as when the visitor asked to reduce motion. Run after `npm run build`:
// `node scripts/check-lightbox.mjs [dist]`.
import { chromium } from "playwright";
import { serveDist } from "./serve-dist.mjs";

const [dist = "dist"] = process.argv.slice(2);

// The longest a lightbox may take to open or close, its image decoded first.
const ceiling = 5000;

/* global document, window, PointerEvent */

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

// Waits until a lightbox is open (or none is), and nothing moves in them any more; once closed,
// a little longer, so that the close event the browser sends a moment later has come.
const still = async (page, isOpen) => {
  await page.waitForFunction(
    (wanted) => {
      const dialogs = [...document.querySelectorAll("dialog")];
      return (
        dialogs.filter((dialog) => dialog.open).length === (wanted ? 1 : 0) &&
        dialogs.every(
          (dialog) => dialog.getAnimations({ subtree: true }).length === 0,
        )
      );
    },
    isOpen,
    { timeout: ceiling },
  );
  if (!isOpen) await page.waitForTimeout(100);
};

// Waits until a lightbox is open and still moving: its opening.
const opening = (page) =>
  page.waitForFunction(
    () =>
      [...document.querySelectorAll("dialog[open]")].some((dialog) =>
        dialog
          .getAnimations({ subtree: true })
          .some((animation) => animation.playState === "running"),
      ),
    undefined,
    { timeout: ceiling, polling: 10 },
  );

// The next close of the deck's lightbox is followed, at each microtask until the close event, by
// the mouse passing over another card than the one in front: a script that let the deck go before
// that event would bring that card in front. `window.hovered` tells that it happened.
const hoverWhileClosing = (page) =>
  page.evaluate(() => {
    const dialog = document.querySelector("[data-deck-lightbox]");
    const close = dialog.close.bind(dialog);
    window.hovered = 0;
    dialog.close = () => {
      close();
      delete dialog.close;
      // Always the same card: the one in front would change at each pass.
      const other = document.querySelector(".deck-card:not(.is-active)");
      let closed = false;
      dialog.addEventListener("close", () => (closed = true), { once: true });
      const hover = (ticks) => {
        if (closed || ticks > 200) return;
        other.dispatchEvent(
          new PointerEvent("pointerover", {
            pointerType: "mouse",
            bubbles: true,
          }),
        );
        window.hovered += 1;
        queueMicrotask(() => hover(ticks + 1));
      };
      queueMicrotask(() => hover(0));
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
  await page.locator("[data-video-enlarge]").waitFor({ timeout: ceiling });

  const card = page.locator(".deck-card.is-active");
  const enlarge = page.locator("[data-video-enlarge]");
  const deckCross = page.locator(
    '[data-deck-lightbox] [data-lightbox-button="close"]',
  );

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
      hovers: true,
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

  for (const motion of ["with motion", "with reduced motion"]) {
    const reduced = motion !== "with motion";
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : null });
    // Without motion, nothing travels: there is no opening to cut short.
    for (const way of ways.filter(({ early }) => !(reduced && early))) {
      const name = `${way.name}, ${motion}`;
      cases += 1;
      try {
        const target = way.name.startsWith("the deck") ? card : enlarge;
        await target.scrollIntoViewIfNeeded();
        await way.open();
        if (way.early) await opening(page);
        else await still(page, true);
        await way.close();
        await still(page, false);
        if (way.hovers && (await page.evaluate(() => window.hovered)) === 0)
          errors.push(`${name}: the mouse never passed over another card`);
        for (const wrong of await wrongs(page))
          errors.push(`${name}: ${wrong}`);
        // It opens again, and closes.
        await target.scrollIntoViewIfNeeded();
        await way.open();
        await still(page, true);
        await page.keyboard.press("Escape");
        await still(page, false);
      } catch (error) {
        errors.push(`${name}: ${error.message.split("\n")[0]}`);
        // The next way starts from a closed page.
        await page.keyboard.press("Escape");
        await page.waitForTimeout(1000);
      }
    }
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
console.log(
  `The lightboxes put the page back in ${cases} ways of closing, with and without motion.`,
);
