# Foundation — tasks

Dependency order (see plan.md): T1 → T2 → T2b → T3 → T3b → T4 → T5b → T5 →
T6 → T8 → T8b → T9 → T10 → T11. One task per assignment; commits
`test(Foundation): Tn` → `feat(Foundation): Tn` (T2b and T3b are an exception: a single
commit `test(Foundation): Tn` because they only repair text —titles or comments—
of their files, with no new implementation; T5b is another exception: a single commit
`fix(Foundation): T5b` because it only changes `eslint.config.js` and unblocks
`feat(Foundation): T5` —`test(Foundation): T5` was already committed in red—).
T2b, T3b and T4 were reordered when executed: T4 was implemented before recording
T3b (an L1 debt found in its review).

- [x] **T1. Scaffold of the single project: configs, exact dependencies, alias.** RF-1 (API contract: scripts and deps), API/Anatomy (`@data` alias in Vitest) — 529199f
  - Done when: `package.json` has `"private": true`, `"type": "module"`,
    `"engines.node": "^22.12.0 || >=24"` and only the deps/ranges of
    `docs/README.md` (TypeScript `~6.0`) with the 9 scripts; `.nvmrc` says `24`;
    `npm install` generates `package-lock.json` and it is committed; a single
    `tsconfig.json` (strict + `noUnusedLocals`/`noUnusedParameters`/
    `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`,
    `resolveJsonModule`, `paths` with no `baseUrl`, `types: ["vite/client","node"]`,
    includes `src/`, `data/`, `vite.config.ts`); `vite.config.ts` with the react
    plugin, `resolve.alias` and a `test` block (jsdom, `globals: false`,
    the T2 setup tolerated as not existing yet); flat `eslint.config.js` with
    typescript-eslint strict, react-hooks, react-refresh, `no-restricted-syntax`
    for `#[0-9a-fA-F]{3,8}\b|rgb(|hsl(` in `.tsx` and `ignores` for generated files and
    `dist/`; the test `src/tooling.smoke.test.ts` (imports `LOCALES` from
    `@data/constants`) passes with `npm test`, and `npm run lint` and
    `npm run typecheck` run green.

- [x] **T2. Vitest setup: jest-dom, explicit cleanup, mocks and global clearing.** Expected tests (Tooling: cleanup between tests) — e8a51fa (+ fix 2fb4833)
  - Done when: `src/test/setup.ts` (referenced by the config) imports
    `@testing-library/jest-dom/vitest`, registers RTL's `afterEach(cleanup)` and
    mocks of `matchMedia` (with `addEventListener`), `ResizeObserver`,
    `Element.prototype.scrollTo` and `HTMLDialogElement.prototype.showModal/close`
    if jsdom lacks them, plus an `afterEach` that clears `localStorage`,
    `data-theme`, `lang` and `location.hash`; the 3 tests of
    `src/test/setup.test.ts` pass (the DOM does not pile up a repeated button;
    `matchMedia` responds; `localStorage` arrives empty at the next test) and the
    smoke test of T1 stays green.

- [x] **T2b. L2 rename of the test titles of the T1 smoke test.** L2 (constitution), T1 (debt fix) — 4a20573
  - Done when: `git show -p` of the commit `test(Foundation): T2b` touches **only**
    `src/tooling.smoke.test.ts` and changes **only** the titles of
    `describe`/`it` to English (assertions and imports intact); `npm run lint`,
    `npm run typecheck` and `npm test` green.

- [x] **T3. Accessibility helper `expectNoA11yViolations` on top of axe-core.** Expected tests (Accessibility helper) — 92e924e
  - Done when: `src/test/a11y.ts` exposes
    `expectNoA11yViolations(container: Element): Promise<void>` with
    `axe.run` and the rules `color-contrast` and `region` disabled, and the
    message lists `id (impact): targets`; `src/test/a11y.test.ts` passes: an
    `<img>` with no `alt` makes it reject and a button with text produces no
    violations.

