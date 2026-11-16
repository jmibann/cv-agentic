# Plan — Box

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Box/Box.tsx` | container with `variant`/`as`, closed API (no `...rest`) | RF-1…RF-4 |
| `src/components/Box/Box.module.css` | `.outer`/`.inner` with tokens only; `overflow: visible` on outer | RF-5, RF-6 |
| `src/components/Box/Box.test.tsx` | tests + a11y closing case | all |
| `src/components/Box/index.ts` | re-export | — |

## Pure functions and algorithm

None: `const El = as ?? "div"` with classes chosen by `variant`.

## Interface

`BoxProps` of the spec: `variant`, `as`, `children`, `id`, `aria-label`,
`aria-labelledby`, `className`. Nothing else reaches the DOM (RF-3/RF-4). `className`
is joined to the variant's class on the single root element (P3).

## Decisions

- Closed API with no pass-through of `role`/`tabIndex`/`...rest` (resolution A3 of
  the audit: the tabpanel is **not** a Box). *Discarded:* keeping a generic
  pass-through (dead and dangerous for a11y).
- `outer` declares an explicit `overflow: visible` (the CornerTab and the Sidebar's
  avatar depend on it); `inner` **does not declare** `overflow` (resolution X-3,
  visible by default). *Discarded:* `hidden` on inner (it clips the tinted
  radius).
- RF-4 (non-transmission) has no unit test: the closed props type
  guarantees it at compile time and an untyped use does not exist in the project
  (P1: inspection).
- Zero `@media`: all the responsive behavior comes from `--box-padding`,
  `--box-inner-padding` and `--radius-box-inner` (RF-5).

## Test strategy

RTL with queries by role (`complementary`/`region` through `aria-label`) and
P2 class assertion (`styles["outer"]` etc.). P1: RF-4/RF-5/RF-6 by
inspection of the CSS/DOM in the review. Closing with `expectNoA11yViolations`
(outer and inner). `npm test`.

Coverage: T1→RF-1,RF-3 · T2→RF-2 · T3→RF-3 · T4→RF-4,RF-5,RF-6.
