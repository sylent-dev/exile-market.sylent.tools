# Roadmap archive

The detail of the steps of [roadmap.md](../roadmap.md) whose pull request is merged, the most recent first. `roadmap.md` keeps one line per step done.

## 5h3. The patch notes: mock-up

Pull request: [#35](https://github.com/sylent-dev/exile-market.sylent.tools/pull/35).

The page in `docs/mockups/patch-notes.html`, style « Sober », the number as plain text, the red fluid of sylent.art on the grid; the decisions in `docs/branding.md`. Depends on: 5h2. Tool: mock-up.

## 5h2. The patch notes: wireframe

Pull request: [#34](https://github.com/sylent-dev/exile-market.sylent.tools/pull/34).

The timeline at phone and computer width, in both languages, from the notes of the application (`docs/wireframes/patch-notes.excalidraw`, owner, 2026-11-19), the layout in `specs.md`; the wireframe and the mock-up split in two pull requests by the owner on 2026-11-19. Tool: wireframe.

## 5h1. The patch notes: specifications

Pull request: [#33](https://github.com/sylent-dev/exile-market.sylent.tools/pull/33).

What the page shows of the release notes of the application (`../rust-exile-market/docs/release-notes/`), one page or one per version, its addresses, the link to it (the current version number in the header, left of the flag, with an explicit accessible name), where the French notes come from, and how the site is rebuilt at each release; the services checked in `docs/external-services.md`, the choices in `docs/technical-choices.md`. Tool: specifications.

## Fix. A card of the deck lost after the lightbox

Pull request: [#31](https://github.com/sylent-dev/exile-market.sylent.tools/pull/31).

The card hidden while its screen travels is remembered, and the deck holds still until the close event; `scripts/check-lightbox.mjs` added to `npm run check`.

## 5g. The video: click to pause, and in the lightbox

Pull request: [#30](https://github.com/sylent-dev/exile-market.sylent.tools/pull/30).

A click anywhere on the video pauses it or plays it again, and the video becomes reachable with the keyboard as one button, so the small pause button goes; in its place, bottom right, a button opens the video in the lightbox of 5f at its real size (1280 × 720, smaller on a small screen) rather than in full screen, which would blur it; that button only with a mouse (owner, 2026-11-16). Depends on: 5f. Tools: specifications, build, code review.

## 5f. The screens in a lightbox

Pull request: [#29](https://github.com/sylent-dev/exile-market.sylent.tools/pull/29).

On a computer with a mouse, a click (or Enter) on the card in front opens its screen in a lightbox, at most at its real size (420 × 720), with its title under it; ← → and two buttons go from one screen to the next, the deck following; Esc, a cross or a click beside it closes it. The card grows from its place in the deck and goes back there (owner, 2026-11-16, mock-up `docs/mockups/card-lightbox.html`). A phone or a tablet without a mouse keeps the tap that brings a card in front, and the zoom of two fingers. The larger image is downloaded only when the lightbox opens. Tools: mock-up, specifications, build, code review.

## 5d2. External links in a new tab

Pull request: [#28](https://github.com/sylent-dev/exile-market.sylent.tools/pull/28).

Every link that leaves the site opens in a new tab, announced to screen readers only (« opens in a new tab », « s’ouvre dans un nouvel onglet »), without an arrow on the screen (owner, 2026-11-14); the download buttons stay as they are, since they start a file without leaving the page; `scripts/check-urls.mjs` fails on an external link without both. Tools: build, code review.

## 5d. The donation banner

Pull request: [#27](https://github.com/sylent-dev/exile-market.sylent.tools/pull/27).

The line above the header of the home page and of the legal notice, as designed (`docs/branding.md`, Components), its words in `src/i18n/`, the link to Ko-fi chosen by step 18 of the application, Ko-fi and the reply of Grinding Gear Games in `docs/external-services.md`. Turned on at once by the owner, before the legal notice follows article 1-1, I (step 5e), on 2026-11-14. Tools: build, code review.

## Fix. The border of the buttons under the pointer

Pull request: [#26](https://github.com/sylent-dev/exile-market.sylent.tools/pull/26).

An urgent fix, the white border drawn in SVG under the red line, and its check.

## 5c. The downloads open

Pull request: [#25](https://github.com/sylent-dev/exile-market.sylent.tools/pull/25).

Once the tag is out and its archives answer, `downloadsOpen` turned on; `scripts/check-overflow.mjs` loads the phone widths with the identity of an iPhone, for good rather than for one pass (owner, 2026-11-14), so that every pull request measures the sentence of a phone and its address, and once more at 320 px without JavaScript, where the buttons stay and their labels are measured (code review). Tools: launch, code review.

## 5b3. The new username

Pull request: [#24](https://github.com/sylent-dev/exile-market.sylent.tools/pull/24).

The GitHub account renamed from `aunimhsn` to `sylent-dev`, shown as « Sylent », for a little more discretion (owner, 2026-11-14), before the tag, since a released binary keeps the addresses it was built with. The owner pointed the `CNAME` record to `sylent-dev.github.io`; every address of the site and of the documentation changed, since GitHub's redirects from the former name last only until someone claims it. Commits are now signed « Sylent » with GitHub's private address. Tools: build, code review.

## 5b2. The legal notice without personal details

Pull request: [#23](https://github.com/sylent-dev/exile-market.sylent.tools/pull/23).

The publisher shown as « Sylent », on a non-professional basis (LCEN, article 1-1, II), without name, SIRET, phone number or email address, since the SIRET led to the owner's address in the public register of companies (owner, 2026-11-14). `src/content/<lang>/legal.json`, `specs.md` and `docs/external-services.md`, with the limits of the choice. Tools: specifications, build.

## 5b. The site on its domain

Pull request: [#22](https://github.com/sylent-dev/exile-market.sylent.tools/pull/22).

The site put on https://exile-market.sylent.tools/ before the tag, with « Coming soon » in place of the buttons (owner, 2026-11-13: go as far as possible). The address is a subdomain: one `CNAME` record `exile-market` to `aunimhsn.github.io` (`sylent-dev.github.io` since the rename of the account on 2026-11-14), with the proxy of Cloudflare off, « DNS only », or GitHub can't issue its certificate; no `A` record and no `www`, unlike the case of `process.md`. Order: the custom domain set in the Pages settings first, as GitHub's documentation asks (the domain is verified, so the order matters little), the repository variables `SITE_URL` and `BASE_PATH` removed and the site deployed again at the root, then at once the placeholder removed and the `CNAME` created by the owner at Cloudflare; then HTTPS enforced, `github.io` checked to redirect, the live site checked, and a first visit read on the GoatCounter dashboard. Tool: launch. Done on 2026-11-13: the certificate started once the domain was removed and set again; HTTPS is enforced, and the owner read a first visit on GoatCounter.

## 5a. The final images

Pull request: [#21](https://github.com/sylent-dev/exile-market.sylent.tools/pull/21).

The video and the screenshots captured again in both languages from a release build of the application made after its audit (2026-11-13), with the prices of the day; nothing was left for the owner to capture. `run-screens.sh` and `common.sh` added next to `run-deck.sh`, which fail a run without the binary, with an error or with missing images; the French `alt` of the price names a « bague », as the game does. Tools: launch, code review.

## 4g. The icon

Pull request: [#16](https://github.com/sylent-dev/exile-market.sylent.tools/pull/16).

The bronze of the icon didn't match the black, white and red of the site (owner, 2026-11-09). Same shape, new treatment, compared at its real sizes: the emblem in flat colors, one red per mode of the system. `src/assets/brand/icon.svg`, the images of `npm run brand:images`, and `docs/branding.md`, whose decision of 2026-11-08 on the bronze it replaces. Tools: mock-up (the comparison), build.

## 4f. The burst and the statistics

Pull request: [#15](https://github.com/sylent-dev/exile-market.sylent.tools/pull/15).

The burst of shards (Three.js from npm, loaded after the page is shown); the GoatCounter script, on the real domain only, with the code of the site created on goatcounter.com. Tools: build, code review.

## 4e. The video

Pull request: [#14](https://github.com/sylent-dev/exile-market.sylent.tools/pull/14).

The video in each language, its pause and play buttons, its slight tilt under the pointer, the still image when the visitor asked to reduce motion. Tools: build, code review.

## 4d. The light motion

Pull request: [#13](https://github.com/sylent-dev/exile-market.sylent.tools/pull/13).

The red grid under the pointer on every page that has the grid, the grid of the first screen and that of the block « What it does » becoming one shared rule (code review of 4c); the entrance of the large sentences. No dependency. Tools: build, code review.

## 4c. The home page, still

Pull request: [#12](https://github.com/sylent-dev/exile-market.sylent.tools/pull/12).

Every block and text in both languages, the download area with its states behind a single setting (« Coming soon » until the tag) and the detection of the system, the three cards, the still image in place of the video. Complete and usable without JavaScript. Tools: build, code review.

## 4b. The simple pages

Pull request: [#11](https://github.com/sylent-dev/exile-market.sylent.tools/pull/11).

The legal notice with the real details (those public on sylent.art) and the not-found page, from the mock-up; the outlined button and the grid shared with the home page; the address of the application repository in one place. Tools: build, code review.

## 4a. Skeleton and deployment

Pull request: [#10](https://github.com/sylent-dev/exile-market.sylent.tools/pull/10).

The tokens and fonts of the mock-up in `src/styles/` (its `:root` becomes `tokens.css`, the components its CSS), the brand assets (`npm run brand:images`), the header and footer, the deployment to the `github.io` preview. Tools: build, code review.

## 3. Mock-up

Pull requests: [#8](https://github.com/sylent-dev/exile-market.sylent.tools/pull/8), [#9](https://github.com/sylent-dev/exile-market.sylent.tools/pull/9).

The home page, the legal notice and the not-found page in the chosen style, the video of the first screen; checked on the owner's phone; decisions in `docs/branding.md`, tokens in the `:root` of the mock-up. Tools: mock-up, design system.

## 2. Wireframe

Pull request: [#7](https://github.com/sylent-dev/exile-market.sylent.tools/pull/7).

One Excalidraw wireframe of the page, phone first, with grey frames for the video and the screenshots. It is removed by the pull request of the mock-up: the history keeps it.

## 1. Specifications

Pull request: [#6](https://github.com/sylent-dev/exile-market.sylent.tools/pull/6).

`specs.md` from what the owner decided on 2026-11-06, the terms of GoatCounter (chosen by the owner on 2026-11-06) and the French legal notice (LCEN article 1-1, read on Légifrance) checked and written in `docs/external-services.md`. Tool: specifications.

## 0b. Languages

Pull request: [#5](https://github.com/sylent-dev/exile-market.sylent.tools/pull/5).

English at the root and French under `/fr/`: the texts in `src/i18n/` and `src/content/` for each language, `lang` per page, the link between the languages and `hreflang` (the tag that tells search engines the page exists in the other language), the rules and descriptions that assume one French site adapted (the Language and Development sections of `CLAUDE.md`, `.claude/agents/code-reviewer.md`, the Content section of `docs/technical-choices.md`, the `$comment` of `src/i18n/fr.json`).

## 0a. Project setup

Pull request: [#4](https://github.com/sylent-dev/exile-market.sylent.tools/pull/4).

the size of the project, the Project section of `CLAUDE.md`, the name of the site, the port of the mock-up server, the README, the backlog, the repository settings checked.
