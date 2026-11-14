// The links that leave the site open in a new tab, so that the page stays open, and say so to
// screen readers only: nothing shows on the screen (owner, 2026-11-14; specs.md, Content). The
// download buttons stay in the tab, since they start a file without leaving the page.
// scripts/check-urls.mjs fails on an external link without both.
import { type Lang, ui } from "./i18n";

/** The attributes of a link that opens in a new tab. */
export const newTab = { target: "_blank", rel: "noopener" } as const;

/** What a screen reader hears at the end of such a link, in the language of the page. */
export const newTabNote = (lang: Lang) =>
  `<span class="visually-hidden"> (${ui(lang).newTab})</span>`;

/**
 * The same for the links of a text from the content files, which may hold a link to another site
 * (`<a href="https://…">`): they are written by hand, in that one form.
 */
export const withNewTabs = (html: string, lang: Lang) =>
  html.replace(
    /<a href="(https?:\/\/[^"]+)">(.*?)<\/a>/g,
    (_, url: string, text: string) =>
      `<a href="${url}" target="${newTab.target}" rel="${newTab.rel}">${text}${newTabNote(lang)}</a>`,
  );
