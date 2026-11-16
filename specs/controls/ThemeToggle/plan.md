# Plan — ThemeToggle

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/ThemeToggle/ThemeToggle.tsx` | a single `<button>`; consumes `useTheme()`; label by theme; `aria-pressed` | RF-1…RF-4, RF-6 |
| `src/components/ThemeToggle/ThemeToggle.module.css` | size/background/border/radius/shadow/color, hover, focus-visible, press + transition | RF-4, RF-5 |
| `src/components/ThemeToggle/ThemeToggle.test.tsx` | tests + a11y closing case | all |
| `src/components/ThemeToggle/index.ts` | re-export | — |

## Pure functions and algorithm

None. The active label is a trivial branch: `theme === "light" ? darkModeLabel : lightModeLabel`.

## Interface

`ThemeToggleProps { darkModeLabel: string; lightModeLabel: string; className?: string }`
(spec → API, decision 1=a). It consumes `useTheme()` (`{ theme, toggleTheme }`; documented C2 exception, RF-6).

## Decisions

- The click calls **`toggleTheme()`** from the context: neither `localStorage` nor `data-theme` is the component's business (G-A). *Discarded:* duplicating the persistence here.
- It depends on **Foundation's Change T12** (`controls.lightMode` in `ui.{en,es}.ts`): without that key, `t.controls.lightMode` does not compile. T12 is a previous task of the phase, delegated to `foundation`.
- The icon is decorative: `<Icon name={theme === "light" ? "moon" : "sun"} />` (`tone="current"` default; neither carries `label`).
- `className` joined to the root `<button>` (G-B, assertion pattern #99).
- Press transition: `transition: transform var(--duration-fast) var(--ease-standard)` (G-E; `transition: all` forbidden).
- No anti-`react-refresh` fix expected: the `.tsx` only exports `ThemeToggle` + `ThemeToggleProps` (nothing to spy on; #96/#100 do not apply).

## Test strategy

Harness: real `ThemeProvider` + reset of `data-theme` and `localStorage["cv:theme"]` in `afterEach` (spec → Tests note; the provider already exposes the seed through `data-theme`, like its own F1 tests). Queries by role `button` + name. RF-1/2 are verified **in integration** (after a click `aria-pressed`, the label and `dataset.theme`/storage change — the provider+component assertion checks them, without duplicating what `ThemeProvider.test.tsx` already covers). Icon by the class `lucide-moon`/`lucide-sun` propagated by Icon (the spec's criterion). Keyboard: Tab + Space. Closing `expectNoA11yViolations` on both theme branches.

Coverage: T1→RF-1,RF-2,RF-3,RF-6 · T2→RF-4 · T3→RF-4(ring by inspection),RF-5 + closing.
