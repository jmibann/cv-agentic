# Tasks — IconBox

- [x] **T1. Structure: `<span>` with a centered `Icon tone="gradient"`.** RF-1 — 53c0a21
  - Done when: the test (with scaffold `AccentGradientDefs`) finds an
    `svg` with `stroke="url(#accent-gradient)"`; the IconBox renders no defs
    of its own (a single `#accent-gradient` in the test's DOM); green after
    `feat(IconBox): T1`.

- [x] **T2. Decorative root + `className`.** RF-2 — b0abecc
  - Done when: the root `<span>` has `aria-hidden="true"`; the external
    `className` is joined to the root's base class (P2); green after
    `feat(IconBox): T2`.

- [x] **T3. Token-based styles and a11y closing case.** RF-3, RF-4, RF-5 — bc78ac8
  - Done when: the module sets a `--size-icon-box` square, background
    `--color-surface-muted`, `--radius-12`, centered `inline-flex` and
    `flex-shrink: 0`, with no margin of its own, no `@media`, no
    `:hover`/`:focus`/transitions (inspection); the file ends with
    `expectNoA11yViolations`; lint + typecheck + test green after
    `feat(IconBox): T3`.
  - Note for closing the piece: `index.ts` re-exports `IconBox` and types (the
    plan lists it and the tasks did not cover it; gap found in the review of Icon T1).