- [x] **T3b. Moving the comments of `a11y.ts` and `a11y.test.ts` to Spanish (L1 debt of T3).** L1 (constitution), T3 (debt fix) — 17b0409
  - Done when: a single commit `test(Foundation): T3b` touches **only**
    `src/test/a11y.ts` and `src/test/a11y.test.ts` and changes **only** the
    text of their comments to Spanish (assertions, `describe`/`it` titles,
    imports and logic intact byte for byte; as in T2b, the `test` prefix is the
    documented exception because there is no new implementation); `npm run lint`,
    `npm run typecheck` and `npm test` green (17 tests).

- [x] **T4. `index.html`: anti-flash verbatim from theming.md, lang, theme-color.** RF-1 — 3a3d25a (+ test L1 fix c259db2)
  - Done when: `index.html` has `<html lang="en">`,
    `<meta name="theme-color" content="#eceef4">`, the inline script identical to the
    one in `foundations/theming.md` (theme → `theme-color` → language, all inside
    `try/catch`) placed before any `<link>`/`<script src>` of the bundle,
    `#root` and the `<script type="module" src="/src/main.tsx">`; and
    `src/test/anti-flash.test.ts` passes reading both files: the two
    literals of the script equal `--palette-light-bg` and `--palette-dark-bg`
    of `tokens/tokens.css`.

- [x] **T5b. `allowExportNames` exception in `react-refresh` (Change approved by the user).** T5 (lint blocker), plan §decision 2 amended — 48bd323
  - Done when: `eslint.config.js` sets
    `react-refresh/only-export-components` with `{ allowConstantExport: true,
    allowExportNames: ["useTheme", "useLocale", "useCv"] }` (the only config
    change; `useLocale`/`useCv` are included now so T10 does not repeat the
    block); the error 110:17 of `ThemeProvider.tsx` disappears; `npm run lint`
    can only stay red because of the red test of T5 still without implementation, not
    because of react-refresh; a single commit `fix(Foundation): T5b ...` touches only
    `eslint.config.js`.

- [x] **T5. `ThemeProvider` + `useTheme`.** RF-2, RF-3, RF-4, RF-5 — bcb4605
  - Done when: the 7 tests of `ThemeProvider.test.tsx` pass: initial from
    `data-theme` (without recomputing); `toggleTheme` switches `data-theme` and
    persists `cv:theme`; if `localStorage` throws, the theme still changes in
    memory; with no preference, a `prefers-color-scheme` change (mock) applies
    `data-theme`; with a stored preference, it is ignored; `<meta theme-color>`
    takes the spied value of `--color-bg` both by toggle and by system
    change (RF-4, with `vi.spyOn(window, "getComputedStyle")`); `useTheme` outside
    the provider throws a descriptive error.

- [x] **T6. en/es interface keys + `format()`.** RF-6 (partial: `t`), Expected tests (`format`) — 15a9592
  - Done when: `ui.en.ts` exports `uiEn as const` with **all** the keys of
    `foundations/i18n.md` and the type `UiStrings` (`DeepStringify`); `ui.es.ts`
    exports `uiEs satisfies UiStrings` (an extra or a missing key breaks
    `npm run typecheck`, which is green); `format.ts` exports a pure `format` and
    its test passes: one placeholder, several, and a missing placeholder stays literal.

- [x] **T7. `formatPeriod`.** RF-8 — 884bb2f
  - Done when: `formatPeriod({ start, end }, locale, presentLabel)` lives in
    `src/i18n/formatPeriod.ts` (pure, no React/DOM) and its tests pass:
    `"2015"`+`null` → `"2015 — Present"`/`"2015 — Actualidad"`;
    `"2019-03"`+`"2021-11"` → `"Mar 2019 — Nov 2021"`/`"mar 2019 — nov 2021"`;
    separator `" — "` in every case; `Intl` with the received `locale`.

- [x] **T8. Working data scripts: generated types and validator + `schema.test.ts`.** RF-7 (partial: generated files up to date), Expected tests (Schema up to date) — 14aec22 (+ `gen:types` amendment option A, approved by the user)
  - Note for closing the piece: `07eead6` fixed the mechanism of its own test within its red window with a `fix` label and a message in Spanish (it should have been `test(Foundation): T8 …` in English; precedents `bac24cb`/`c259db2`). Legitimate content, assertions intact; record the rule in `docs/memory.md`/`docs/diagnostics.md` when closing F1. Also: `data/validate-cv.generated.js` imports `ajv/dist/runtime/ucs2length.js` (inherent to standalone; noted by the reviewer).
  - Done when: `npm run gen:types` and `npm run build:validator` run from
    `package.json` and commit `data/cv.types.generated.ts` and
    `data/validate-cv.generated.{js,d.ts}` (the latter declares
    `validateCv(data: unknown): data is CvData` and `validateCv.errors`) with
    the header `GENERADO — no editar` (English since #121); running them again produces no `git diff`;
    `validate:content` works with the validator; the 2 tests of
    `src/content/schema.test.ts` pass: the lists of `@data/constants` equal
    the schema's `enum`s and the generated types are up to date (regenerate in
    memory and compare).

