# Plan — AppLayout

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/AppLayout/AppLayout.tsx` | full composition (spec → Anatomy, literal): defs ×1, skip link with `data-print-hide`, `div.container` (it receives `className`), ControlsBar, `div.grid`, Sidebar (sticky via `.aside`), `main`, `Box variant="outer" as="section"`, NavTabs with the `isTabId` guard, `div[data-print-stack]` with the tabpanel (`data-print-page={active}`) + inactive block (`data-print-only`, `data-print-page={inactiva}`, `hidden`); module-level `TAB_IDS`/`TabId`/`isTabId` (`isTabId` **not** exported) | RF-1..RF-8 |
| `src/components/AppLayout/AppLayout.module.css` | page layout according to `foundations/layout.md`: container/gutter, grid `<lg` 1 col / `≥1200` 3+9, sidebar sticky only `@media (min-width: 1200px) and (min-height: 900px)` (`--z-sticky`), `.panel` `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))` < lg and `0` in `@media (min-width: 992px)`, `.panel` not flex/grid/`overflow` visible, skip link hidden → with focus (top left, `--color-surface`/`--color-accent-text`/`--radius-8`/`--shadow-control`/`--z-skip`), tabpanel focus `:focus-visible` standard ring | RF-1 (no-BFC), spec styles |
| `src/styles/global.css` | **work of the integrator with no spec of its own**: new `@media print` block with the contract of spec → "Print": `[data-print-stack] { display: flex; flex-direction: column }`, `order` by `[data-print-page]` (`about: 0`, `resume: 1`), `[data-print-only] { display: block }`, hide `header`, `[role="tablist"]`, `[data-print-hide]`, `aside button`; `break-inside: avoid` on `article` and `li`; expansion of the Sidebar's contacts with a selector on its real markup (inspect `Sidebar.tsx`; if there is no stable hook, it is noted for QA F5) | RF-8, contract foundations |
|  | ⚠️ **Updated by the F5 Change #104 (T7)**: the native selectors of the previous row lost on specificity (qa-report B-2/B-3/M-1); T7 replaces them with the compound hooks `header/div/button[data-print-hide]` + `aside [download]` — see spec → "Print" and tasks T7 | — |
| `src/App.tsx` | replacement of the provisional F1 one (the Foundation spec authorizes it): `App` renders `<AppLayout />`; `src/App.test.tsx` is **adapted** to that contract (see Decisions) | integration |
| `src/components/AppLayout/AppLayout.test.tsx` | tests 1–12 of the spec; wrappers with the real `ThemeProvider` + `LocaleProvider`; hash by `window.history.replaceState(null, "", "#resume")` before mounting; `spy` on `replaceState`; manual `HashChangeEvent` for `hashchange` | all |
| `src/components/AppLayout/index.ts` | re-export `AppLayout` + `AppLayoutProps` | — |

## Pure functions and algorithm

- `isTabId(id): id is TabId` — the only algorithm of its own (narrowing guard,
  spec → Anatomy). `focusPanel`: `preventDefault` + `panelRef.current?.focus()`.
- No date/time-dependent logic → no "today" as a parameter.

## Interface

`AppLayoutProps { className?: string }` joined to the `div.container` (the root is
a fragment; decision A7 of the Clarification). It connects `useHashTab(TAB_IDS,
"about")`, `useCv`, `useLocale`, `getTabId` (NavTabs), Sidebar labels
mapped from `t.sidebar.*` + `t.contact` (spec → Anatomy).

## Decisions

- **`isTabId` guard in the `onChange`** (A1): discarded alternative — a Change of
  NavTabs to generic (a piece already `implemented`, the gate rejects it). No casts.
- **Print stack by attributes, a single copy of each page** (A3/A4,
  the user's decision): discarded alternative — `.printOnly` with the inactive one
  (the printed order depended on the tab) and two fixed copies About+Resume (it duplicated
  ids and triggered `duplicate-id-aria` in axe). The contract speaks in `data-*`;
  the native selectors (`header`, `[role="tablist"]`, `aside button`) are
  deliberate (safeguard approved by the user).
- **Cross-cutting print in `global.css`** (hard rule 3): discarded alternative —
  `:global(...)` inside AppLayout's module (it couples the cross-cutting contract
  to one piece). The print palette token already exists (`tokens.css`).
- **`--z-skip: 30` in `tokens.css`** (A10): a new token of the kit; **the
  user adds it by hand** (neither the orchestrator nor the integrator has edit
  permission there). Pending before T5; T5 cannot commit without it.
- **Replacement of `App.tsx` and adaptation of `App.test.tsx`** (T6): the Foundation
  spec declares the App "provisional, the integrator replaces it in F4";
  deleting the placeholder's assertions is **not** weakening a current test —
  it is the authorized replacement. It is documented here and in the `test(AppLayout): T6`
  (precedent F3/TestimonialCarousel T5: update within a task, approved at the
  gate). The adapted test does a smoke check: `render(<App/>)` → `banner` + `h1` +
  tablist exist.
- **Content en/es**: it is not a new task — the bilingual content exists since
  F1; F4 verifies it with tests 5 (AboutPage) / 7 (ResumePage) and test 10
  of AppLayout in both languages.
- **Derived avatar alt (Change 2026-11-10):** `avatarAlt` is composed in
  AppLayout with `format(t.sidebar.avatarAlt, { name: cv.profile.name })` and travels
  in `sidebarLabels`; the Sidebar composes no texts (RF-8 of its spec). *Discarded:*
  storing `alt` in the JSON (it goes out of sync when the name changes) and
  `alt={profile.name}` (it loses "Portrait of"/"Retrato de").

## Test strategy

Render of the whole tree with real providers (the F1 setup already mocks
`matchMedia`, dialog, `scrollTo`, `ResizeObserver`). Tests 1–12 literal from the
spec; test 9 (`document.getElementById("about") === null`) protects the
precondition of `useHashTab` RF-5; test 11 asserts on the tablist (2 tabs, order,
active `aria-labelledby` before/after); test 12 asserts on the stack (inactive one with
`hidden` outside the tabpanel + `getAllByRole h1` length 1, symmetric). Closing
`expectNoA11yViolations` on About and Resume × en/es (test 10). Everything about
`@media print` and the layout CSS: inspection + QA F5 (jsdom does not compute).
`build` and `validate:content` when closing the piece (decision #80).

Coverage: T1→RF-1,RF-6 · T2→RF-2,RF-3,RF-5 (+guard A1) · T3→RF-4 ·
T4→RF-7,RF-8 (DOM layer) · T5→RF-8 (print, inspection) + styles/`--z-skip` +
a11y closing case · T6→integration (`App.tsx`) · T9→derived avatar alt (en/es).

## Annex — Motion change 2 (2026-11-13, #106/#116; Plan+Tasks gate approved with an adjustment in T12)

**New/touched files:** `src/lib/tabDirection.ts` (new),
`src/lib/tabDirection.test.ts` (new), `src/components/AppLayout/AppLayout.tsx`,
`AppLayout.module.css`, `AppLayout.test.tsx`. **Not touched:** `global.css`
(P6), NavTabs, providers, `src/test/**`. Owner of everything: `integrator`.

**Decisions:**

- **P1 — Stable direction with React's official pattern "adjusting state when
  it changes"** (`useState` + conditional `setState` in the render of the component
  itself; spec → Anatomy). *Discarded:* reading/writing refs during the
  render (`react-hooks/refs` with recommended-latest forbids it, blocking for
  lint) and moving `{active, direction}` to the state of `useHashTab` (more invasive:
  it would be a spec Change of the hook). **T11 checklist:** `npm run lint` must
  accept the conditional `setState` under `react-hooks/set-state-in-render`;
  if it rejects it, **escalate to the user before committing the `feat`** (no
  `eslint-disable`).
- **P2 — `animation-fill-mode: backwards`.** *Discarded:* `both` (it leaves
  `transform` applied permanently → stacking context and an altered reference
  for `position: fixed`).
- **P3 — A single `@keyframes panel-enter` with `var(--panel-enter-x)`; the
  variables in `.motionPanel[data-motion-direction="from-left|from-right"]`
  (0,2,0, scoped by the class).** *Discarded:* two `@keyframes` chosen by
  attribute (it duplicates frames with no benefit) and a bare attribute selector (in a
  CSS Module it is global; precedent `.contacts p`). A variable is not a
  `transition`: #116 is fulfilled.
- **P4 — `key={active}` only on the wrapper.** *Discarded:* a key on the tabpanel
  or on the pages (it would break the panel's focus/ARIA).
- **P5 — `animation` declared only in `.motionPanel[data-motion-direction]`.**
  *Discarded:* an unconditional animation on `.motionPanel` (it would animate the initial
  render against RF-9).
- **P6 — Print rule inside the module, placed after the `animation` one**
  (the (0,2,0) tie is resolved by order). *Discarded:* `global.css` (it is
  imported before the modules in `main.tsx`: the module would win the tie and
  the print cancellation would have no effect — the same pattern as `.social a` in
  stage 1).
- **P7 — `getTabDirection` + `MotionDirection` in `src/lib/tabDirection.ts`.**
  *Discarded:* exporting from `AppLayout.tsx` (it would force extending
  react-refresh's `allowExportNames`, #96/#100: new names = the user's
  approval; with `.ts` the list is not touched).
- **P8 — Test 14 is a NO REGRESSION one, green on-arrival declared (#101):**
  the reset between tabs happens since F4 because of the swap of the types
  `AboutPage`↔`ResumePage`; *discarded:* presenting it as proof of the `key`
  (that is the second part of test 13).

**Commits of T12 (adjustment of the gate):** `test(AppLayout): T12` = only test
14 (green on arrival declared, #101); `feat(AppLayout): T12` = only the CSS.
They are not mixed (the reviewer's `git log -p` rule).

**Test strategy of the annex:** RF-9 → jsdom tests 13–16 + pure test 15 in its
file; CSS/animation by inspection and the reviewer's QA with the app served (#91):
animation in both directions, no animation on the initial load, instant reduced
motion, print with no animation and **flow of the `h1` next to the floating corner
tab ≥ 992px** (the wrapper is a block div, with no flex/grid/overflow — RF-6
of the pages). `build` in T13 (closing of the piece/Change, #80).

Coverage of the annex: T10→RF-9 (pure function) · T11→RF-9 (wrapper/attributes,
tests 13/16) · T12→RF-9 (entrance CSS + print, inspection; test 14 no
regression) · T13→closing (build + QA + docs).
