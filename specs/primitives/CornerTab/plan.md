# Plan — CornerTab

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/CornerTab/CornerTab.tsx` | root `<div>` with `children`; classes by `size` and `placement` | RF-1…RF-3, RF-6 |
| `src/components/CornerTab/CornerTab.module.css` | base absolute/z-raised, background `surface-raised`, mandatory borders, asymmetric radius; `sm/md` variants; `@media (min-width: 992px)` only for `.float` | RF-1…RF-5 |
| `src/components/CornerTab/CornerTab.test.tsx` | tests + a11y closing case | all |
| `src/components/CornerTab/index.ts` | re-export | — |

## Pure functions and algorithm

None: a `placement`/`size` → classes map.

## Interface

`CornerTabProps { children; size?: "sm" | "md"; placement?: "overlay" | "float"; className? }`.
`className` joined to the root (P3).

## Decisions

- RF-1 governs **only in overlay**; `.float` sets `position: relative` +
  `z-index: var(--z-raised)` (resolution R-2). The panel's positioned `h1`
  flows beside it and its box covered the lower half of the tab with `auto`; the
  stacking is needed for the tab to receive the clicks. *Discarded:*
  `pointer-events: none` on the `h1` (it breaks text selection) and leaving
  `auto` (the `h1` keeps intercepting).
- Print: **no `@media print` of its own** — it is hidden by the shared style
  of `layout.md`/`global.css` (resolution R-1). *Discarded:* having the module
  hide itself (it breaks the global CSS rule and duplicates the source).
- The only `@media` allowed: `(min-width: 992px)` for float, only with
  tokens/`calc()` of tokens (rule of `breakpoints.md`).
- Mandatory border always (RF-5, 1.14:1 in dark); hover/focus do NOT live here:
  they belong to the content (NavTabs/button).
- `size="sm"` uses the fixed literals 2.75rem/1.25rem allowed by
  `breakpoints.md` (they do not scale).

## Test strategy

P2 classes by `size`/`placement`; root with no `role` and no `aria-*` (attribute
test); children visible. P1: positioning, z-index, float ≥ 992, border
and no-print → CSS inspection + QA when NavTabs/Sidebar use it (F3).
Closing `expectNoA11yViolations`. `npm test`.

Coverage: T1→RF-1,RF-6 · T2→RF-2 · T3→RF-3 · T4→RF-4,RF-5,RF-6 ·
T6→RF-3 (Change 2026-11-10: `.float` above the positioned `h1`).
