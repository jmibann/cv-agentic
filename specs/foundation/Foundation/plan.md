# Foundation — plan

Plan of the piece `foundation/Foundation` (F1). Contract:
[spec.md](spec.md) (`Status: approved`). The `foundation` agent runs it, one
task per assignment ([tasks.md](tasks.md)).

## Files and responsibilities (grouped by task)

| Task | Files it creates | Responsibility |
|---|---|---|
| T1 | `package.json` · `package-lock.json` · `.nvmrc` · `.gitignore` · `tsconfig.json` · `vite.config.ts` · `eslint.config.js` · `src/tooling.smoke.test.ts` | Scaffold of the single project: **exact** deps of `docs/README.md`, scripts, `@data/*` alias (tsconfig `paths` + `resolve.alias` + Vitest), TS `strict` with explicit flags and `types`, flat ESLint with the anti-color `no-restricted-syntax` in `.tsx`, Vitest jsdom `globals: false` |
| T2 | `src/test/setup.ts` · `src/test/setup.test.ts` | jest-dom/vitest, explicit `afterEach(cleanup)`, mocks (`matchMedia`, `ResizeObserver`, `scrollTo`, `showModal/close` if missing), clearing of `localStorage`/`data-theme`/`lang`/`hash` |
| T3 | `src/test/a11y.ts` · `src/test/a11y.test.ts` | `expectNoA11yViolations` on top of `axe-core` (off: `color-contrast`, `region`), exactly as in spec §API / `foundation.md` 5b |
| T4 | `index.html` · `src/test/anti-flash.test.ts` | `<html lang="en">`, `meta theme-color`, anti-flash script **verbatim** from `foundations/theming.md`, `#root` + `<script type="module" src="/src/main.tsx">` |
| T5 | `src/providers/ThemeProvider.tsx` · `ThemeProvider.test.tsx` | `ThemeProvider` + `useTheme`: initial from `data-theme`, a single effect applies `data-theme` + `theme-color`, `toggleTheme`/`setTheme` with try/catch persistence, `matchMedia` listener with no preference (RF-2…RF-5) |
| T6 | `src/i18n/ui.en.ts` · `src/i18n/ui.es.ts` · `src/i18n/format.ts` · `format.test.ts` | Canonical keys of `foundations/i18n.md` (`uiEn as const`, `UiStrings = DeepStringify`, `uiEs satisfies`), pure `format()` |
| T7 | `src/i18n/formatPeriod.ts` · `formatPeriod.test.ts` | Pure `formatPeriod({start,end}, locale, presentLabel)` (RF-8); it does not depend on "today" (`presentLabel` comes in as a parameter) |
| T12 (F3 Change) | `src/i18n/formatPeriod.ts` (+ its test) · `src/i18n/ui.{en,es}.ts` | Export `formatPeriodEndpoint` (per-end formatting, the current private one) without touching `formatPeriod`; key `controls.lightMode` in both languages (ThemeToggle/ControlsBar consume it in F3) |
| T8 | `src/scripts/build-validator.ts` · `data/cv.types.generated.ts` · `data/validate-cv.generated.{js,d.ts}` · `src/content/schema.test.ts` | Working `gen:types` and `build:validator` scripts; generated files committed with the "GENERATED" header; `schema.test.ts` (enums ≡ constants; types up to date) |
| T9 | `src/content/cv.en.json` · `cv.es.json` · `index.ts` · `content.test.ts` | en/es content with `"$schema"` (it started as a copy of `data/cv.example.{en,es}.json`; today it carries the **real CV** — Change #108/#109, commits `63f6665`/`befb0db`; the examples remain as a test fixture); `load()` + `cvByLocale` with `validateCv` (RF-7); en/es parity, date order, in-memory rejections |
| T10 | `src/providers/LocaleProvider.tsx` · `LocaleProvider.test.tsx` | `LocaleProvider` + `useLocale` + `useCv` (RF-5, RF-6): initial from `<html lang>`, `setLocale` sets `lang` + persists + switches `t`/`useCv()` |
| T11 | `src/styles/global.css` · `src/main.tsx` · `src/App.tsx` · `src/App.test.tsx` | Typographic base of `foundations/typography.md` + reset + `html:has(dialog[open])`; `main.tsx` imports tokens (relative path, only once), `@fontsource/poppins/{300,400,500,600}`, mounts `ThemeProvider > LocaleProvider > App`; provisional `App.tsx` (a text from `t` + the name from `useCv()`) |

## Pure functions (C1)

- `format(template, values)` — no date; replaces `{key}`, a missing
  placeholder stays literal.
- `formatPeriod(period, locale, presentLabel)` — date logic; **"today" is not
  involved**: `end: null` → `presentLabel` (parameter), normalization
  only for comparing (`YYYY` → `YYYY-01`/`YYYY-12` in T9, not here).
- `load(raw, file)` (T9) — `validateCv` type guard + throw with
  `validateCv.errors`; no React or DOM.
- `expectNoA11yViolations(container)` (T3) — wrapper of `axe.run` + `expect`.

## Non-trivial algorithms (pseudocode)

**T8 `build-validator.ts`** (ajv standalone, draft-07):

```
read data/cv.schema.json
ajv = new Ajv({ code: { source: true }, allErrors? no → default })  // standalone: true, type: "module"?
compile(schema) → standalone module → write data/validate-cv.generated.js
write data/validate-cv.generated.d.ts:
  import type { CvData } from "./cv.types.generated";
  export declare function validateCv(data: unknown): data is CvData;
  export declare namespace validateCv { let errors: … | null }  // depending on the shape of ajv standalone
```

**T4 `anti-flash.test.ts`**: read `index.html` and `tokens/tokens.css` with
`node:fs` (Vitest allows Node imports); extract with a regex the two
literals of the script (`#eceef4`/`#151517`) and the values of
`--palette-light-bg`/`--palette-dark-bg`; `expect(both pairs).toEqual`.
Also: the inline `<script>` appears before any `<link>`/`<script
src>` of the bundle.

**T5 RF-4 in jsdom**: `getComputedStyle` does not resolve the variables of `tokens.css`
→ the tests spy on `window.getComputedStyle` to return a controlled value
of `--color-bg` and verify that the meta's `content` **takes that value** on
both paths (toggle and system). Without the spy, the test would only assert `""` and
verify nothing.

## Interface

The full API (signatures of providers, hooks, `format`, `formatPeriod`,
`cvByLocale`, `expectNoA11yViolations`, scripts and alias) is pinned in
[spec.md §API](spec.md); this plan does not extend it.

## Decisions (with the discarded alternative)

1. **Vitest inside `vite.config.ts`** (`test` block: jsdom,
   `globals: false`, `setupFiles`): a single tooling file. *Discarded:*
   a separate `vitest.config.ts` (two config sources for the same project,
   which brushes against S2).
2. **`eslint.config.js` with `ignores` for `data/*.generated.*` and `dist/`**:
   the anti-color rule and `strict` cannot apply to generated code we do not
   control. *Discarded:* retouching the generated files (forbidden: "do not edit by
   hand").
   **Amendment (Change approved by the user, 2026-10-03):**
   `react-refresh/only-export-components` is configured with
   `allowExportNames: ["useTheme", "useLocale", "useCv"]`: the spec's API
   puts provider + hook in the same `.tsx` and the rule, without this exemption, makes
   that contract unsatisfiable. It changes no observable contract of the
   pieces. *Discarded:* moving the hooks to a separate `.ts` (breaks the spec's
   Anatomy). Executed as T5b.
3. **`build:validator` helper in `src/scripts/build-validator.ts`**
   run with plain `node` (Node 24 ships stable *type stripping*) —
   the only place within the foundation agent's `edit` permission (`src/**`).
   *Discarded:* `scripts/` at the root (outside the allowlist) and `ajv-cli`
   (unapproved dependency, S1).
4. **`gen:types` through the `json-schema-to-typescript` CLI** with the banner option
   "GENERATED — do not edit" (originally in Spanish; English since #121); the validator's `.d.ts` is written from the helper
   of T8. *Discarded:* maintaining types by hand (the source of truth is the
   schema; P1/C3).
5. **`ui.es.ts` parity only through `satisfies UiStrings`** (typecheck =
   verification, as `foundations/i18n.md` says). *Discarded:* a runtime test
   of UI keys (it is not in the sources; P3).
6. **`index.html` references `/src/main.tsx` from T4** even though `main.tsx`
   shows up in T11: the `build` does not run per task (#80), so the
   broken intermediate state is invisible to the checks; the smoke test of T4 does not load the
   bundle. *Discarded:* postponing the `script` tag to T11 (the anti-flash loses
   its `<head>` order test).
7. **Tests that read repo files** (T4 anti-flash, T8 schema up to date) with
   `node:fs` / the generator's API in memory, inside Vitest: they are contract
   tests between documents, not DOM tests. *Discarded:* verifying them only "by
   eye" in review (RF-1 would be left without a test, and the spec requires one).
8. **The provisional `App.tsx` has no CSS of its own**: it inherits `body` from
   `global.css`; so its test only verifies content + axe (T11). *Discarded:*
   example styles (new scope that F4 deletes).

## Test strategy

- Each Tn: commit `test(Foundation): Tn` with the new tests in red (they fail
  because the code is missing, not because of a setup error) → commit `feat(Foundation): Tn`
  → `npm run lint && npm run typecheck && npm test` green (T5/#80). `feat`
  does not touch test files; `test` only adds.
- Commit identity by flag: `git -c user.name="jmiban" commit -m "…"`.
- `npm test` (Vitest run) as the runner for the whole piece; the mocks of T2 hold
  for all future tests; `expectNoA11yViolations` (T3) is already used in T11.
- Dependency order: T1 → T2 → T3 → {T4, T5, T6, T7} → T8 → T9 → T10 → T11
  (T4–T7 are independent of each other; T5 uses the mocks of T2; T10 uses T6 and T9;
  T11 uses everything).
- RF coverage: RF-1→T4; RF-2…RF-5→T5; RF-6→T6 (`t`) + T10 (set/initial/
  storage); RF-7→T8 (generated files up to date) + T9 (`load`/rejections); RF-8→T7.
- When closing the piece: a green `npm run build` + the reviewer's visual
  verification with the app served by the user (#91).

---

# Plan of the motion Change (#106) — RF-9/RF-10

Approved by the user on 2026-11-12 with adjustments (specificity (0,2,0),
`useLayoutEffect` with a mount ref, order of execution, RF-10 with an fs test,
closing with QA + build). Base: `specs/motion/proposal.md` §4.1. Unit of
delegation: one task = `test(Foundation): Tn` (red) + `feat(Foundation): Tn`
(#73); T15 and T18 belong to the kit and the user executes them.

## Files of the Change (grouped by task)

| Task | Files | Responsibility | Owner |
|---|---|---|---|
| T15 | `tokens/tokens.css` | RF-10 scale: `base 0.2s`, `slow 0.3s`, `exit 0.22s`, `stagger 0.03s`, `ease-enter`/`ease-exit`; reduced motion → the **5** durations to `0.01ms` | user (kit, precedent `--z-skip` `b2563f0`) |
| T16 | `src/providers/ThemeProvider.tsx` · `ThemeProvider.test.tsx` · `src/styles/global.css` | RF-9: switching + `data-theme` + meta in the **same** `useLayoutEffect`; rule `:root[data-theme-switching] *,::before,::after { transition: none }` | `foundation` |
| T17 | `src/test/anti-flash.test.ts` (or a new fs test in `src/`) | RF-10: contract of the values of `tokens.css` (5 durations, `ease-enter`/`ease-exit`, reduced-motion override) read with `fs` | `foundation` (writes only `src/**`; reads the kit) |
| T18 | `foundations/motion.md` + browser QA + `build` | docs: tokens, theme with no transitions, reduced motion with delays, rule "no `transition` in selectors ≥ (0,2,0)" (governs Changes 2–4; the reviewer verifies it); QA §2.3 of the proposal with `base` 0.2s | user + reviewer |

## Decisions of the Change (with the discarded alternative)

1. **A single `useLayoutEffect`**: it adds `data-theme-switching`, applies
   `data-theme` and the `theme-color` meta; a **first-mount ref** skips the
   initial suppression (consistent with the spec: interactive changes only).
   *Discarded:* a passive `useEffect` + a separate layout one (`data-theme` can
   paint before the switching and leaks the color transition; a finding by the
   user at the gate).
2. **Double `requestAnimationFrame`** to remove the attribute; unconditional
   cleanup with `cancelAnimationFrame` on unmount or on changing again.
   *Discarded:* a fixed `setTimeout` (it guarantees neither the frame nor the order).
3. **Global rule `:root[data-theme-switching] *` (0,2,0)**, without
   `!important` (+ pseudos). *Discarded:* `html[data-theme-switching] *`
   (0,1,1): it ties with `.social a`/`.contacts a` and loses by load order.
   *Also discarded:* a `no-transition` class per component (invasive).
4. **RF-10 with an `fs` test (T17), not inspection alone**: `anti-flash.test.ts` already
   reads `tokens.css` with `fs`; the assertions are added to it. Regime #101:
   a single commit `test(Foundation): T17`, green when written (it mirrors the
   approved document of T15); it requires T15 applied.
5. **`--duration-slow` is repurposed** (0.6→0.3s; zero current uses).
   *Discarded:* a parallel token `--duration-content` (proliferation).
6. **The anti-flash** of `index.html` **is not touched**. *Discarded:* extending the
   suppression to the first paint.

## Execution and coverage

- Order: **T16 is delegated right away** (it does not depend on T15: jsdom with mocked rAF and the
  global rule read no durations). **The user does T15 when they can**;
  only with T15 applied is **T17** delegated (it asserts the values of the document).
  **T18** closes the Change.
- Coverage: RF-9 → T16 (tests: applies before the theme + removes at 2 frames,
  cleanup on unmount, rapid change with no orphans, same through the system path, initial
  mount with no attribute). RF-10 → T15 + T17.
- Closing the Change: T18 — visual QA of the existing transitions at 0.2s
  (tabs, chevron, Button hover/press, bullet, dialog; §2.3 of the proposal) +
  a green `npm run build` + the user's approval → `Status: implemented`.
- Code commits: `test/feat/fix(Foundation): Tn` (T16), `test(Foundation):
  T17`; the user commits T15/T18.

---

# Plan of Change #117 — SEO and sharing metadata

Approved by the user on 2026-11-14 at the Plan+Tasks gate (spec
re-approved in `472bc1d`). Base: decision #117 (`docs/README.md`) and its six
conditions.
Unit of delegation: one task = `test(Foundation): T19` (red) +
`feat(Foundation): T19` (#73/#101).

## Files of the Change (grouped by task)

| Task | Files | Responsibility | Owner |
|---|---|---|---|
| T19 | `index.html` · `src/test/anti-flash.test.ts` · `public/og-image.png` | RF-11…RF-14: the nine metadata blocks with the literals of the spec's table and the approved placement; the contract tests are added to `anti-flash.test.ts` (additions only); the user's PNG goes **untouched** into the `feat` (it is not regenerated) | `foundation` |

## Decisions of the Change (with the discarded alternative)

1. **Placement (approved at the spec gate):** the `<meta>` tags (description,
   og, twitter) after the `<title>` and **before** the anti-flash — a `<meta>`
   is neither a `<link>` nor a `<script src>`, the T4 contract is not broken and the
   standard order is title→description→OG→twitter —; `<link rel="canonical">` and the
   JSON-LD after the icons block, before `</head>`. *Discarded:*
   everything at the end of the `<head>` (uniform, but it separates `og:title` from the `<title>`
   with the script in between). *Also discarded:* canonical before the
   anti-flash (breaks T4, `anti-flash.test.ts:123`).
2. **Absolute literal URLs of the GitHub Pages deploy, pinned in the HTML**
   (condition 3 of #117; Vite does not rewrite them in `index.html`). *Discarded:*
   deriving them from `import.meta.env.BASE_URL` or `assetUrl()` (they are runtime; the
   metadata HTML is static and `og:*` requires an absolute URL).
3. **The test cross-checks the JSON-LD with `src/content/cv.en.json` read with `fs`**
   (`name`/`jobTitle`/`sameAs`), **comparing it parsed** (`JSON.parse` +
   `toEqual` against the object of six exact keys; the formatting of the block is not
   part of the contract): if the content changes and the JSON-LD does not follow, the mismatch
   is caught here. Also the identity `url` of the JSON-LD ≡ `href` of the canonical
   ≡ `og:url` (if the domain ever changes, no tag is left without
   updating). *Discarded:* only duplicated literals with no cross-check (the mismatch
   would go unnoticed). *Also discarded:* importing `cv.en.json` as a
   module (the contracts between documents of the base plan, decision
   7, govern here; the React/DOM `no-restricted-imports` does not apply: it is an `fs` test).
4. **Home of the tests: `src/test/anti-flash.test.ts`** (extension, additions
   only). *Discarded:* a new file (two homes for the contract of the same
   `index.html`; the T4 one already reads the file and has the helpers `capture` /
   `readRepoFile` and the T14b lesson of the path in a variable).
5. **Tag count as a separate assertion** (exactly 5
   `meta[property^="og:"]` and 1 `meta[name^="twitter:"]`): it covers the passage
   "no other tag outside the list" of RF-11 (condition 1).
   *Discarded:* leaving the limit only in "Do not" (without a test it is not
   verifiable, P3).
6. **Partial and declared regime #101:** the PNG assertion (signature + IHDR
   1200×630) **is born green** because the file already exists uncommitted; the
   `test(Foundation): T19` commit is red anyway because of the tags
   missing from `index.html`. It is declared in the body of T19 (tasks).

## Execution and coverage

- Order: a single task **T19** (no internal dependencies; the spec already pins
  literals and placement).
- Coverage: RF-11 → exact literals + 5+1 count + `og:title` ≡ `<title>`;
  RF-12 → parsed JSON-LD `toEqual` (six keys) + cross-check with `cv.en.json` +
  identity `url`/canonical/`og:url`; RF-13 → order of canonical and JSON-LD after
  the anti-flash (the pre-existing T4 test still holds); RF-14 → 1200×630 PNG
  (signature + IHDR, path in a variable, T14b lesson).
- The test "copies the inline script verbatim from foundations/theming.md" and
  the pre-existing T4 contract **are not touched**: the new `<meta>` tags do not
  affect them (`extractInlineScript` matches only a bare `<script>` with no attributes;
  the JSON-LD carries `type` and does not collide).
- Closing the piece (the piece is reopened with this Change): when
  T19 ends, the reviewer's full review against the spec + a green `npm run build`
  (#80) + the reviewer's QA on `dist/index.html` (tags intact after the
  build: Vite did not rewrite the literals) and the presence of `dist/og-image.png`
  (no server; inspection of `dist/`). Docs #86 + BACKLOG ("Metadata and
  Open Graph" resolved; "SEO per language" stays open) + hashes of #117:
  the orchestrator does them at the closing gate, not the builder.
- Code commits: `test(Foundation): T19` (red; explicit `git add` of the
  test file) → `feat(Foundation): T19` (`index.html` + `public/og-image.png`
  with an explicit `git add public/og-image.png`; the `feat` does not touch tests).

# Plan of Change 2026-11-17 — surname without the accent

The accent comes off the surname in the live literals ("Ibáñez" → "Ibañez"):
`index.html` (`<title>`, `og:title`, JSON-LD `name`), `profile.name` of
`src/content/cv.{en,es}.json`, the testimonial quote of `cv.en.json` and
`public/og-image.png` (a regenerated variant differing only in the surname).
Historical records and the root `README.md` are not touched.

## Files of the Change (grouped by task)

| Task | Files | Responsibility | Owner |
|---|---|---|---|
| T24 | `src/test/anti-flash.test.ts` · `index.html` · `src/content/cv.{en,es}.json` · `public/og-image.png` | RF-11/RF-12: the three literals of `index.html` and the three hardcoded literals of the test; RF-7: `profile.name` (en/es) and the quote of `cv.en.json`; RF-14: the new 1200×630 PNG goes untouched into the `feat` | `foundation` |

## Decisions of the Change (with the discarded alternative)

1. **A single task, no red between tasks (the user's instruction):** `foundation`
   holds the whole scope. *Discarded:* splitting into a `foundation` task and an
   `integrator` content task — the test cross-checks the JSON-LD `name` against
   `profile.name` of `cv.en.json`, so the split would leave the suite red between tasks.
2. **The test commit changes the three existing literals** (a user-approved Change;
   nothing is weakened: same assertions, new spelling). *Discarded:* adding a parallel
   test (it would leave a test contradicting the spec).
3. **`src/test/comments.test.ts` is not touched:** its whitelist keeps the accented
   form for the historical records; the bare new spelling trips the `ñ` of the SPANISH
   class, so in documents it goes only inside backticks, quotes or code blocks
   (the user's rule).
4. **Historical records keep the accented form** (`docs/README.md` #115,
   `docs/qa-report.md`, `specs/motion/proposal.md`, closed tasks) and the root
   `README.md` stays as it is (the user's decision).

## Execution and coverage

- Order: a single task **T24**.
- Coverage: RF-11 → the literals of `<title>` and `og:title` (the equality test
  already holds); RF-12 → the JSON-LD `name` literal + the existing cross-check with
  `cv.en.json`; RF-7 → `profile.name` en/es + the quote of `cv.en.json`
  (`validate:content` + the existing parity tests); RF-14 → the PNG keeps 1200×630
  (signature + IHDR, existing test) + the reviewer's visual check (no accent in the
  surname, the rest identical to the current PNG).
- Code commits: `test(Foundation): T24` (red; the three literals of
  `anti-flash.test.ts`; explicit `git add` of the test file) → `feat(Foundation): T24`
  (`index.html` + `src/content/cv.{en,es}.json` + `public/og-image.png` with an
  explicit `git add public/og-image.png`; the `feat` does not touch tests).
- The reviewer: per task and at closing — lint/typecheck/test,
  `npm run validate:content`, `npm run build` (closing of the piece, #80) and the
  visual check of the image (reads `public/og-image.png` and compares it with the
  pre-Change version in git).

# Plan of Change 2026-11-17-2 — English policy beyond `src/` comments

Audit finding F1 (approved by the user): the #121 rule was not fully enforced outside
`src/`. Three verified leaks: Spanish comments with internal references in
`tsconfig.json`; the Spanish `message` of the `no-restricted-syntax` rule in
`eslint.config.js` (L53); the Spanish comments inside the `DECLARATIONS` template of
`src/scripts/build-validator.ts` (L59–60, L67–68), which are emitted into
`data/validate-cv.generated.d.ts` (L2–3, L10–11). The guard missed them because it
scans only comments, only in its `ROOTS`, and `tsconfig.json` is not in `ROOTS`.

## Files of the Change (grouped by task)

| Task | Files | Responsibility | Owner |
|---|---|---|---|
| T25 | `src/test/comments.test.ts` · `tsconfig.json` · `eslint.config.js` · `src/scripts/build-validator.ts` · `data/validate-cv.generated.d.ts` | L1/L2 (#121): the guard extended (tsconfig in `ROOTS`; string-literal check for the two tooling files) — red; the three translations + regeneration of the `d.ts` by the script — green | `foundation` |

## Decisions of the Change (with the discarded alternative)

1. **String check via the TS AST, scoped to the two named files** (`StringLiteral`,
   `NoSubstitutionTemplateLiteral` and template literal spans): it catches exactly the
   ESLint `message` and the emitted `DECLARATIONS` text. *Discarded:* a whole-file
   regex (false positives on the selector regex and import paths); repo-wide string
   scanning (would flag the sanctioned Spanish of `src/i18n/ui.es.ts` and the guard's
   own patterns); adding the generated `d.ts` to `ROOTS` (generated files are
   regenerated, not policed — the fix belongs in the emitting template).
2. **`tsconfig.json` enters `ROOTS` as a file path** (like `data/constants.ts`,
   bypassing the extension filter); parsed with the TS parser as JSONC-tolerant
   trivia. Its red-listing is a **stop condition** (Done when check 1): if the parser
   does not surface the comments, the guard does not cover the file and the user
   decides the alternative (JSONC-aware extraction) instead of a fake-green guard.
3. **Both Spanish tests must list tsconfig in the red output**: the Spanish test
   (the comments) and the internal-references test (`(decisión #63)` matches
   `decisi[oó]n\s+#?\d+`).
4. **Regeneration, not hand-edit** (`npm run build:validator`): byte-identity of
   `data/validate-cv.generated.js` is a **stop-and-report condition** (Done when
   check 2) — only the `d.ts` may change.
5. **Translations keep the why and lose the references**: the tsconfig comments
   (single-config rationale, TS-6 default-change note, `skipLibCheck` reason), the
   ESLint message (pointer to `docs/DESIGN.md` hard rule 1 stays, in English) and the
   emitted `DECLARATIONS` comments. The L142 whitelist is not touched.

## Execution and coverage

- Order: a single task **T25**; no other task depends on it.
- Coverage: L1/L2 of the constitution as enforced by the guard (T22/T23 lineage);
  no RF changes (the guard cites the rules, not the RFs).
- Code commits: `test(Foundation): T25` (red; explicit `git add` of the test file) →
  `feat(Foundation): T25` (`tsconfig.json` + `eslint.config.js` +
  `src/scripts/build-validator.ts` + the regenerated `data/validate-cv.generated.d.ts`
  — the `feat` does not touch tests).
- The reviewer: per task — the red output lists all expected offenders and nothing
  else; after the `feat`, the guard is green, `git diff` of the `d.ts` shows only the
  comment lines, `data/validate-cv.generated.js` unchanged, and lint/typecheck/test/
  `validate:content` green; `npm run build` at closing.
