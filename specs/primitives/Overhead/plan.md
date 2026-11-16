# Plan — Overhead

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Overhead/Overhead.tsx` | block-level `span`/`dt` root with the text as is | RF-1, RF-2 |
| `src/components/Overhead/Overhead.module.css` | `uppercase`, `--color-text-muted`, `--font-size-overhead`, ellipsis (`hidden/ellipsis/nowrap`), `block` | RF-1, RF-3, RF-5 |
| `src/components/Overhead/Overhead.test.tsx` | tests + a11y closing case | all |
| `src/components/Overhead/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`OverheadProps { children: React.ReactNode; as?: "span" | "dt"; className?: string }`
(O-2: `"p"` left out of the type). `className` joined to the root (P3).

## Decisions

- Uppercase **through CSS only** (`text-transform`): the DOM keeps "Email".
  *Discarded:* transforming the string (it would break screen readers).
- Ellipsis with no `max-width` of its own (O-1): the width restriction belongs to the
  container (Sidebar); in jsdom it is not computed → inspection (P1).
- RF-4 (contrast on `bg`) is a usage restriction: the reviewer verifies it in
  F3 (P1). `as` restricted to `span | dt` (O-2; discarded keeping `"p"` with no
  documented consumer).

## Test strategy

`getByText` with the original text (untransformed); `tagName` by `as` (with a
scaffold `<dl>`); P2 classes for the ellipsis; `expectNoA11yViolations` closing case.
P1: uppercase/ellipsis/size/`@media` by CSS inspection. `npm test`.

Coverage: T1→RF-1 · T2→RF-2 · T3→RF-3,RF-4,RF-5,RF-6.
