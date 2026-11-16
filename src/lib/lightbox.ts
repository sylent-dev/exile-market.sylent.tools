// The lightbox of the home page, shared by the screens of the deck and the video: what it shows
// grows from its place on the page to the middle, and goes back there when it closes. Its look is
// in src/styles/lightbox.css. Only with a mouse: on a touch screen, two fingers zoom.

export const withMouse = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
);
export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

// What moves starts fast and slows down (--ease-draw), and leaves fast on its way back.
export const easeOut = getComputedStyle(document.documentElement)
  .getPropertyValue("--ease-draw")
  .trim();
const easeIn = "cubic-bezier(0.55, 0.06, 0.68, 0.19)";

// An animation cancelled on its way (the lightbox closed by the browser, a move cut short) ends
// there, without an error.
export const play = (
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) =>
  element.animate(keyframes, { fill: "both", ...options }).finished.then(
    () => undefined,
    (error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        throw error;
    },
  );

// The page doesn't scroll under the lightbox, and doesn't move when its scrollbar goes.
const lockScroll = (isLocked: boolean) => {
  const root = document.documentElement;
  root.style.paddingRight = isLocked
    ? `${window.innerWidth - root.clientWidth}px`
    : "";
  root.style.overflow = isLocked ? "hidden" : "";
};

// The move from a place on the page to the middle of the lightbox, about their centers.
const travel = (from: Element, to: Element) => {
  const page = from.getBoundingClientRect();
  const box = to.getBoundingClientRect();
  const x = page.left + page.width / 2 - (box.left + box.width / 2);
  const y = page.top + page.height / 2 - (box.top + box.height / 2);
  return `translate(${x}px, ${y}px) scale(${page.width / box.width})`;
};

interface Options {
  dialog: HTMLDialogElement;
  // What travels between the page and the middle of the lightbox.
  traveller: HTMLElement;
  // Its place on the page, which it leaves while it travels.
  origin: () => HTMLElement;
  // Before the lightbox opens, to fill it.
  prepare?: () => Promise<void> | void;
  // Once it is open.
  opened?: () => void;
  // Once it is closed, however it closed.
  closed?: () => void;
}

export const createLightbox = ({
  dialog,
  traveller,
  origin,
  prepare,
  opened,
  closed,
}: Options) => {
  const veil = dialog.querySelector(".lightbox-veil")!;
  // The buttons and texts, which fade in once the traveller has nearly landed.
  const parts = [...dialog.querySelectorAll("[data-lightbox-part]")];
  let busy = false;
  // A close asked while something moves (Esc during the opening), done once it ends.
  let closeAsked = false;
  // Kept at each opening: the close event, which the browser sends a moment after the dialog
  // closed, however it closed. A move waits for it before it lets the page go, so that a mouse
  // passing over the deck meanwhile doesn't change the card in front, nor a new opening start
  // before the page is put back.
  let shut = Promise.resolve();

  const fade = (from: number, to: number, options: KeyframeAnimationOptions) =>
    Promise.all(
      parts.map((part) =>
        play(part, [{ opacity: from }, { opacity: to }], options),
      ),
    );
  const stopAll = () => {
    for (const animation of dialog.getAnimations({ subtree: true }))
      animation.cancel();
  };
  // The place left while the traveller moves, remembered: the page may have changed its origin
  // before it comes back (another card in front of the deck).
  let left: HTMLElement | undefined;
  const away = (isAway: boolean) => {
    if (isAway) {
      left = origin();
      left.classList.add("is-away");
    } else {
      left?.classList.remove("is-away");
      left = undefined;
    }
  };

  // One move at a time: another one is dropped, except a close, which waits for it to end.
  const run = async (task: () => Promise<void>) => {
    if (busy) return;
    busy = true;
    try {
      await task();
    } finally {
      busy = false;
      if (closeAsked) {
        closeAsked = false;
        void close();
      }
    }
  };

  const open = () =>
    dialog.open
      ? Promise.resolve()
      : run(async () => {
          await prepare?.();
          lockScroll(true);
          dialog.showModal();
          shut = new Promise((resolve) =>
            dialog.addEventListener("close", () => resolve(), { once: true }),
          );
          if (!reducedMotion.matches) {
            const from = travel(origin(), traveller);
            away(true);
            void play(veil, [{ opacity: 0 }, { opacity: 1 }], {
              duration: 360,
              easing: "ease-out",
            });
            await Promise.all([
              fade(0, 1, { duration: 260, delay: 320, easing: "ease-out" }),
              play(traveller, [{ transform: from }, { transform: "none" }], {
                duration: 500,
                easing: easeOut,
              }).then(() => away(false)),
            ]);
          }
          // Closed by the browser on its way: the close event puts the page back.
          if (!dialog.open) {
            await shut;
            return;
          }
          stopAll();
          away(false);
          opened?.();
        });

  const close = (): Promise<void> => {
    if (!dialog.open) return Promise.resolve();
    if (busy) {
      closeAsked = true;
      return Promise.resolve();
    }
    return run(async () => {
      if (!reducedMotion.matches) {
        const to = travel(origin(), traveller);
        away(true);
        void fade(1, 0, { duration: 140, easing: "ease-in" });
        void play(veil, [{ opacity: 1 }, { opacity: 0 }], {
          duration: 340,
          delay: 40,
          easing: "ease-in",
        });
        await play(traveller, [{ transform: "none" }, { transform: to }], {
          duration: 380,
          easing: easeIn,
        });
      }
      // Unless the browser closed it on its way.
      if (dialog.open) dialog.close();
      await shut;
    });
  };

  // However it closes, the page comes back as it was.
  dialog.addEventListener("close", () => {
    closeAsked = false;
    stopAll();
    away(false);
    lockScroll(false);
    closed?.();
  });
  // The cross, or a click beside what it shows.
  dialog.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (
      target.closest('[data-lightbox-button="close"]') ||
      target.hasAttribute("data-lightbox-close")
    )
      void close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    void close();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    void close();
  });

  return {
    open,
    close,
    run,
    // The page holds still while the lightbox opens, is open or closes.
    isFrozen: () => busy || dialog.open,
  };
};
