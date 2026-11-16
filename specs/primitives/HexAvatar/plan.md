# Plan — HexAvatar

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/HexAvatar/HexAvatar.tsx` | structure `wrap > border > img` + `HexAvatarDefs` (export of the module) | RF-1…RF-3 |
| `src/components/HexAvatar/HexAvatar.module.css` | clip-paths `url(#hex-avatar-outer/inner)`, offsets, `--color-track`, `filter: drop-shadow` of the wrap | RF-1, RF-4, RF-5 |
| `src/components/HexAvatar/HexAvatar.test.tsx` | tests + a11y closing case | all |
| `src/components/HexAvatar/index.ts` | re-export `HexAvatar`, `HexAvatarDefs` | — |

## Pure functions and algorithm

None. The SVG path is **not derived at runtime**: it comes from the fixed coordinates
of the spec ("Shape") and is written in `HexAvatarDefs` with a comment.

## Interface

`HexAvatarProps { src: string; alt?: string; className?: string }` +
`HexAvatarDefs(): JSX` (as in the spec; `className` is joined to the `wrap`, P3).

## Decisions

- Geometry **pinned in the spec** (px + normalized vertices, radii 6/2 px;
  resolution H-1=A): the builder transcribes, it does not invent. *Discarded:* a
  ±1px by-eye criterion in QA (it would diverge between card and dialog).
- `hex-avatar-inner` by a true 4 px geometric inset, not scaled (the original
  RF-4 became prose in "Shape"; RFs renumbered).
- No `-webkit-clip-path` for now; Safari is checked in F5 (resolution H-8).
- No error state: `--color-track` of the `<img>` as a natural placeholder
  (H-4). *Discarded:* `onError` with a fallback (nothing to test in jsdom and no
  requirement).
- The single mount of `HexAvatarDefs` is AppLayout's responsibility (P4).

## Test strategy

Tests: ids of the two `clipPath`s with `clipPathUnits="objectBoundingBox"` (defs);
structure and classes of outline/image (P2; the `url(#…)` by inspection of the
module); `alt` ""/name through `getByRole("img")`; `className` joined to the wrap. P1:
`drop-shadow` with no `box-shadow`, fixed size with no `@media`, zero interactivity →
inspection + axe. Closing `expectNoA11yViolations`. `npm test`.

Coverage: T1→RF-3 · T2→RF-1 · T3→RF-2 · T4→RF-4,RF-5.
