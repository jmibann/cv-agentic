# Plan — BrandIcon

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/BrandIcon/BrandIcon.tsx` | `<svg>` component from `paths.ts` + `BRAND_NAMES` | RF-1…RF-3, RF-5 |
| `src/components/BrandIcon/paths.ts` | data per network: `{ viewBox: string; d: string \| string[] }` (named imports from `simple-icons`; official constants where needed) | RF-1, RF-4 |
| `src/components/BrandIcon/BrandIcon.module.css` | size `var(--icon-size, var(--size-social-icon))` | RF-5, RF-6 |
| `src/components/BrandIcon/BrandIcon.test.tsx` | tests parametrized per network + a11y closing case | all |
| `src/components/BrandIcon/index.ts` | re-export `BrandIcon`, `BRAND_NAMES`, types | — |

## Pure functions and algorithm

None: a direct lookup `network → paths.ts`. No date logic.

## Interface

`BrandIconProps { network: SocialNetwork; className?: string }` and
`BRAND_NAMES: Record<SocialNetwork, string>` as in the spec. `className` is joined
to the base class of the `<svg>` (P3).

## Decisions

- `paths.ts` structure with a `viewBox` per entry and `d` as a single value or an array
  (resolution B-1): an official SVG that is not 24×24 keeps its viewBox without
  being distorted. *Discarded:* forcing normalization to 24×24 (it distorts the logo or
  crops it; it breaks "respect the brand guidelines").
- `BRAND_NAMES` literals defined in the component, not derived from
  `si.title` (B-3): the fallback (LinkedIn) has no `si.title` and the display
  name is chosen by the design.
- RF-4 coverage: verify when building T1 against `SOCIAL_NETWORKS`
  (`@data/constants`). Known case: **LinkedIn is not in simple-icons
  16.33** → `paths.ts` is born with the official SVG + a provenance comment; the
  builder **reports** it and the orchestrator records it in `docs/BACKLOG.md`
  (subagents do not write in `docs/`). *Discarded:* a generic substitute
  icon (the spec's Do not).
- Size through CSS only with a fallback to `--size-social-icon` (same mechanism as
  Icon; SVG attributes do not accept `var()`).

## Test strategy

A parametrized test over **all** the values of `SOCIAL_NETWORKS` (RF-1).
Queries by svg attributes + `expectNoA11yViolations` at the end. P1: RF-4
(coverage check, the reviewer's inspection of `paths.ts`), RF-5/RF-6
by CSS inspection. P2/P3 as in Icon. `npm test`.

Coverage: T1→RF-1(paths) · T2→RF-1(render) · T3→RF-2,RF-3 · T4→RF-5,RF-6.
