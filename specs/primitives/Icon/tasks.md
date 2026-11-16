# Tasks — Icon

- [x] **T1. Explicit map and render of every `IconName`.** RF-1, RF-5 — 12ffb92
  - Done when: `test(Icon): T1` leaves green a parametrized test that
    renders an `<svg>` for each of the 24 values of `IconName` **and pins
    the full list to 24** (a `toHaveLength(24)` on the test's list, so
    that removing a name does not silently shrink the roster);
    `ICON_MAP: Record<IconName, LucideIcon>` typechecks against the generated
    type (removing a key breaks `tsc`: verify and restore, without committing
    the negative); lint + typecheck + test green after `feat(Icon): T1`.

- [x] **T2. Accessibility: decorative, with label and `focusable`.** RF-2, RF-3, RF-7 — 64ab8c3
  - Done when: without `label` → `aria-hidden="true"` and absent from
    `getByRole("img")`; with `label` → `getByRole("img", { name: label })` +
    `role="img"`; the `<svg>` has `focusable="false"` in both cases; green
    after `feat(Icon): T2`.

- [x] **T3. `AccentGradientDefs`.** RF-4 — f3c1b54
  - Done when: the test finds a `linearGradient` with id `accent-gradient`,
    `gradientUnits="userSpaceOnUse"` and the `x1/y1/x2/y2` of the spec; two `stop`
    elements with `offset` 0.2631/0.9375 and no `style` attribute; the `<svg>` is invisible by
    size (0×0 + `position: absolute`, never `display: none` — CSS
    inspection); green after `feat(Icon): T3`.

- [x] **T4. `tone`: current / accent / gradient.** RF-4, RF-6 — 0e37294
  - Done when: `tone="gradient"` → `stroke="url(#accent-gradient)"` (the test
    mounts the `AccentGradientDefs` of T3 as scaffold); `tone="accent"` applies the
    module's class (P2) and no node carries a `style` attribute; `current` adds
    no color class; green after `feat(Icon): T4`.

- [x] **T4b. Repairs from the review of T4 (precedent T2b/T3b).** RF-3, L1/L2 — 23e0a34
  - Done when: (a) `test(Icon): T4b` moves to English the name of the test
    `"…(tone="current" heredado)"` (`Icon.test.tsx`, it only renames that title,
    without touching assertions or other tests); (b) `fix(Icon): T4b` updates the
    comment in `Icon.tsx` that says the spec does not define an empty `label` — it
    does now (Accessibility, approved in `5dc0802`); green after both commits.

- [x] **T5. Size through CSS, `className` and a11y closing case.** RF-6 — 9f1def5
  - Done when: `.icon` sets `width/height: var(--icon-size, var(--size-icon))`
    and `flex-shrink: 0` (inspection: no literals and no `@media`); the received
    `className` is joined to `.icon` on the `<svg>` (P2 assertion); the test
    file ends with `expectNoA11yViolations` (with and without label); `index.ts`
    re-exports `Icon`, `AccentGradientDefs` and the types (a file of the plan; gap
    covered in the review of T1); lint + typecheck + test green after
    `feat(Icon): T5`.
