# Tasks — Separator

- [x] **T1. Decorative root.** RF-1, RF-2 — 1a1c8bd
  - Done when: it renders a `<div>` with `aria-hidden="true"`;
    `queryByRole("separator")` is `null` and there is no `<hr>` in the DOM; green after
    `feat(Separator): T1`.

- [x] **T2. Line + full-bleed + margin through tokens.** RF-3, RF-4, RF-5 — 05dd5b0
  - Done when: the module declares height 1px, `background-color:
    var(--color-track)`, `margin-inline: calc(var(--box-padding) * -1)` +
    `width: calc(100% + var(--box-padding) * 2)` and
    `margin-block: var(--separator-gap)` (both sides), with no `@media` of its own
    (inspection); `className` is joined to the root (P2); green after
    `feat(Separator): T2`.

- [x] **T3. a11y closing case.** — RF-1, RF-2 — 7c3af0c
  - Done when: the file ends with `expectNoA11yViolations` (inside a
    scaffold `Box outer` if needed for the scenario); lint + typecheck +
    test green after `feat(Separator): T3`.
  - Note for closing the piece: `index.ts` re-exports `Separator` (the plan
    lists it and the tasks did not cover it; gap found in the review of Icon T1).
