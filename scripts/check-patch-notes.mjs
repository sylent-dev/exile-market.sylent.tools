// Checks the patch notes (specs.md, Patch notes), which the build reads from the repository of the
// application beside this one (src/lib/patch-notes.ts), the same way:
// - every version released has its English note, without which the build leaves it out of the
//   page and still publishes;
// - both pages of the built site show every version, with its anchor (/patch-notes/#v0.2.0);
// - every page with a header shows the number of the latest version, which leads to the patch
//   notes of its language.
// Run after `npm run build`, or on a build under a base: `node scripts/check-patch-notes.mjs
// <folder> <base>`.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import urls from "../src/data/urls.json" with { type: "json" };
import { latestVersion, patchNotes, problems } from "../src/lib/patch-notes.ts";

const [dist = "dist", base = ""] = process.argv.slice(2);
const pages = { en: "/patch-notes/", fr: "/fr/notes-de-version/" };
const errors = [...problems];

const read = (path) => {
  const file = join(dist, path, "index.html");
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
};

for (const [lang, path] of Object.entries(pages)) {
  const html = read(path);
  if (!html) {
    errors.push(`${path} is not built`);
    continue;
  }
  for (const { version } of patchNotes[lang]) {
    if (!html.includes(`id="v${version}"`)) {
      errors.push(`${path} has no version ${version}`);
    }
  }
}

if (!latestVersion) errors.push("no version released has its English note");
for (const path of urls.pages) {
  const html = read(path);
  if (!html) continue;
  const lang = html.match(/<html[^>]* lang="([^"]+)"/)?.[1];
  const link = `<a href="${base}${pages[lang]}" class="site-version"`;
  if (!html.includes(link) || !html.includes(`>v${latestVersion}</a>`)) {
    errors.push(
      `${path} doesn't show v${latestVersion} in its header, leading to ${pages[lang]}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `The patch notes show ${patchNotes.en.length} versions, the latest v${latestVersion}.`,
);
