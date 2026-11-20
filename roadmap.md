# Roadmap

The steps chosen for the site described in [specs.md](specs.md), following [process.md](process.md). Each step is delivered in its own pull request, which checks its box. What is noted and not chosen yet lives in [backlog.md](backlog.md).

## Size of the project

One page (owner's choice on 2026-11-06, process.md, Size the project): short specifications, one wireframe, 2 styles in the mock-up, tokens written straight into `src/styles/tokens.css`, build, launch. The steps are split finely, each with its own pull request: the owner prefers that to larger ones.

## Timeline

The order is: the Windows test of the application, the page on its domain, the tag `v0.1.0`, the first stream with the tool. The tag is aimed between 2026-11-11 and 2026-11-15, and a week later is fine: quality comes before speed (owner, 2026-11-09). The first stream comes around the tag (owner, 2026-11-06). The placeholder stays online until the page goes live on the day of the tag; if the stream comes before the tag, the page goes live first, with « Coming soon » in place of the download buttons.

## Reference

Read only by the steps that need them:

- [Technical choices](docs/technical-choices.md): the stack, the commands and the main designs, with their reasons.
- [Branding](docs/branding.md): the brand assets, the visual identity and every design decision of the mock-up, with the tokens.
- [External services](docs/external-services.md): limits and terms of the services, and the risks accepted by the owner.
- [Roadmap archive](docs/roadmap-archive.md): the detail of the steps done, moved there once their pull request is merged.
- [Backlog](backlog.md): what is noted and not chosen yet, read when the next work is chosen.

## Steps

### Cycle 1: the site online

- [x] **0a. Project setup** ([#4](https://github.com/sylent-dev/exile-market.sylent.tools/pull/4)).
- [x] **0b. Languages** ([#5](https://github.com/sylent-dev/exile-market.sylent.tools/pull/5)).
- [x] **1. Specifications** ([#6](https://github.com/sylent-dev/exile-market.sylent.tools/pull/6)).
- [x] **2. Wireframe** ([#7](https://github.com/sylent-dev/exile-market.sylent.tools/pull/7)).
- [x] **3. Mock-up** ([#8](https://github.com/sylent-dev/exile-market.sylent.tools/pull/8), [#9](https://github.com/sylent-dev/exile-market.sylent.tools/pull/9)).
- [x] **4a. Skeleton and deployment** ([#10](https://github.com/sylent-dev/exile-market.sylent.tools/pull/10)).
- [x] **4b. The simple pages** ([#11](https://github.com/sylent-dev/exile-market.sylent.tools/pull/11)).
- [x] **4c. The home page, still** ([#12](https://github.com/sylent-dev/exile-market.sylent.tools/pull/12)).
- [x] **4d. The light motion** ([#13](https://github.com/sylent-dev/exile-market.sylent.tools/pull/13)).
- [x] **4e. The video** ([#14](https://github.com/sylent-dev/exile-market.sylent.tools/pull/14)).
- [x] **4f. The burst and the statistics** ([#15](https://github.com/sylent-dev/exile-market.sylent.tools/pull/15)).
- [x] **4g. The icon** ([#16](https://github.com/sylent-dev/exile-market.sylent.tools/pull/16)).
- [x] **5a. The final images** ([#21](https://github.com/sylent-dev/exile-market.sylent.tools/pull/21)).
- [x] **5b. The site on its domain** ([#22](https://github.com/sylent-dev/exile-market.sylent.tools/pull/22)).
- [x] **5b2. The legal notice without personal details** ([#23](https://github.com/sylent-dev/exile-market.sylent.tools/pull/23)).
- [x] **5b3. The new username** ([#24](https://github.com/sylent-dev/exile-market.sylent.tools/pull/24)).
- [x] **5c. The downloads open** ([#25](https://github.com/sylent-dev/exile-market.sylent.tools/pull/25)).
- [x] **Fix. The border of the buttons under the pointer** ([#26](https://github.com/sylent-dev/exile-market.sylent.tools/pull/26)).
- [x] **5d. The donation banner** ([#27](https://github.com/sylent-dev/exile-market.sylent.tools/pull/27)).
- [x] **5d2. External links in a new tab** ([#28](https://github.com/sylent-dev/exile-market.sylent.tools/pull/28)).
- [ ] **5e. The professional legal notice**: once the domiciliation address has come through (requested by the owner on 2026-11-14), the legal notice follows article 1-1, I, since the donations are revenue of the owner's individual business: the publisher as a professional, the domiciliation address and the other items of I, without the owner's home address, checked again on Légifrance; `specs.md` (Contact details and legal information) and `docs/external-services.md` (Legal notice) follow. Tools: specifications, build.
- [x] **5f. The screens in a lightbox** ([#29](https://github.com/sylent-dev/exile-market.sylent.tools/pull/29)).
- [x] **5g. The video: click to pause, and in the lightbox** ([#30](https://github.com/sylent-dev/exile-market.sylent.tools/pull/30)).
- [x] **Fix. A card of the deck lost after the lightbox** ([#31](https://github.com/sylent-dev/exile-market.sylent.tools/pull/31)).
- [ ] **5h. The patch notes**: a page with the notes of each version of the application, in both languages, before Path of Exile 2 1.0 (2026-12-11); chosen from the backlog by the owner on 2026-11-18. A new page type with new addresses, so four steps:
  - [x] **5h1. Specifications** ([#33](https://github.com/sylent-dev/exile-market.sylent.tools/pull/33)).
  - [x] **5h2. Wireframe** ([#34](https://github.com/sylent-dev/exile-market.sylent.tools/pull/34)).
  - [x] **5h3. Mock-up** ([#35](https://github.com/sylent-dev/exile-market.sylent.tools/pull/35)).
  - [ ] **5h4. The page**: split in two pull requests by the owner on 2026-11-20, the page first, since it has a deadline. Tools: build, code review.
    - [ ] **5h4a. The page**: the notes of the application read at build time (only the released versions, the French typography, the line of a version not translated yet), `/patch-notes/` and `/fr/notes-de-version/` along the timeline of the mock-up, the number of the latest version in the header, the application checked out in CI and in the deployment, the nightly build, and their checks. Depends on: 5h3.
    - [ ] **5h4b. The red fluid**: the fluid of sylent.art (`src/scripts/grid-fluid.ts` there) on every grid of the site in place of the red light, never with reduced motion, and its check. Depends on: 5h4a.
- [ ] **6. Retrospective**: the lessons in `process.md` (and in the template when they apply to every website), the backlog sorted, the memory moved to the files. To talk over with the owner: the table of a code review summary and its priority column (`CLAUDE.md`, Code review), found missing on 2026-11-09, and carrying that rule to the template; the template `sylent-dev/ts-astro-static-website-template` still naming `aunimhsn`: its branch `docs/new-username` is pushed, its pull request to open once its pull request 14 is merged (2026-11-14); making the capture and the render of the videos a skill, to refine then (owner, 2026-11-09); the Launch of `process.md`, written for an apex domain: a subdomain takes one `CNAME` without the proxy of Cloudflare, GitHub asks for the custom domain before the DNS record, and a certificate that doesn't start after several minutes starts once the domain is removed and set again (2026-11-13). Tool: retrospective.

The steps may be split into sub-steps when a pull request grows too large. When no step is left, Claude Code proposes the next items of the backlog to the owner.

## Needed in rust-exile-market

Done in the application's repository, before its tag, and not by a pull request here:

- The copy to the system clipboard (Copy whisper, Copy the log of the bug report), found broken on 2026-11-06: fixed by its pull requests 174 and 175, the paste check of the owner left to the Windows guides of its step 17f.
- The icon chosen at step 4g of this page, before the tag: its step 17a2 (`roadmap.md` of the application), so that a player finds the same icon in the taskbar.
- The Windows alert test, on a fresh download of the release archive, reading the state of Smart App Control: on 2026-11-06, the first launch showed a dialog with only an OK button (blocked because the publisher couldn't be verified, Microsoft will review the application), and the second launch ran normally. The cause is unknown; the page says only what is observed (`specs.md`, Why does Windows show an alert?). Done by the owner on 2026-11-08: the alert shows about one time in two; to refine with the feedback of players.
- Two improvements decided by the owner on 2026-11-06, not blockers, to write in its roadmap: the name of the orb under the pointer in the price block (step 21, with a wireframe and a mock-up first); a setting to close Exile Market when Path of Exile 2 closes (step 19, off by default, acting only once the game has been seen running, written to the log, the case of a crash or of a restart for a patch decided then).
- **A blocker of the tag**: every `aunimhsn` replaced by `sylent-dev` (`Cargo.toml`, `src/update.rs`, `src/http.rs`, `src/bug_report/`, `src/window_error.rs`, the User-Agent of `tools/exchange-icons/` and `tools/game-data/`, the documentation), since a binary keeps the addresses it was built with and the redirects from the former name end once someone claims it.
- Archives with a stable name, `exile-market-windows-x64.zip` and `exile-market-linux-x64.tar.gz`, so that the buttons of the page link to `releases/latest/download/<name>` (`src/lib/application.ts`): done by its pull request 230, merged on 2026-11-13.
- Step 17b of its roadmap still says a VPS with Coolify: the page is on GitHub Pages.
- Its specifications say the owner has no Windows: the owner now tests on a Windows laptop.
- Its specifications and `release.yml` still count macOS among the systems, while the page offers no macOS download (owner, 2026-11-06): keep the macOS archives on the release page, untested, or remove them.
- The license at the root in a file named `LICENSE` (step 17d, `GPL-3.0-or-later`): the footer of the page links to `blob/main/LICENSE`, which answers 404 as long as the repository has `LICENSE-APACHE` and `LICENSE-MIT`.
- `v0.1.0` published as a normal release, never a pre-release, since `releases/latest` skips them: confirmed by the owner on 2026-11-13.
- Its README (step 17d) states the risk for the account with the same words as the page (`specs.md`, The risk for your account), and the audit (step 17e) reads Ctrl + D against the macro rules of the developer documentation.
- The patch notes of the site (step 5h of this page), one note per version and language in `docs/patch-notes/en/` and `docs/patch-notes/fr/`: done by its pull request 260, merged on 2026-11-19, with the notes of v0.1.0 to v0.2.0; a new note at each release.
- The launch plan is only in Claude Code's memory: write it as a document there, with the steps and without the names of the streamers.
