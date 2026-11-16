# Tasks — SectionTitle

- [x] **T1. Headings per level with `id`.** RF-1, RF-4 — ec409cf
  - Done when: `as="h1| h2| h3"` renders `getByRole("heading", { level,
    name })` and `id` reaches the heading; green after `feat(SectionTitle): T1`.

- [x] **T2. Size per level from the module.** RF-1 — 4b6c08a
  - Done when: each level applies its class `.h1/.h2/.h3` (P2) with
    `font-size: var(--font-size-h1/2/3)` (inspection: no px literals);
    green after `feat(SectionTitle): T2`.

- [x] **T3. `decorated`: `::after` bar.** RF-2 — 05a3339
  - Done when: the `decorated` class applies `position: relative` + `::after`
    with `--gradient-accent`, `--size-title-bar-*`, `bottom:
    calc(var(--title-bar-offset) * -1)` and **no text content**
    (`content: ""`; inspection); the accessible name does not change (test); green after
    `feat(SectionTitle): T3`.

- [x] **T4. `icon` (IconBox in the heading) and decorated+icon combination.** RF-3 — 9dc375a
  - Done when: with `icon` the heading renders `IconBox` and its accessible
    name is still only the text; `decorated` + `icon` together keeps
    both treatments (decorated class **and** IconBox present); the flex goes on
    the heading itself with no wrapper (inspection); green after `feat(SectionTitle): T4`.

- [x] **T5. `className`, margins and a11y closing case.** RF-5, RF-6 — 734b06c
  - Done when: `className` joined to the root heading (P2); `margin-bottom` as in
    RF-5 — h1 only with `decorated` uses `--title-decorated-gap`, h2 `1.25rem`,
    h3 `0.5rem`, an undecorated h1 declares no margin of its own (inspection); zero
    `@media` of its own; the file ends with `expectNoA11yViolations`; lint +
    typecheck + test green after `feat(SectionTitle): T5`.
  - Note for closing the piece: `index.ts` re-exports `SectionTitle` and types
    (the plan lists it and the tasks did not cover it; gap found in the review of Icon T1).
