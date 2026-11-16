# Tasks — Button

- [x] **T1. `<button>` with the prop's `type`.** RF-1 — 6b87744
  - Done when: without `href` it renders `getByRole("button", { name })` with
    `type="button"` by default and `type="submit"` reaches the DOM; green after
    `feat(Button): T1`.

- [x] **T2. `onClick` and `disabled`.** RF-3 — 754288e
  - Done when: user-event invokes the handler; with `disabled` it is not invoked and
    the `<button>` is disabled; green after `feat(Button): T2`.

- [x] **T3. Link: `href`, `rel` and `download`.** RF-2, RF-8, RF-9 — c037d1c
  - Done when: with `href` it renders `getByRole("link")` with that `href`;
    `target="_blank"` with no `rel` adds `noopener noreferrer`; an explicit
    `rel` arrives as is, unmerged; `download` is passed with its
    value; green after `feat(Button): T3`.

- [x] **T4. Decorative icon and `iconPosition`.** RF-4, RF-7 — cc7a5ed
  - Done when: `icon` renders an `<svg>` with `aria-hidden` and the accessible
    name is still only the text; with `iconPosition="end"` the svg is
    **after** the label in the DOM (default: before); green after `feat(Button): T4`.

- [x] **T5. `size="small"` and `fullWidth` (classes).** RF-6 — 1d69f14
  - Done when: both apply their module class (P2) on the root next to
    the external `className`; the module resolves small with
    `var(--button-small-padding-block/inline)` (they exist in `tokens.css` —
    blocked until the user adds them) and `::before { content: none }`;
    `fullWidth` → `width: 100%` through a class; green after `feat(Button): T5`.

- [x] **T6. Base styles, pseudo-states and a11y closing case.** RF-5, RF-6 — bc2f4c2
  - Done when: the module resolves background `--gradient-accent`, text
    `--color-on-accent`, radius, shadow and `::before` (`bottom: 0`,
    `z-index: var(--z-below)`, button with `position: relative;
    z-index: var(--z-base)`), focus-visible with `--focus-ring-*` +
    `--shadow-accent-focus`, disabled `opacity: 0.5` + `cursor: not-allowed`
    with no hover (all by inspection: zero literals, zero `@media`); the file
    ends with `expectNoA11yViolations` (button and link); lint + typecheck +
    test green after `feat(Button): T6` (the `build` for closing the piece is
    run by orchestrator/reviewer, decision #80).
  - Note for closing the piece: `index.ts` re-exports `Button` and types (the plan
    lists it and the tasks did not cover it; gap found in the review of Icon T1).
