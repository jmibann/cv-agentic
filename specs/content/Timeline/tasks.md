# Tasks — Timeline

- [x] **T1. Structure: `<ol role=\"list\">` per entry.** RF-1, RF-2, RF-5 — 581ffb0 (minor items for the full review: `<li>` with no `item` class → T3; truthy org/desc branch with a `""` fixture impossible after validation)
  - Done when: `getByRole("list")` with one `listitem` per entry in order; each `<article aria-labelledby>` points to its `<h3>` with id `${idPrefix}-${entry.id}-title` and a level 3 heading with the title; it shows `organization` and `description` if they exist; `entries=[]` → empty `container`; green after `feat(Timeline): T1`.

- [x] **T2. Period with one `<time>` per endpoint (requires Foundation T12).** RF-3, RF-4 — 4ef038c
  - Done when: range → two `<time>` with `dateTime` equal to each raw value and text formatted by `formatPeriodEndpoint` according to `locale` (en/es, test 5–6); `end: null` → one `<time>` + `presentLabel` as text; no parsed composite strings (inspection: it uses the function); green after `feat(Timeline): T2`.

- [x] **T3. Token-based styles and a11y closing case.** RF-6, RF-7 — dc4d7b9 (F5: dot↔line↔title geometry, halo in dark, `:last-child` with `end: null` in the middle)
  - Done when: the module declares the item (`position: relative`, `border-left: var(--timeline-line-width) solid var(--color-track)`, padding with `--timeline-indent`), a centered `::before` dot (`--size-timeline-dot`, `--timeline-dot-ring`, `--color-accent`, `top: var(--timeline-dot-top)`), `:last-child` with `border-left-color: transparent` and `padding-bottom: 0` (inspection), the title with `--font-size-h4` and `top: calc(var(--timeline-title-shift) * -1)` (the token must exist in `tokens/tokens.css` — T12/user), `margin/padding` of list/item according to the table, zero `@media`; the file ends with `expectNoA11yViolations`; `index.ts` re-exports `Timeline` and types; lint + typecheck + test green after `feat(Timeline): T3`.
