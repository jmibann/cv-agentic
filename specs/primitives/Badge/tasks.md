# Tasks — Badge

- [x] **T1. Render `span` by default and `li` with `as`.** RF-1, RF-2 — 2d748da
  - Done when: `getByText` finds the text; the root is `span` by default
    and `<li>` with `as="li"` (test with a scaffold `<ul>`); green after
    `feat(Badge): T1`.

- [x] **T2. `className` joined to the root.** RF-3 — f0b7311
  - Done when: the external class sits next to the base one on the single
    element (P2 assertion); green after `feat(Badge): T2`.

- [x] **T3. Token-based styles, not interactive, and a11y closing case.** RF-4, RF-5, RF-6 — 10202fd
  - Done when: the module resolves background `--color-surface-muted`,
    `--radius-8`, `--font-size-badge`, `--line-height-tight`, padding
    `0.5rem 1rem`, `white-space: nowrap`, `inline-flex` (inspection: zero
    color literals, zero `@media`, zero `:hover`/`:focus` rules); the file
    ends with `expectNoA11yViolations` (span and li-in-ul); lint + typecheck +
    test green after `feat(Badge): T3`.
  - Note for closing the piece: `index.ts` re-exports `Badge` and types (the
    plan lists it and the tasks did not cover it; gap found in the review of
    Icon T1).
