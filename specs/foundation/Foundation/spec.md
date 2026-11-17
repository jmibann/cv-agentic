# Foundation
Status: approved

*Note on Change #117 (2026-11-14): SEO and sharing metadata in
`index.html` (RF-11…RF-14) — **closed**: T19 approved by the reviewer and by
the user (tests `0025a21` + feat `f17cd78`; QA on `dist/` ✓). The
`Status` went back to `implemented`.*

*Note on Change 2026-11-17 (open): the user's request — the accent comes off the
surname, `Ibáñez` → `Ibañez`, in the `<title>`, `og:title` and JSON-LD `name` of
`index.html`, in `profile.name` of `src/content/cv.{en,es}.json`, in the
testimonial quote of `cv.en.json` and in `public/og-image.png` (regenerated from
the current PNG differing **only** in the surname; 1200×630 kept). One task
closes it: **T24**, `foundation`, no red between tasks: `test(Foundation): T24`
changes the three literals of `anti-flash.test.ts` (red) and `feat(Foundation): T24`
carries `index.html` + both content files + the new PNG; the reviewer runs
`validate:content` and checks the image visually. Historical records keep
`Ibáñez`; in documents the new spelling goes **only inside backticks, quotes or a
code block** (its `ñ` trips the documentation guard). The `Status` returns to
`implemented` when T24 closes.*

