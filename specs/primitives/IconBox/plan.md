# Plan — IconBox

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/IconBox/IconBox.tsx` | decorative root `<span>` with a centered `Icon tone="gradient"` | RF-1, RF-2 |
| `src/components/IconBox/IconBox.module.css` | `--size-icon-box` square, `--color-surface-muted`, `--radius-12`, centered inline-flex | RF-3 |
| `src/components/IconBox/IconBox.test.tsx` | tests + a11y closing case | all |
| `src/components/IconBox/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`IconBoxProps { icon: IconName; className?: string }`. `className` joined to the
root `<span>` (P3) — with the note that `--icon-size` set there does **not** reach the
icon (it does not inherit).

## Decisions

- IconBox **does not pass `--icon-size`** to the `Icon`: it applies Icon's own
  fallback (`var(--size-icon)`) (C-1). *Discarded:* setting the variable in the
  IconBox's `className` (it does not inherit; it would be a broken mechanism).
- It does not mount the gradient's defs: uniqueness belongs to AppLayout (P4); the test mounts
  `AccentGradientDefs` as scaffold (Icon's pattern).
- No margin of its own: the spacing with the text is set by the consumer (C-5).
- Depends on: `Icon` (already built in F2 before this piece).

## Test strategy

Test: svg with `stroke="url(#accent-gradient)"` (with the defs mounted), root with
`aria-hidden="true"`, joining of `className` (P2). P1: size/radius/background with no
`@media`, no `:hover`/`:focus`/transitions and no margin of its own → inspection;
RF-5 (use forbidden inside `Box inner`) is verified by the reviewer in F3. Closing
`expectNoA11yViolations`. `npm test`.

Coverage: T1→RF-1 · T2→RF-2 · T3→RF-3,RF-4,RF-5.
