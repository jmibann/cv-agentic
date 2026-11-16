# Plan — ControlsBar

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/ControlsBar/ControlsBar.tsx` | `<header class="controlsBar">` > `div role="group">` with `ThemeToggle` + `LanguageSwitcher`; consumes `useLocale().t.controls` | RF-1…RF-3 |
| `src/components/ControlsBar/ControlsBar.module.css` | right-aligned flex, height `--size-control`, `z-index: var(--z-controls)`, `gap: var(--controls-gap)` | RF-1, RF-6 |
| `src/components/ControlsBar/ControlsBar.test.tsx` | tests + a11y closing case | all |
| `src/components/ControlsBar/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`ControlsBarProps { className?: string }` (on the root `<header>`, G-B). It receives no children: it composes the two controls itself (spec → Anatomy).

## Decisions

- It passes its children the labels of `t.controls` (`label`, `language`, and in ThemeToggle `darkModeLabel=t.controls.darkMode` + `lightModeLabel=t.controls.lightMode` — it depends on **Foundation T12**).
- RF-4 and the uniqueness of the banner remain as invariants of **AppLayout/F4** (decision 4): in this piece there is no task or test; the plan declares it and the reviewer verifies it in F4/F5.
- RF-5: the module **declares no text** (the piece paints no text of its own; its children bring theirs) — verification by inspection.
- `useLocale()` in the bar: a C2 exception analogous to the controls (there is no RF 6 of its own in the spec; the API documents it) — if the reviewer asks for it, it is formalized with an RF in the next spec review; no new scope is added now.
- Print: no `@media print` of its own (G-D-1); the shared styles hide it (F4).

## Test strategy

Harness: real `ThemeProvider` + `LocaleProvider` (the children consume both), reset of `data-theme`/`lang`/storage in `afterEach`. Tests: `banner` contains a `group` with a name (en) and the two controls by role+name; click on "Español" → `group` becomes "Ajustes de visualización" and the toggle gets labels in Spanish (RF-3); `expectNoA11yViolations`. RF-1/RF-6/RF-5 by CSS inspection (#101).

Coverage: T1→RF-2,RF-3 · T2→RF-1,RF-5,RF-6 + closing. (RF-4: AppLayout, no task here.)
