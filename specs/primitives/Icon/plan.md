# Plan — Icon

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/Icon/Icon.tsx` | `Icon` (render from the explicit map) + `AccentGradientDefs` + types `UiIconName`/`IconName` | RF-1…RF-4, RF-6, RF-7 |
| `src/components/Icon/Icon.module.css` | `.icon` (size through `var(--icon-size, var(--size-icon))` + `flex-shrink`), `.toneAccent`, `.stopStart`/`.stopEnd`, `.defs` (0×0 + `position: absolute`) | RF-4, RF-6 |
| `src/components/Icon/Icon.test.tsx` | RF tests + `expectNoA11yViolations` closing case | all |
| `src/components/Icon/index.ts` | re-export `Icon`, `AccentGradientDefs`, types | — |

## Pure functions and algorithm

No date logic and no algorithm: a constant datum `ICON_MAP: Record<IconName, LucideIcon>`
(24 keys: 12 `UiIconName` + 12 `ServiceIcon`) and a direct render. RF-5
("compilation fails") is upheld by the type itself: `Record` requires a key for each
value of the generated union.

## Interface

`IconProps` and `AccentGradientDefs` as in the spec's "API" (contract).
`className` is JOINED to `.icon` on the root `<svg>` (the phase's P3 criterion);
the parent sets `--icon-size` there.

## Decisions

- Size with no `size` prop, CSS only with a fallback chain. *Discarded:* a numeric
  prop for the `width`/`height` attributes (they do not accept `var()`; resolution B8
  of the audit).
- `AccentGradientDefs` is exported from Icon's module (a single owner of the
  id). *Discarded:* a separate `defs` module (it fragments with no second consumer).
- `tone` through module classes; `gradient` through the `stroke` attribute. *Discarded:*
  inline `style` (hard CSS rule).
- RF-5 with no unit test: the `prebuild` pipeline (gen:types → tsc) IS the test.
  *Discarded:* a test that reads the JSON schema (it duplicates the pipeline in another language).

## Test strategy

Vitest + RTL; user-event is not needed (not interactive). Queries by role/name.
Phase criteria: P2 (classes through `import styles` + `toHaveClass`), P1 (RF-5 and
CSS tokens: the reviewer's inspection), P4 (the tests that use `tone="gradient"`
mount `AccentGradientDefs` as scaffold; uniqueness belongs to AppLayout).
The file ends with `expectNoA11yViolations` (with and without `label`). `npm test`.

Coverage: T1→RF-1,RF-5 · T2→RF-2,RF-3,RF-7 · T3→RF-4 (defs) · T4→RF-4,RF-6 (tone) · T5→RF-6. (T3/T4 swap: the tone test mounts the defs, so `AccentGradientDefs` goes first — the skill's dependency order.)
