# Plan — Badge

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Badge/Badge.tsx` | `span`/`li` root with `children: string` | RF-1…RF-3 |
| `src/components/Badge/Badge.module.css` | `surface-muted`, `--radius-8`, padding, `--font-size-badge`, `nowrap`, `inline-flex` | RF-4, RF-5 |
| `src/components/Badge/Badge.test.tsx` | tests + a11y closing case | all |
| `src/components/Badge/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`BadgeProps { children: string; as?: "span" | "li"; className?: string }`
(spec; G-5: the `string` type enforces "text only"). `className` is joined to
the root's base class (P3).

## Decisions

- `children: string` in the type. *Discarded:* `ReactNode` by convention
  (the type must enforce the rule; accessible-name test with `getByText`
  on a string).
- A single component for badge and chip (resolution C7/#31), with no color
  variants.
- RF-6 (not inside `Box inner`) cannot be verified in the primitive: the
  reviewer enforces it in F3/F4 (P1).

## Test strategy

`getByText` on the string; structure by `tagName` + classes (P2); final a11y
case with the badge inside a `<ul>` (`li` case) and standalone (`span` case).
P1: RF-4/RF-5 by CSS inspection (no `@media`, no `:hover`/`:focus`). `npm test`.

Coverage: T1→RF-1,RF-2 · T2→RF-3 · T3→RF-4,RF-5,RF-6.