- [x] **T8b. L2 rename of the `describe` title in `schema.test.ts` (debt found in the full review of the piece).** L2 (constitution), F1 full review — ae59762
  - Done when: a single commit `test(Foundation): T8b` touches **only**
    `src/content/schema.test.ts` and changes **only** the title
    `describe("Esquema al día (RF-7)")` (~line 87) to English (assertions,
    `it` and imports intact); `npm run lint`, `npm run typecheck` and `npm test`
    green.

- [x] **T9. Validated initial content: `cv.{en,es}.json` + `index.ts` + `content.test.ts`.** RF-7 — 59efc8d (+ L2 repair c42e33d)
  - Note for closing the piece: `59efc8d` included the fix of the **producer** of the generated file (`build-validator.ts`: CJS/ESM interop shim `{ default: raw.default ?? raw }` + regeneration by script of `validate-cv.generated.js`) because T9 is the first runtime consumer under Vitest; reviewer's ruling: legitimate fix, determinism and `.d.ts` intact. Trail requested by the reviewer: record it in memory/diagnostics when closing F1 (along with the `07eead6` debt of T8).
  - **Change note (#109, 2026-11-11):** the criterion "they are a copy of
    `data/cv.example.{en,es}.json`" was replaced by **real, validated en/es
    content**. It is content Change **#108** (approved by the user before
    being executed), applied in `63f6665` (content + assets) and `befb0db` (tests: the
    faithful-copy case removed, validation of both examples added). The rest of the
    "Done when" still holds and the piece is still `implemented`.
  - Done when: `cv.en.json`/`cv.es.json` carry the en/es content and declare
    `"$schema": "../../data/cv.schema.json"` (when the task was dated they were a copy of
    `data/cv.example.{en,es}.json`; see note #109);
    `src/content/index.ts` exposes `cvByLocale: Record<Locale, CvData>` after
    `load()`, which throws with `validateCv.errors` if the JSON is invalid; the
    tests pass: parity of ids/order per collection and identical non-translatable
    fields (canonical list), `start` ≤ `end` with the 3 cases (`2017-06`→
    `2017` valid, `2018`→`2017` invalid, `2017-06`→`2017-05` invalid) and
    in-memory rejections (month `99`, unknown network, extra field);
    `npm run validate:content` green.

- [x] **T10. `LocaleProvider` + `useLocale` + `useCv`.** RF-5, RF-6 — faae4c2
  - Done when: the 5 tests of `LocaleProvider.test.tsx` pass: initial from
    `<html lang>`; `setLocale` changes `lang`, persists `cv:locale` and switches `t`
    and `useCv()` to the active language; if `localStorage` throws, it does not break (it changes in
    memory); `useLocale`/`useCv` outside the provider throw a descriptive error.

- [x] **T11. Base styles, `main.tsx`, provisional `App.tsx` assembled + `public/images/` placeholders.** States (first frame, Poppins), Accessibility (App passes axe), Expected tests (App smoke + axe), Anatomy ~69 and Styles ~171 (placeholders) — 79b7133
  - Record: the placeholders `public/images/{avatar.svg,testimonials/{maria,john,lena}.svg}` are required by the spec (Anatomy/Styles) and no previous plan/task assigned them; they are added here with no new scope (neutral silhouette, no text/marks, square `viewBox`; `foundation.md` item 1).
  - Done when: `src/styles/global.css` has the reset + the typographic base of
    `foundations/typography.md` §"Base styles" (tokens only) +
    `html:has(dialog[open]) { overflow: hidden }`; `src/main.tsx` imports
    `../tokens/tokens.css` (the only import, by relative path),
    `@fontsource/poppins/{300,400,500,600}.css` and `global.css`, and mounts
    `ThemeProvider > LocaleProvider > App`; `src/App.tsx` renders a text from
    `t` and the name from `useCv()`; `App.test.tsx` passes (it shows both and closes
    with `expectNoA11yViolations`); `npm run lint && npm run typecheck &&
    npm test` green over the whole piece.
  - Debts for the F1 closing record (reviewer of T11 + full review):
    ① `StrictMode` omitted for lack of a mandate (decision to record; today
    only commented in `src/main.tsx`); ② context `value` without `useMemo` in
    both providers (consistent with the approved T5; record); ③ typos
    `recalculera` in `ThemeProvider.test.tsx:47` and `LocaleProvider.test.tsx:51`
    (comments, not titles); ④ `data/validate-cv.generated.js` imports
    `ajv/dist/runtime/ucs2length.js` into the bundle (runtime helper of ajv
    standalone; the user decides at the F1 gate).

- [x] **T12. F3 Change (before ControlsBar/T1 and Timeline/T2): exported `formatPeriodEndpoint` + `controls.lightMode`.** RF-8 (+ Expected tests of the updated spec) — Change approved in the F3 Clarification (decisions 1=a and 12=a, F3 Plan gate) — 29b063f  - Done when: `src/i18n/formatPeriod.ts` exports
    `formatPeriodEndpoint(value, locale): string` (the current private
    `formatEndpoint`, now exported; `formatPeriod` keeps the same signature and
    behavior, its F1 tests pass untouched); the new tests of
    the function pass (a bare year as is; `"YYYY-MM"` → `"Mar 2019"` en / `"mar 2019"`
    es); `ui.en.ts` and `ui.es.ts` add `controls.lightMode`
    ("Light mode" / "Modo claro") keeping `satisfies UiStrings` green;
    `foundations/i18n.md` (keys table and "Dates and periods") already documents
    both (edited by the orchestrator in this same decision); lint +
    typecheck + test green. It touches nothing else of F1.

- [x] **T13. SVG favicon (F5 Change 2026-10-08, finding D4 of `docs/qa-report.md`).** spec → Anatomy (`index.html` + `public/favicon.svg`) — b93c510 (APPROVED incl. intra-task fix T13b `06bf088`→`b93c510`, normal regime after the spec amendment `69f6cfd`. Link placed AFTER the anti-flash because of the T4 contract (minimal resolution, tasks allows it). Minor: typo `geomtria` in the body of `34e0d87`; the `it` does not assert the polygon's vertices (verified by reading); live F5 pending item: console with no 404)
  - Done when: `index.html` includes `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` in the `<head>` (next to the theme-color, before the anti-flash script where applicable); `public/favicon.svg` exists: a hexagon with a 64×64 viewBox, fill `#304cfd` (the asset's literal, equal to `--color-accent`; a public SVG is not app CSS), no text; `src/test/anti-flash.test.ts` (or the test that reads `index.html`) adds the assertion of the link + the file's existence (with `fs` as it does with tokens.css); console with no 404 in the F5 re-pass; lint/typecheck/test/build green.
  - Intra-task fix (orchestrator's decision after delivery, recorded): the original fill `#ffb729` came from an error in the brief itself (the literal of the kit's `--color-accent` is `#304cfd`, tokens.css:97); spec/tasks are amended (this line) and asset + test are aligned in new commits `test(Foundation): T13b` + `fix(Foundation): T13` (normal regime, no `--amend`).

- [x] **T14. App-style favicon, apple-touch-icon and title with the name (#115).** spec → Anatomy (`index.html`, `public/favicon.svg`, `public/apple-touch-icon.png`) — 9ebcca4 (tests `3b4db39` + fix `516621a` T14b: Vite rewrote the literal `new URL` of the PNG; assertions intact. Gates 448/40 + build green; browser: title OK, both icons 200, clean console). Post-deploy: malformed SVG (`--` in the XML comment) → T14c `afbc660` (well-formed XML test) + `fix` `05e2cb6`; 449/40 green
  - Done when: `index.html` carries `<title>Juan Manuel Ibáñez · Frontend Engineer</title>` and `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` (after the anti-flash, T4 contract); `public/favicon.svg` is a rounded square (`<rect … rx="14"`) with fill `#304cfd`, a hexagon in a white stroke and the "JM" monogram in paths (no `<text>`); `public/apple-touch-icon.png` exists and is a 180×180 PNG; `src/test/anti-flash.test.ts` adds an `it` with those assertions (red in `test(Foundation): T14`); lint/typecheck/test/build green.

## Motion Change (#106) — RF-9/RF-10 (Plan+Tasks gate approved 2026-11-12 with adjustments)

- [x] **T15. Motion scale in `tokens/tokens.css`.** RF-10 — **kit: the user executes and commits it** (precedent `--z-skip` `b2563f0`); inspection-only (#101, red not required) — c2befd1 (user); the contract is covered by the test of T17 `122a996` (APPROVED), which pins the values of this task
  - Done when: `--duration-fast: 0.15s` (unchanged), `--duration-base: 0.2s`
    (previously 0.3s), `--duration-slow: 0.3s` (previously 0.6s), `--duration-exit: 0.22s`
    and `--duration-stagger: 0.03s` new; `--ease-enter: cubic-bezier(0.22, 1,
    0.36, 1)` and `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` new;
    `--ease-standard`/`--ease-emphasized` intact; the
    `prefers-reduced-motion: reduce` block of `tokens.css` collapses to `0.01ms` the
    **five** durations (fast, base, slow, exit, stagger); `lint`/`typecheck`/
    `test` green after the user's commit.
- [x] **T16. `data-theme-switching` in `ThemeProvider` + global rule.** RF-9 — can be delegated to `foundation` without waiting for T15 — 6dda460 (test) + c0bc995 (feat); reviewer APPROVED (454/40; minor recorded: broken comment `nada que huérfano` in `ThemeProvider.test.tsx:399` + typo `huelfano` in the body of `6dda460`, a form debt for the next time the file is touched)
  - Done when: `test(Foundation): T16` (red) adds to `ThemeProvider.test.tsx`
    the cases with fake rAF/timers: (a) when the theme changes through `toggleTheme`
    the attribute is on `<html>` **before** applying the new `data-theme` and
    is removed after two frames; (b) the same for a system change with no stored
    preference; (c) unmounting the provider clears it; (d) a second rapid change
    restarts the suppression without leaving an orphaned attribute; (e) the initial mount
    does **not** apply it (first-mount ref). `feat(Foundation): T16`:
    `data-theme-switching` + `data-theme` + `theme-color` meta applied in the
    **same** `useLayoutEffect` (decision 1 of the plan); removal after a double
    `requestAnimationFrame`; unconditional cleanup with `cancelAnimationFrame`;
    in `src/styles/global.css` the rule `:root[data-theme-switching] *` +
    `*::before`/`*::after` with `transition: none`, without `!important`
    (specificity (0,2,0), adjustment 1 of the gate); the pre-existing F1 tests
    of `ThemeProvider` stay green; lint/typecheck/test green; `feat` does not
    touch tests; `index.html` and `tokens/tokens.css` are not touched.
- [x] **T17. Contract test of the motion tokens (`fs` read).** RF-10 — requires T15 applied; can be delegated to `foundation`; a single commit `test(Foundation): T17` (#101: it asserts the approved document, green when written) — 122a996 (the user's T15 `c2befd1`); reviewer APPROVED (456/40; in-memory mutations: change/delete/zone → breaks; minor form issues: `declaredValue` takes the first declaration vs the last of the cascade and is sensitive to an inline comment before the `;` — a debt if the test is touched again)
  - Done when: a test in `src/` (an extension of `src/test/anti-flash.test.ts`
    or a new file in the tests folder) reads `tokens/tokens.css` with `fs` and
    asserts the exact values of T15: the five durations (`0.15/0.2/0.3/
    0.22/0.03s`), `--ease-enter` and `--ease-exit` with their `cubic-bezier`, and that
    the `prefers-reduced-motion: reduce` block sets `0.01ms` on all five;
    the test does **not** write `tokens.css` (outside the `edit` permission); the commit
    touches test files only; lint/typecheck/test green.
- [x] **T18. Closing the Change: kit docs + QA + build.** — the user executes and commits `foundations/motion.md`; the `reviewer` does the QA with the app served by the user (#91) — kit doc `e3c511d` (user); reviewer **APPROVED** 2026-11-13 (live visual QA ~200 ms per transition, no jank; theme change with 0 color events and no orphaned attribute; rule (0,2,0): 0 violations in 12 selectors; lint/typecheck/test 456/40 + build green). Minor items recorded for Changes 2–4: stagger delays must derive from `calc(n × --duration-stagger)` (the reviewer of Change 3 checks it); inert `transition: color` in `Sidebar.module.css:386` → Change 3; stale comment "0.3s" in `TestimonialDialog.module.css:79` → Change 4. With the user's approval, `spec.md` → `Status: implemented` and status documents updated (#86, §XXIV).
  - Done when: `foundations/motion.md` documents the new scale, the theme
    change with no transitions (`data-theme-switching`), reduced motion with
    cancelled delays, and the rule for motion Changes 2–4: **no
    `transition` in a selector of specificity (0,2,0) or higher** (the reviewer
    verifies it in each Change); visual QA in the browser of the existing
    transitions with `--duration-base` at 0.2s (tabs, chevron, Button hover/press,
    carousel bullet, dialog; §2.3 of the proposal) with no jank; a green `npm run build`;
    with the user's approval, `spec.md` goes back to
    `Status: implemented` and the status documents are updated (#86).

## Change #117 — SEO and sharing metadata (spec re-approved in `472bc1d`; Plan+Tasks gate approved 2026-11-14)

- [x] **T19. Metadata in `index.html` + `public/og-image.png`.** RF-11, RF-12, RF-13, RF-14 — f17cd78 (test `0025a21` red because of (a)–(e) with (f) born green, #101 declared; feat `f17cd78`: `index.html` + untouched PNG; reviewer **APPROVED** 2026-11-14: gates 472/41 + build green, QA on `dist/index.html` (literals intact, T4 order kept) and `dist/og-image.png` present; no deviations spec↔plan↔tasks↔code. Minor: pre-existing form debt — anti-flash `<script>` at column 0 in `index.html` (from T4, not introduced by T19; a debt if the file is touched again); byte-for-byte of `dist/og-image.png` verified by size + Vite's copy semantics (a direct hash is not allowed to the reviewer))
  - Done when: `test(Foundation): T19` (red) touches **only**
    `src/test/anti-flash.test.ts` and **only adds**, without modifying the tests
    of T4/T13/T14/T14b/T17: (a) the nine new tags of the "Sharing
    metadata" table of the spec with their exact literal values;
    (b) count: exactly 5 `meta[property^="og:"]` and 1
    `meta[name^="twitter:"]` in `index.html`; (c) `og:title` equal to the text
    of the `<title>`; (d) the `<link rel="canonical">` and the block
    `<script type="application/ld+json">` appear after the index of the
    anti-flash script; (e) JSON-LD **parsed** (`JSON.parse` + `toEqual`
    against the expected object of six exact keys; the formatting of the block
    is not part of the contract): `name`/`jobTitle`/`sameAs` (in order) match
    `profile.name`, `profile.headline` and `social[].url` of
    `src/content/cv.en.json` read with `fs`, and `url` of the JSON-LD ≡ `href`
    of the canonical ≡ `og:url` (in addition to the literal); (f) `public/og-image.png`
    is a real 1200×630 PNG (signature + IHDR, like the apple-touch one of T14, **with the
    path in a variable** — T14b lesson). **Regime #101 declared (as
    in T17):** assertion (f) is born green because the PNG already exists
    uncommitted; the commit is still red because of (a)–(e). `feat(Foundation): T19`:
    `index.html` with the `<meta>` tags (description, og×5, twitter) after the
    `<title>` and before the anti-flash, and canonical + JSON-LD after the
    apple-touch-icon, before `</head>`; **exact literal texts of the
    spec's table, with no other tag** (condition 1 of #117); the
    anti-flash and its "verbatim" test intact; `public/og-image.png` goes
    **untouched** into the commit with an explicit `git add` of the path (it is not
    regenerated); the `feat` does not touch tests; `npm run lint`, `npm run typecheck`
    and `npm test` green after the `feat`.
  - Closing the piece (not the builder's job): the reviewer's full
    review + `npm run build` (#80) + QA on `dist/index.html` (tags
    intact: Vite did not rewrite the literals) and `dist/og-image.png`
    present; docs #86 + BACKLOG ("Metadata and Open Graph" resolved; "SEO
    per language" stays open) + hashes of #117, in the orchestrator's charge;
    with the user's approval, `spec.md` goes back to `Status: implemented`.

## Change #118 — `projects` collection (user's request, 2026-11-14)

- [x] **T20. `projects` in the schema, the content and the texts.** RF-7 (#118) — 4c63dc3 (test) · 9b0f0f8 (test, T20b: unused variable in a helper of the test itself; assertions intact) · 4ae17a1 (feat) (lint/typecheck/477/41/validate:content green)
  - Done when: `test(Foundation): T20` (red) **only adds** to `src/content/content.test.ts`: the validator rejects a CV with no `projects` (`required`) and accepts `projects` with a `TimelineEntry` entry; en/es parity of ids and of `start`/`end` of `projects`; date order of each `projects` entry; `uiEn.resume.projects` and `uiEs.resume.projects` exist and are not empty. `feat(Foundation): T20`: `data/cv.schema.json` adds `projects` (array of `TimelineEntry`, **required**, between `experience` and `skills`); `data/*.generated.*` regenerated with the scripts; `data/cv.example.{en,es}.json` get `"projects": []` (no invented content); `src/content/cv.{en,es}.json` move the `cv-agentic` entry from `experience` to `projects` with the organization and the description the user provided (the rest of the content does not change); `src/i18n/ui.{en,es}.ts` add `resume.projects` ("Projects" / "Proyectos"); `foundations/i18n.md` documents the new key; lint, typecheck, test and `validate:content` green after the `feat`.

## Change #119 — Avatar in WebP (user's request, 2026-11-15)

- [x] **T21. `avatar.png` → `avatar.webp`.** RF-7 (#119) — 23cd835 (test, red ×3) · 37f6659 (feat) (lint/typecheck/482/41/validate:content/build green; `dist/images/avatar.webp` present, no `avatar.png`)
  - Done when: `test(Foundation): T21` (red) **only adds** to `src/content/content.test.ts`: `profile.avatar.src` is `/images/avatar.webp` in both languages; `public/images/avatar.webp` exists and has a WebP signature (`RIFF`…`WEBP`, path in a variable); `public/images/avatar.png` does not exist. `feat(Foundation): T21`: adds `public/images/avatar.webp` (512×512 with alpha, `cwebp -q 82 -m 6 -alpha_q 100`), deletes `public/images/avatar.png` and updates `profile.avatar.src` in `src/content/cv.{en,es}.json` and `data/cv.example.{en,es}.json`; lint, typecheck, test and `validate:content` green after the `feat`; `build` at closing (`dist/images/avatar.webp` present, no `avatar.png`).

## Change #121 — "Why-only" comments in English (user's request, 2026-11-15)

- [x] **T22. Guard test of the comment policy.** L1/L2 (#121) — 870aa69 (a single test commit, green when written: regime #101 declared; checked by mutation that it fails on a comment in Spanish and on an internal reference)
  - Done when: `src/test/comments.test.ts` goes through `src/`, `tokens/`, `data/constants.ts`, `vite.config.ts`, `eslint.config.js` and `index.html` and fails if a comment is in Spanish or carries internal references (RF-n, Tn, decision n, #n, §n). The previous cleanup (one `chore(<Name>)` per piece, messages and code outside `src/`) has no task of its own: it changes no behavior and was verified with the mechanical proof of #121.

## Change #122 — Documentation in English (user's request, 2026-11-15)

- [x] **T23. Guard test of the documentation language.** L1 (#122) — 2866724 (a single test commit, green when written: regime #101 declared; checked by mutation that it fails on a sentence in Spanish)
  - Done when: `src/test/comments.test.ts` also goes through `AGENTS.md`, `README.md`, `docs/`, `specs/`, `foundations/` and the agents, skill and commands of `.opencode/` and fails if a line of prose is in Spanish; code blocks, inline code, quoted interface strings and people's names are not prose. The translation itself (117 documents, one `docs(i18n)` commit per group) has no task of its own: it changes no code and was verified with a structure comparison per document.
