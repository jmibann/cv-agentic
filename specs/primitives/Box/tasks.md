# Tasks — Box

- [x] **T1. Base render: `outer` by default and `as`.** RF-1, RF-3 — 459d436
  - Done when: without `variant` the `div` root carries the `outer` class (P2) and
    renders `children`; `as="section"` renders a `<section>`; green after
    `feat(Box): T1`.

- [x] **T2. `inner` variant and ARIA/id attributes.** RF-2 — 7f2d3a2
  - Done when: `variant="inner"` applies `inner` and **not** `outer` (P2);
    `id`, `aria-label` and `aria-labelledby` reach the root
    (`as="aside" aria-label="Profile"` → `getByRole("complementary", { name: "Profile" })`);
    green after `feat(Box): T2`.

- [x] **T3. `className` is joined on the single element.** RF-3 — 1c00911
  - Done when: an external `className` sits next to the variant's class on
    the root element (P2 assertion, no `data-testid`); green after `feat(Box): T3`.

- [x] **T4. Token-based styles, overflow and a11y closing case.** RF-4, RF-5, RF-6 — a8c515d
  - Done when: the module resolves background/radius/padding/border/shadow with
    tokens **only**, with no color literals or `@media` (the reviewer's inspection);
    `outer` with an explicit `overflow: visible` and `inner` with no `overflow`
    declaration (inspection); props with no `role`/`tabIndex` (inspection of the API);
    the file ends with `expectNoA11yViolations` (outer and inner); lint +
    typecheck + test green after `feat(Box): T4`.
  - Note for closing the piece: `index.ts` re-exports `Box` and types (the plan
    lists it and the tasks did not cover it; gap found in the review of Icon T1).

- [x] **T4b. Repair of the minor finding from the review of T4 (obsolete comment).** L1 — 545a657
  - Done when: `fix(Box): T4b` updates the header of `Box.tsx` (line ~6:
    `Falta: los estilos por tokens con overflow (T4)`) to the real state of the
    piece after T4: the token-based styles with `overflow: visible` on `outer` already
    exist in `Box.module.css`; the only public export unchanged; zero changes
    to code, tests or CSS. Green after the fix.