Piece of F1 (decision #84): it leaves the app ready for F2–F4 to build
components with TDD. The scope is derived **only** from
`.opencode/agents/foundation.md`, `foundations/*.md`, the approved
dependencies of `docs/README.md` and `data/`.

## Purpose

Set up the single project at the root (Vite + React + TS + ESLint + Vitest with
axe-core), with the tokens and the self-hosted font wired in, the theme and
language providers, the anti-flash script, the interface i18n and the dates, and the
content validated against `data/cv.schema.json` (Foundation started with the
example content; today it carries the **real CV** and the examples in `data/` remain
as a schema/test fixture — decision #109). Without this there is nowhere to write
a component and no way to test it.

## Requirements (EARS)

- **RF-1:** WHEN `index.html` loads, THE SYSTEM sets `data-theme` on `<html>`
  and the `content` of `<meta name="theme-color">` before the first frame, with
  values that match `--palette-light-bg` / `--palette-dark-bg` of
  `tokens/tokens.css`.
- **RF-2:** WHEN `toggleTheme` is called, THE SYSTEM switches `data-theme` on
  `<html>` and persists `localStorage["cv:theme"]`.
- **RF-3:** WHILE there is no stored preference (`cv:theme`), THE SYSTEM
  follows `prefers-color-scheme` changes live and applies the new
  `data-theme`.
- **RF-4:** THE SYSTEM keeps `<meta name="theme-color">` in sync with the
  applied theme, both after `toggleTheme` and after a system change with no
  stored preference.
- **RF-5:** IF `localStorage` throws (private mode / storage blocked),
  THEN THE SYSTEM does not break: the state still changes in memory, all inside
  `try/catch` (`D3`: only `cv:theme` and `cv:locale`).
- **RF-6:** WHEN `setLocale(locale)` is called, THE SYSTEM sets `<html lang>`,
  persists `localStorage["cv:locale"]` and exposes `t` and `useCv()` of the active
  language.
- **RF-7:** THE SYSTEM exposes as content only data that passed
  `validateCv` (`src/content/index.ts`): an invalid JSON breaks
  `prebuild`/`validate:content` and the import chain of `content.test.ts`.
- **RF-8:** WHEN
  `formatPeriod({ start, end }, locale, presentLabel)` is called, THE SYSTEM produces
  `"2015 — Present"`, `"2015 — Actualidad"` (`end: null`) and
  `"Mar 2019 — Nov 2021"` / `"mar 2019 — nov 2021"` (`Intl` short month +
  year), with the separator `" — "`.
- **RF-9:** WHEN the theme changes (`toggleTheme` or a system change with no
  stored preference), THEN THE SYSTEM applies `data-theme` **with no
  color transitions**: it adds `data-theme-switching` to `<html>` before
  applying it and removes it after two frames; IF the component unmounts or the
  theme changes again before the removal, THEN the attribute is cleared or the
  suppression restarts without leaving orphaned state.
- **RF-10:** THE SYSTEM exposes in `tokens/tokens.css` the approved motion
  scale (decision #106): `--duration-fast: 0.15s`, `--duration-base: 0.2s`
  (previously 0.3s), `--duration-slow: 0.3s` (previously 0.6s, no current uses),
  `--duration-exit: 0.22s`, `--duration-stagger: 0.03s`, `--ease-standard` and
  `--ease-emphasized` unchanged, `--ease-enter: cubic-bezier(0.22, 1, 0.36, 1)`
  and `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` new; IF
  `prefers-reduced-motion: reduce`, THEN the five durations are
  `0.01ms`.
- **RF-11:** THE SYSTEM includes in the `<head>` of `index.html` the seven
  description and sharing metadata tags with the literal values of the
  "Sharing metadata" table in Anatomy (`description`, `og:type`,
  `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`), with
  no other tag of that kind outside that list — exactly 5
  `meta[property^="og:"]` and 1 `meta[name^="twitter:"]` —, and `og:title`
  matches the text of the `<title>`.
- **RF-12:** WHEN the `<script type="application/ld+json">` of
  `index.html` is parsed with `JSON.parse`, THE SYSTEM produces a schema.org `Person`
  with its six exact keys (`@context`, `@type`, `name`, `jobTitle`, `url`,
  `sameAs`), whose `name` and `jobTitle` match `profile.name` and
  `profile.headline`, and its `sameAs` (in order) the `social[].url` of
  `src/content/cv.en.json`; the `url` of the JSON-LD, the `href` of the canonical and
  `og:url` are identical. The comparison is on the parsed object: the
  formatting of the block in the HTML is not part of the contract.
- **RF-13:** THE SYSTEM places the `<link rel="canonical">` and the JSON-LD block
  **after** the anti-flash script and the icons block, without breaking the
  contract of T4 (no `<link>` or `<script src>` before the anti-flash).
- **RF-14:** THE SYSTEM serves as `og:image` the file
  `public/og-image.png` — a real 1200×630 PNG — with its absolute deploy
  URL, pinned to the GitHub Pages site (Vite does not rewrite it;
  `assetUrl` is runtime only).

*Traceability notes (F1 Clarification): the resolution order of theme and
language (`cv:theme` → system → `light`; `cv:locale` → browser `es*` → `en`) and
the initial state of `LocaleProvider` taken from `<html lang>` are a contract of
"States" (verified by the providers' tests and the visual QA, not by an
RF of their own). The exact match of `package.json` with the table in
`docs/README.md` is a constitution check (S1/S2/S5), not a testable RF.*

## Anatomy

Structure F1 creates at the root (it is not a visual component):

```
package.json · package-lock.json · .nvmrc (26, #110) · .gitignore
index.html                  ← `<html lang="en">` + meta theme-color #eceef4
                              + inline anti-flash script in <head> (foundations/theming.md, verbatim)
                              + `<title>Juan Manuel Ibañez · Frontend Engineer</title>` (name and role, not the repo's; #115; accent removed by the user's Change 2026-11-17)
                              + `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` (F5 Change 2026-10-08, finding D4: the browser requested /favicon.ico → 404)
                              + `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` (#115)
                              + Sharing metadata (#117, RF-11…RF-14). Placement approved
                                in the Change: the `<meta>` tags go **after the `<title>` and before
                                the anti-flash** — a `<meta>` is neither a `<link>` nor a `<script src>`,
                                the T4 contract is not broken and the standard order is
                                title→description→OG→twitter —; the `<link rel="canonical">` and
                                the JSON-LD block go **after the anti-flash and the icons
                                block**, before `</head>` (RF-13).
                                "Sharing metadata" table — exact literals set by
                                the user in #117; the T19 test verifies them; they are not edited
                                (except the surname literals `Ibáñez` → `Ibañez`, set by the
                                user in Change 2026-11-17 and verified by T24):
                                  <meta name="description" content="Frontend Engineer with 7+ years in React and TypeScript: design systems, accessibility and AI-assisted development." />
                                  <meta property="og:type" content="profile" />
                                  <meta property="og:title" content="Juan Manuel Ibañez · Frontend Engineer" />
                                  <meta property="og:description" content="React · TypeScript · Design Systems · Accessibility" />
                                  <meta property="og:url" content="https://jmibann.github.io/cv-agentic/" />
                                  <meta property="og:image" content="https://jmibann.github.io/cv-agentic/og-image.png" />
                                  <meta name="twitter:card" content="summary_large_image" />
                                  <link rel="canonical" href="https://jmibann.github.io/cv-agentic/" />
                                  <script type="application/ld+json">
                                    { "@context": "https://schema.org", "@type": "Person",
                                      "name": "Juan Manuel Ibañez", "jobTitle": "Frontend Engineer",
                                      "url": "https://jmibann.github.io/cv-agentic/",
                                      "sameAs": ["https://github.com/jmibann",
                                                 "https://www.linkedin.com/in/juanmanuelibanez"] }
                                  </script>
                                (the JSON-LD block in the HTML may be formatted differently:
                                the contract is the parsed object, RF-12)
vite.config.ts              ← react plugin + resolve.alias @data/*
tsconfig.json               ← a single one; strict, noUnusedLocals, noUnusedParameters,
                              noUncheckedIndexedAccess, moduleResolution "bundler",
                              resolveJsonModule, paths @data/*, types ["vite/client","node"];
                              includes src/, data/ and vite.config.ts; no baseUrl
eslint.config.js            ← flat: typescript-eslint (strict), react-hooks,
                              react-refresh; --max-warnings 0; no-restricted-syntax
                              that forbids #[0-9a-fA-F]{3,8}\b|rgb(|hsl( in .tsx
public/images/              ← avatar.webp (the site's real photo; WebP 512×512 with alpha, #119), testimonials/{magrael,
                              jptigani,dharari}.jpg (real photos of the testimonials, #112) and
                              testimonials/{maria,john,lena}.svg (neutral silhouette, no text
                              or marks, square viewBox). The site no longer shows the
                              silhouettes, but they **are kept**:
                              the fixture `data/cv.example.{en,es}.json` references them.
                              Do not delete them. (The original `avatar.svg` became obsolete in
                              `861fb9a` and was removed in `63f6665` — #109)
public/favicon.svg          ← app-style icon (#115, replaces the plain hexagon of D4): a rounded
                              square (`rx` 14) filled with the kit's accent blue — literal
                              `#304cfd`, the value of `--color-accent` (tokens.css:97); a public
                              asset is not app CSS —, with a pointy-top hexagon in a white
                              stroke (HexAvatar's form factor) and the "JM" monogram inside,
                              drawn with paths (no `<text>`: it does not depend on fonts);
                              square 64×64 viewBox
public/apple-touch-icon.png ← the same design at 180×180, a full-bleed square (iOS rounds the
                              corners), for "Add to Home Screen" (#115)
public/og-image.png         ← sharing image, a real 1200×630 PNG (RF-14, #117). The
                              user provided and approved it and it went untouched into the
                              `feat(Foundation): T19` commit. Change 2026-11-17: the user approves a
                              regenerated variant differing **only** in the surname ("Ibáñez" →
                              "Ibañez"), made from the current PNG; it goes untouched into
                              `feat(Foundation): T24` (no further edits). Referenced
                              only by the absolute URL of `og:image` (not by `assetUrl`: the
                              metadata HTML is static and Vite does not rewrite those URLs)
src/main.tsx                ← imports ../tokens/tokens.css (the only import, relative
                              path), @fontsource/poppins/{300,400,500,600}.css,
                              src/styles/global.css; mounts ThemeProvider > LocaleProvider > App
src/App.tsx                 ← provisional: renders a text from `t` and the name from
                              `useCv()` (the integrator replaces it in F4)
src/styles/global.css       ← the only global CSS: reset + typographic base
                              (foundations/typography.md §"Base styles") +
                              html:has(dialog[open]) { overflow: hidden }
src/providers/ThemeProvider.tsx    ← spec foundations/theming.md
src/providers/LocaleProvider.tsx   ← spec foundations/i18n.md (useLocale + useCv)
src/i18n/ui.en.ts · ui.es.ts       ← all the keys of foundations/i18n.md
src/i18n/format.ts · formatPeriod.ts
src/content/cv.en.json · cv.es.json · index.ts · content.test.ts · schema.test.ts
                              ← real en/es content, both declaring
                              "$schema": "../../data/cv.schema.json" and passing
                              `validateCv` (RF-7). `data/cv.example.{en,es}.json`
                              stays in `data/` as a schema/test fixture: it is not
                              copied to the site or edited to match the
                              real CV (decision #109; originally "they are created
                              by COPYING data/cv.example…", foundation.md p.10)
src/test/setup.ts           ← jest-dom/vitest, explicit afterEach(cleanup), mocks
                              (matchMedia, ResizeObserver, scrollTo, showModal/close
                              if jsdom lacks them), afterEach that clears
                              localStorage, data-theme, lang and location.hash
src/test/a11y.ts            ← expectNoA11yViolations on top of axe-core
                              (disables color-contrast and region; see foundation.md 5b)
data/cv.types.generated.ts       ← gen:types   ┐ GENERATED — do not edit,
data/validate-cv.generated.{js,d.ts} ← build:validator ┘ committed, "GENERATED" header (#121)
```

## API

```ts
// ThemeProvider (foundations/theming.md)
type Theme = "light" | "dark";
interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;  // stores cv:theme; no RF of its own (Clarification #2, option A)
  toggleTheme: () => void;           // RF-2: switches data-theme + persists; from then on it stops following the system
}
// export: ThemeProvider, useTheme() → ThemeContextValue (descriptive error outside the provider)

// LocaleProvider (foundations/i18n.md)
type Locale = "en" | "es";
interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;  // RF-6
  t: UiStrings;
}
// export: LocaleProvider, useLocale() → LocaleContextValue, useCv() → CvData
// (both with a descriptive error outside the provider)
// ThemeProvider's single effect applies data-theme and theme-color (getComputedStyle
// of --color-bg) — contract of theming.md, verified by the meta tests (RF-4).

// src/i18n/ui.en.ts → export const uiEn (source of the keys, `as const`)
// src/i18n/ui.es.ts → export const uiEs: satisfies UiStrings (UiStrings = DeepStringify<typeof uiEn>)

// src/i18n/format.ts
export function format(template: string, values: Record<string, string | number>): string;
// replaces {key}; a missing placeholder stays literal

// src/i18n/formatPeriod.ts
export function formatPeriod(
  period: { start: string; end: string | null },
  locale: Locale,
  presentLabel: string,
): string;

// F3 Change (Clarification 12=a; Timeline consumes it with one <time> per end):
// same per-end formatting as the current private `formatEndpoint`; `formatPeriod`
// does NOT change signature or behavior.
export function formatPeriodEndpoint(value: string, locale: Locale): string;

// src/content/index.ts
export const cvByLocale: Record<Locale, CvData>;  // load() throws if validateCv fails

// src/test/a11y.ts
export function expectNoA11yViolations(container: Element): Promise<void>;

// data types: import type { CvData, Locale, … } from "@data/cv.types.generated";
// the @data/* alias must resolve in Vitest too (foundation.md p.3; schema.test.ts exercises it)
```

Scripts (`package.json`): `dev` (Vite), `lint` (ESLint `--max-warnings 0`),
`typecheck` (`tsc --noEmit`), `test` (Vitest run), `gen:types`
(json-schema-to-typescript), `build:validator` (ajv standalone; the `.d.ts`
declares `validateCv(data: unknown): data is CvData` and `validateCv.errors`),
`validate:content`, `prebuild` = `gen:types && build:validator &&
validate:content`, `build` = `prebuild` + `tsc --noEmit && vite build`.
Dependencies: the table in `docs/README.md` unchanged (TypeScript `~6.0`,
`engines.node` `"^22.12.0 || >=24"`, `"private": true`, `"type": "module"`).
The exact match `package.json` ↔ table is a constitution check
(S1/S2/S5) that the reviewer verifies by inspection when closing the piece.
`npm create vite` and generators are not used on the root: the base files are
created by hand.

## Styles and tokens

- `tokens/tokens.css` is imported **only once** in `src/main.tsx` by relative
  path; it is **not copied to `src/`**.
- `src/styles/global.css` uses tokens only (`--font-*`, `--color-*`,
  `--line-height-*`); the typographic base replicates `foundations/typography.md`
  §"Base styles" (body weight 300).
- Font: `@fontsource/poppins` weights 300/400/500/600, self-hosted (D1: no
  Google Fonts at runtime).
- `index.html`: the only color literals allowed are the two initial
  `theme-color` values (`#eceef4` / `#151517`), an exception to hard
  rule 1 of `docs/DESIGN.md`, verified by a test against `--palette-light-bg` /
  `--palette-dark-bg` (decision #60).
- Transition suppression on theme change (RF-9, motion Change #106):
  `:root[data-theme-switching] *` (+ `*::before`/`*::after`) with
  `transition: none` in `src/styles/global.css`, without `!important`; specificity
  **(0,2,0)**: it beats module selectors such as `.social a` / `.contacts a`
  (0,1,1), which would tie with `html[data-theme-switching] *` (0,1,1) and win
  by load order (global.css is imported before the components).
  Rule for the following motion Changes: no `transition` in a selector
  of specificity (0,2,0) or higher (the reviewer verifies it in each Change).
  The anti-flash of `index.html` is not touched: the suppression only governs
  interactive changes.
- Images in `public/images/`: they are content, not styles. `avatar.webp` is the site's
  real photo (WebP since #119; the 263 KiB PNG was removed); the `testimonials/*.svg` files are kept as a fixture of the example
  `data/cv.example.{en,es}.json` even though the site does not show them (`testimonials: []`).
  The real content does carry `downloadCvUrl`: the PDF lives in `public/cv/…` and is served
  with `assetUrl` to respect the deploy `base` (#107, decision #109).
- No new `@media` in F1: breakpoints live in `tokens.css`
  (`docs/tokens/breakpoints.md`).

## States

- **Initial theme:** stored (`cv:theme`) → system (`prefers-color-scheme`) →
  `light`. With no stored preference the site follows the system live; once
  chosen, it stays fixed until the user chooses again.
- **Initial language:** `cv:locale` → browser (`/^es\b/i`) → `en`.
- **Storage that throws:** the anti-flash's `try/catch` applies `light`/`en`; the
  providers change state in memory without persisting.
- **Invalid content:** `load()` throws with the validator's errors;
  `validate:content`, `build` and the tests break (there is no silent fallback).
- **Providers with no wrapper:** `useTheme`/`useLocale`/`useCv` outside their provider
  throw a descriptive error.
- **First frame:** theme and language already applied before the bundle (no flash).

## Responsive

No `@media` of its own: F1 creates no UI and breakpoints live in `tokens.css`
(from the kit), along with the `@media print` and the `prefers-reduced-motion` one.
`src/styles/global.css` adds none; everything scales through tokens
(mobile-first, hard rule 4 of `docs/DESIGN.md`).

## Accessibility

- Correct `<html lang>` from the first frame (States "Initial language"; default `en` in the HTML).
- `<meta name="theme-color">` in sync with the theme (RF-1/RF-4).
- `src/test/a11y.ts` enables `expectNoA11yViolations` for all future
  pieces (T4); it covers roles, names, ARIA and structure (axe in jsdom does not
  compute contrast: `docs/tokens/contrast.md` and the visual QA pin that down).
- The provisional `App.tsx` must pass the axe helper with no violations.
- No third-party dependencies at runtime (D1/D2): font, icons and all the
  CSS ship in the bundle.

## Expected tests

Source: `foundations/theming.md`, `foundations/i18n.md`,
`.opencode/agents/foundation.md` and `docs/README.md`.

**Anti-flash (`index.html`):**
- The two `theme-color` values of the script match
  `--palette-light-bg` and `--palette-dark-bg` of `tokens/tokens.css` (the test
  reads both files).
- **Sharing metadata (#117, RF-11…RF-14, T19)** — added to
  `src/test/anti-flash.test.ts` (additions only; it is the contract test
  file for `index.html`):
  - each of the nine new tags of the "Sharing metadata" table
    in Anatomy with its exact literal value;
  - exact count (RF-11 "no other tag outside the list"):
    exactly 5 `meta[property^="og:"]` and 1 `meta[name^="twitter:"]`;
  - `og:title` equal to the text of the `<title>`;
  - the `<link rel="canonical">` and the JSON-LD block appear after the
    index of the anti-flash script (explicit reinforcement of the T4 contract of
    `anti-flash.test.ts:123`);
  - the JSON-LD, **compared parsed** (`JSON.parse` + `toEqual` against the
    expected object with its six exact keys; the formatting of the block is not
    part of the contract): `name`, `jobTitle` and `sameAs` (in order) match
    `profile.name`, `profile.headline` and the list of `social[].url` of
    `src/content/cv.en.json`, read with `fs` (contract between documents,
    decision 7 of the plan; it is not imported through React); the `url` of the JSON-LD is
    asserted as a literal and is also identical to the `href` of the canonical and to
    `og:url`;
  - `public/og-image.png` is a 1200×630 PNG (PNG signature + IHDR, like the
    apple-touch one of T14) **with the path in a variable** (T14b lesson: with
    a literal, Vite rewrites the `new URL` and it stops being `file:`). Since the
    PNG already exists, this assertion **is born green** (regime #101, declared
    in the body of T19); the `test(Foundation): T19` commit is still red because of
    the tags missing from `index.html`.
- **Avatar in WebP (#119, T21)** — added to `src/content/content.test.ts`:
  `profile.avatar.src` is `/images/avatar.webp` in `cv.en.json` and `cv.es.json`;
  `public/images/avatar.webp` is a real WebP (signature `RIFF`…`WEBP`, path in
  a variable, T14b lesson); `public/images/avatar.png` no longer exists.

**Accessibility helper (`src/test/a11y.ts`):**
- An `<img>` with no `alt` produces a violation (the helper fails).
- A button with text produces no violations (the helper passes).

**ThemeProvider:**
- Takes the initial theme from `data-theme` (it does not recompute).
- `toggleTheme` switches `data-theme` and persists in `localStorage`.
- If `localStorage` throws, it does not break (the theme still changes in memory).
- With no stored preference it reacts to a `prefers-color-scheme` change
  (`matchMedia` mock); with a stored preference, it ignores it.
- `<meta name="theme-color">` is updated both with `toggleTheme` and with a
  `prefers-color-scheme` change with no stored preference.
- When the theme changes it adds `data-theme-switching` to `<html>` **before**
  applying the new `data-theme` and removes it after two frames (mock
  `requestAnimationFrame`/timers); it holds for `toggleTheme` and for the system
  change (RF-9).
- Cleanup: when the provider unmounts no `data-theme-switching` is left on `<html>`;
  a rapid change suppresses again without leaving orphaned state (RF-9).
- `useTheme` outside the provider throws a descriptive error.

**LocaleProvider / content / i18n:**
- `LocaleProvider` takes the initial language from `<html lang>`; `setLocale` changes
  `lang`, persists and changes `t`; storage that throws does not break it.
- `useCv()` returns the content of the active language; `useLocale`/`useCv` outside
  the provider throw a descriptive error.
- `format`: replacement of one or several `{placeholders}`; a missing placeholder
  stays literal.
- `formatPeriod`: bare years, year-month on both ends, `end: null`, both
  languages (cases of RF-8).
- `formatPeriodEndpoint` (F3 Change): `"2015"` → `"2015"`; `"2019-03"` →
  `"Mar 2019"` (en) / `"mar 2019"` (es); it matches each end of the
  result of `formatPeriod` on the same data.
- **Content parity** (`content.test.ts`): `cv.en.json` and `cv.es.json` with
  the same ids in each collection, in the same order, and the non-translatable
  fields (canonical list of `foundations/i18n.md`) identical.
- **Date order** (`content.test.ts`): `start` ≤ `end` normalizing `"YYYY"`
  (`-01` in start, `-12` in end); cases: `2017-06`→`2017` valid,
  `2018`→`2017` invalid, `2017-06`→`2017-05` invalid.
- **Invalid content** (`content.test.ts`): the validator rejects month `99`,
  an unknown network and an extra field (in-memory cases).
- **Kit examples** (`content.test.ts`, decision #109): `validateCv` accepts
  `data/cv.example.en.json` and `data/cv.example.es.json` (they are still schema-valid
  even though the site no longer uses them as content). It is **not** required that
  `cv.{en,es}.json` be a copy of the examples: that case was removed with #108/#109.
- **Schema up to date** (`schema.test.ts`): the lists of `@data/constants` are
  equal to the schema's `enum`s and `data/cv.types.generated.ts` is up to date
  (regenerate it in memory and compare).

**Motion tokens (`tokens/tokens.css`, inspection, RF-10):**
- Exact values of the approved scale: `--duration-fast: 0.15s`,
  `--duration-base: 0.2s`, `--duration-slow: 0.3s`, `--duration-exit: 0.22s`,
  `--duration-stagger: 0.03s`, `--ease-enter: cubic-bezier(0.22, 1, 0.36, 1)`,
  `--ease-exit: cubic-bezier(0.4, 0, 1, 1)`; `--ease-standard` and
  `--ease-emphasized` unchanged.
- With `prefers-reduced-motion: reduce`, the **five** durations (fast, base,
  slow, exit, stagger) are `0.01ms`.

**Tooling (smoke, first tasks):**
- A smoke test of the project (for example rendering the provisional `App` with the
  axe helper) that runs under Vitest with jsdom, `globals: false` and cleanup
  between tests (the DOM does not pile up: two tests that create the same role/name
  both pass).
- `npm run lint`, `npm run typecheck` and `npm test` run green on the
  scaffold from the task that creates those scripts (DoD per task, decision #80);
  `typecheck` covers `src/`, `data/` and `vite.config.ts`. The ESLint
  anti-color rule in `.tsx` stays in the config (Anatomy) and the
  reviewer verifies it with grep, with no test of its own.

**When closing the piece (not per task, decision #80):** a green `npm run build`.
**Visual verification (done by the reviewer with the app served by the user,
decision #91):** provisional text in Poppins on `--color-bg`; with
`localStorage["cv:theme"]="dark"` + reload, dark theme **with no flicker**.

## Do not

- Do not build visual components (they belong to F2/F3) or the final layout
  (F4); `App.tsx` is provisional.
- Do not touch the kit (`README.md`, `AGENTS.md`, `docs/`, `tokens/`, `foundations/`,
  `specs/`, `data/` except `*.generated.*` through scripts, `.opencode/`).
- Do not use `npm create vite` or any generator on the root (the kit is there).
- Do not add dependencies outside the approved table (S1), nor `eslint-plugin-jsx-a11y`
  or `vitest-axe` (discarded).
- Do not mark tasks in `tasks.md` or write in `specs/`.
- Do not commit standalone `chore:` commits: everything falls inside a Tn with its test first.
- Do not edit the `*.generated.*` files by hand or fail to commit `package-lock.json`
  and the generated files.
- Do not use `ajv` in the browser bundle (only at build time, standalone mode).
- Do not put color literals outside `tokens.css` (hard rule 1), except the two
  `theme-color` values of the anti-flash pinned by a test.
- Do not run `npm run dev` (decision #91) or `build` per task.
- Do not use `baseUrl` (deprecated), `any`, `@ts-ignore`, `eslint-disable` or
  `React.FC`; do not copy tokens to `src/`; do not raise the body weight from 300.
- Do not use `!important` in the transition suppression of the theme change
  (`data-theme-switching`), or touch the anti-flash of `index.html` for it
  (the suppression is only for interactive changes).
- Do not add `@keyframes`, animation libraries or transitions that use
  durations outside the tokens (RF-10; the scale lives in `tokens.css`).
- Do not add metadata tags outside the "Sharing metadata"
  table in Anatomy (#117, condition 1), nor `hreflang`, `og:locale`
  or per-language metadata: "SEO per language" stays open in
  `docs/BACKLOG.md`.
- Do not regenerate or modify `public/og-image.png` beyond the user's Change
  2026-11-17: the only permitted variant is the regenerated one differing only in the
  surname ("Ibáñez" → "Ibañez"), which goes untouched into `feat(Foundation): T24`;
  any other difference → stop and ask.
- Do not touch the anti-flash script or its test "verbatim from theming.md" (the
  placement of the new `<meta>` tags does not require it), or `foundations/theming.md`.
- Do not rewrite the metadata URLs as relative or with `assetUrl`: they are
  absolute and pinned to the GitHub Pages deploy (Vite does not touch them in HTML).
