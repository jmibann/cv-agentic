# Tasks — BrandIcon

- [x] **T1. `paths.ts` with `{ viewBox, d }` for all of `SOCIAL_NETWORKS`.** RF-1, RF-4 — 9f0cc0b
  - Done when: there is one entry per network (`@data/constants`) with named
    imports from `simple-icons`; LinkedIn uses the official SVG with a provenance
    comment (and the orchestrator later records the report in BACKLOG); the
    module typechecks against `SocialNetwork`; green after `feat(BrandIcon): T1`
    (with the parametrized structure test: non-empty string viewBox, `d` a
    string or an array with at least one non-empty `d`).

- [x] **T1b. Repair of the minor finding from the review of T1 (honesty of the provenance comment).** RF-4, L1 — f8ddc10
  - Done when: `fix(BrandIcon): T1b` rewrites LinkedIn's provenance comment
    in `paths.ts` to state only what was verified: the path is the one
    `simple-icons` distributed up to v14 (geometrically and typologically valid in
    24×24); the exact match with the press kit stays pending and
    recorded in `docs/BACKLOG.md`. It touches no tests or other lines; green after
    the fix.

- [x] **T2. Render of the `<svg>` per network.** RF-1 — eb0d21c (+fix d654a26)
  - Note from the review of T1b (minor, to be executed in this round as a separate
    `fix`): rework the opening of LinkedIn's comment in `paths.ts`
    (lines 26-28: `Origen (RF-4): SVG oficial del kit de marca…`) so that it
    expresses intent/pending instead of a verified fact, consistent with the
    closing that already marks it as pending.
  - Done when: parametrized test: each `network` renders an `<svg>` with the
    `viewBox` of its entry (default `0 0 24 24`) and at least one `<path>` with
    a non-empty `d`; green after `feat(BrandIcon): T2`.

- [x] **T3. `BRAND_NAMES` and decorative a11y.** RF-2, RF-3 — 8de4610 (+chore config 6d107c6)
  - Done when: `getByRole` does not find it (`aria-hidden="true"`),
    `focusable="false"` present, `fill="currentColor"` on the svg;
    `BRAND_NAMES` has a non-empty value for each network (the test rejects `""`);
    green after `feat(BrandIcon): T3`.

- [x] **T4. Size/inheritance through CSS, `className` and a11y closing case.** RF-5, RF-6 — 8e0b8c3
  - Done when: the module sets `width/height: var(--icon-size,
    var(--size-social-icon))` with no `@media` and no color/opacity of its own
    (inspection); `className` is joined on the `<svg>` (P2); the file ends with
    `expectNoA11yViolations`; lint + typecheck + test green after
    `feat(BrandIcon): T4`.
  - Note for closing the piece: `index.ts` re-exports `BrandIcon`, `BRAND_NAMES`
    and types (the plan lists it and the tasks did not cover it; gap found in the
    review of Icon T1).
