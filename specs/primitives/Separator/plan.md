# Plan — Separator

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Separator/Separator.tsx` | decorative `<div>` with `aria-hidden="true"` | RF-1, RF-2 |
| `src/components/Separator/Separator.module.css` | 1px line `--color-track`, full-bleed with `calc()` of `--box-padding`, `margin-block: var(--separator-gap)` | RF-3, RF-4, RF-5 |
| `src/components/Separator/Separator.test.tsx` | tests + a11y closing case | all |
| `src/components/Separator/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`SeparatorProps { className?: string }`. `className` joined to the root (P3).

## Decisions

- `<div>` with `aria-hidden`, never `<hr>` or `role="separator"`: it is decoration
  (an `hr` would announce a thematic break of the section).
- `margin-block` on **both sides** (resolution P-2): the separator's container
  must not add `gap` in that stretch; the block-line-block space is
  provided entirely by the Separator. *Discarded:* `margin-block-end` only (the line
  would stick to the previous block).
- Full-bleed with negative margins + width derived from `--box-padding`
  (exception #54 to "no outer margin"; it depends on the outer Box).

## Test strategy

Test: root with `aria-hidden="true"`, `tagName` `div`, no separator role
(`queryByRole("separator")` null), `className` joined (P2), closing
`expectNoA11yViolations`. P1: thickness, color, full-bleed and margins (RF-1/3/4/5)
are verified by CSS inspection (jsdom does not compute). `npm test`.

Coverage: T1→RF-1,RF-2 · T2→RF-3,RF-4,RF-5 · T3→RF-3 (className) + a11y.
