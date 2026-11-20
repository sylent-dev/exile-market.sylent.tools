// The patch notes of the application, read at the build from its repository, cloned beside this
// one (specs.md, Patch notes; docs/technical-choices.md, Patch notes): one file per version and
// language in docs/patch-notes/<lang>/v<version>.md, with its number and date in its front
// matter, then one line per change, `- **New**: …`. Only the versions released (a tag
// v<major>.<minor>.<patch>) appear, the latest first.
//
// Self-contained, with no import that Node can't run, so that scripts/check-patch-notes.mjs reads
// the same notes as the build.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import en from "../content/en/patch-notes.json" with { type: "json" };
import fr from "../content/fr/patch-notes.json" with { type: "json" };
import type { Lang } from "./i18n";

/** The repository of the application, beside this one, here and in CI. */
export const applicationDir = resolve("../rust-exile-market");
const notesDir = join(applicationDir, "docs", "patch-notes");

/** The kinds of change, in the order a version shows them, whatever the order of its note. */
const kinds = ["new", "changed", "fixed"] as const;
export type Kind = (typeof kinds)[number];

export interface Change {
  kind: Kind;
  /** The sentence after the tag, with a capital and the typography of the site. */
  text: string;
}

export interface Version {
  /** « 0.2.0 », without the v. */
  version: string;
  /** The date of its release, as written in its note: « 2026-11-19 ». */
  date: string;
  changes: Change[];
  /** False when the page shows the English note, for want of its own. */
  translated: boolean;
}

/** The words that lead a change in the notes of each language, also shown on the page. */
const tagWords: Record<Lang, Record<Kind, string>> = {
  en: en.tags,
  fr: fr.tags,
};

const release = /^v(\d+)\.(\d+)\.(\d+)$/;

/** Sorts « 0.10.0 » after « 0.9.0 », the latest first. */
const byLatest = (a: string, b: string) => {
  const parts = (version: string) => version.split(".").map(Number);
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < 3; i += 1) {
    if (x[i] !== y[i]) return (y[i] ?? 0) - (x[i] ?? 0);
  }
  return 0;
};

/** The versions released, from the tags of the application, the latest first. */
const releasedVersions = () =>
  execFileSync("git", ["-C", applicationDir, "tag", "--list", "v*"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter((tag) => release.test(tag))
    .map((tag) => tag.slice(1))
    .sort(byLatest);

/**
 * The typography of the site (CLAUDE.md, Language): the typographic apostrophe, and in French a
 * non-breaking space before « : », « ; », « ? », « ! » and inside « ».
 */
/** A non-breaking space, written as an escape: ESLint refuses it in the source. */
const nbsp = "\u00a0";

export const typeset = (text: string, lang: Lang) => {
  let result = text.charAt(0).toUpperCase() + text.slice(1);
  result = result.replaceAll("'", "’");
  if (lang === "fr") {
    result = result
      .replace(/ ([:;?!])/g, `${nbsp}$1`)
      .replace(/«[ \u00a0]?/g, `«${nbsp}`)
      .replace(/[ \u00a0]?»/g, `${nbsp}»`);
  }
  return result;
};

/** Reads one note; a note that doesn't follow the format fails the build, with its name. */
const readNote = (lang: Lang, version: string): Version | undefined => {
  const file = join(notesDir, lang, `v${version}.md`);
  if (!existsSync(file)) return undefined;
  const fail = (reason: string): never => {
    throw new Error(`Patch note ${file}: ${reason}`);
  };
  const source = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const [, head = "", body = ""] =
    source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ??
    fail("no front matter between two « --- » lines");
  const field = (name: string) =>
    head.match(
      new RegExp(`^${name}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, "m"),
    )?.[1];
  if (field("version") !== version) {
    fail(`its version isn't ${version}`);
  }
  const date = field("date") ?? fail("no date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    fail(`its date ${date} isn't YYYY-MM-DD`);
  const words = Object.entries(tagWords[lang]) as [Kind, string][];
  const changes = body
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const [, word = "", text = ""] =
        line.match(/^- \*\*(.+?)\*\*\s*:\s*(.+)$/) ??
        fail(`the line « ${line} » isn't « - **Tag**: text »`);
      const kind =
        words.find(([, tag]) => tag === word)?.[0] ??
        fail(
          `the tag « ${word} » isn't one of ${Object.values(tagWords[lang]).join(", ")}`,
        );
      return { kind, text: typeset(text.trim(), lang) };
    })
    .sort((a, b) => kinds.indexOf(a.kind) - kinds.indexOf(b.kind));
  if (changes.length === 0) fail("no change");
  return { version, date, changes, translated: true };
};

/** What the check of the build reports: the versions left out of the page. */
export const problems: string[] = [];

const readAll = (): Record<Lang, Version[]> => {
  if (!existsSync(notesDir)) {
    throw new Error(
      `No patch notes in ${notesDir}: clone sylent-dev/rust-exile-market beside this repository.`,
    );
  }
  const notes: Record<Lang, Version[]> = { en: [], fr: [] };
  for (const version of releasedVersions()) {
    const english = readNote("en", version);
    if (!english) {
      problems.push(
        `v${version} is released and has no English note: it isn't on the page.`,
      );
      continue;
    }
    notes.en.push(english);
    notes.fr.push(readNote("fr", version) ?? { ...english, translated: false });
  }
  // On GitHub Actions, a warning on the run of the nightly build, which still publishes.
  const prefix = process.env.GITHUB_ACTIONS ? "::warning::" : "";
  for (const problem of problems)
    console.warn(`${prefix}Patch notes: ${problem}`);
  return notes;
};

/** The versions of each language, the latest first. */
export const patchNotes = readAll();

/** The number of the latest version, which the header shows. */
export const latestVersion = patchNotes.en[0]?.version;
