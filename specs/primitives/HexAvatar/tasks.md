# Tasks — HexAvatar

- [x] **T1. `HexAvatarDefs` with the two `clipPath`s of the fixed geometry.** RF-3 — 09c9e03
  - Done when: the test renders `HexAvatarDefs` and finds two `clipPath`s
    with ids `hex-avatar-outer` and `hex-avatar-inner`, `clipPathUnits="objectBoundingBox"`;
    the `d` values transcribe the vertices/radii of "Shape" (spec) with a provenance
    comment; the `<svg>` is 0×0 `position: absolute`, never `display: none`
    (inspection); green after `feat(HexAvatar): T1`.

- [x] **T2. Structure `wrap > border > img` with `src`.** RF-1 — 9137a67
  - Done when: the `<img>` receives the `src`; outline and image carry their
    module classes (P2); the 4px offsets and `calc()` sizes relative to
    `--size-testimonial-avatar-w/h` (inspection); the `url(#hex-avatar-*)` of
    each class is verified by reading the `.module.css` (jsdom does not apply
    `clip-path`); green after `feat(HexAvatar): T2`.

- [x] **T3. `alt`: decorative by default.** RF-2 — bcfe9ec
  - Done when: without `alt` → `alt=""` and it does not show up in `getByRole("img")`;
    with `alt="Foto de X"` → `getByRole("img", { name: "Foto de X" })`; green
    after `feat(HexAvatar): T3`.

- [x] **T4. Shadow, fixed size, `className` and a11y closing case.** RF-4, RF-5 — b0b2b2c
  - Done when: the wrap declares `filter: var(--filter-avatar-drop)` with
    no `box-shadow` (inspection); no `@media` and no
    `:hover`/`:focus`/transition rule; `className` joined to the `wrap` (P2); the file
    ends with `expectNoA11yViolations` (with `HexAvatarDefs` mounted); lint +
    typecheck + test green after `feat(HexAvatar): T4`.
  - Note for closing the piece: `index.ts` re-exports `HexAvatar`,
    `HexAvatarDefs` and types (the plan lists it and the tasks did not cover it; gap
    found in the review of Icon T1).
