# Tasks — Overhead

- [x] **T1. Render with uppercase through CSS only.** RF-1 — 6a18005
  - Done when: `getByText("Email")` finds the text **untransformed**
    in the DOM and the module declares `text-transform: uppercase` (inspection);
    green after `feat(Overhead): T1`.

- [x] **T2. `as="dt"` with a scaffold `<dl>`.** RF-2 — 62aedbf
  - Done when: default `span`; `as="dt"` renders a `<dt>` (the test wraps it
    in a `<dl>`); `className` is joined to the root (P2); green after
    `feat(Overhead): T2`.

- [x] **T3. Styles (ellipsis/muted/size) and a11y closing case.** RF-3, RF-4, RF-5, RF-6 — 0a3cc07
  - Done when: the module declares `display: block` +
    `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` with no
    `max-width` of its own, color `--color-text-muted`, size
    `--font-size-overhead`, regular weight, zero `@media`, zero roles/interactivity
    (inspection); the file ends with `expectNoA11yViolations`; lint +
    typecheck + test green after `feat(Overhead): T3`.
  - Note for closing the piece: `index.ts` re-exports `Overhead` and types (the
    plan lists it and the tasks did not cover it; gap found in the review of Icon T1).
