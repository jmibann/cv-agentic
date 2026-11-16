# Tasks — CornerTab

- [x] **T1. Base overlay render with `children`.** RF-1, RF-6 — e189ed8
  - Done when: the root `<div>` renders the `children` and applies the base
    class (P2); the root has no `role` and no `aria-*` attribute (test);
    the base class sets absolute/top/right/`z-index: var(--z-raised)`
    (inspection); green after `feat(CornerTab): T1`.
  - Note: the joining of the external `className` to the root (spec → API, plan →
    Interface) was not distributed among the tasks; it is covered in T1 (gap found
    when delegating, same treatment as the `index.ts` note).

- [x] **T2. `size` variants.** RF-2 — 79ab04e
  - Done when: default `md`; `sm` and `md` apply different classes (P2);
    heights/padding as in the spec's table (`--size-nav-tab-height` +
    `--corner-tab-padding-inline` / fixed literals 2.75rem and 1.25rem)
    (inspection); green after `feat(CornerTab): T2`.

- [x] **T3. `placement="float"` and its `@media`.** RF-3, RF-4 — 1fa4dcd
  - Done when: `float` applies its class (P2) and `overlay` (default) does not; the
    only `@media` of the module is `(min-width: 992px)` with
    `position: relative; z-index: auto; float: right` + negative margins from
    `calc()` on `--box-padding` and `margin-left: var(--space-6)` — with no
    size literals (inspection); green after `feat(CornerTab): T3`.

- [x] **T4. Shape (borders/radius/background), visible on screen, and a11y closing case.** RF-4, RF-5, RF-6 — d12b270
  - Done when: the module always paints `border-left/bottom: 1px solid
    var(--color-border)` on `--color-surface-raised` and
    `border-radius: 0 var(--radius-20) 0 var(--radius-32)`, with no shadow; no
    `@media print` in the module (inspection); the file ends with
    `expectNoA11yViolations`; lint + typecheck + test green after
    `feat(CornerTab): T4`.
  - Note for closing the piece: `index.ts` re-exports `CornerTab` and types (the
    plan lists it and the tasks did not cover it; gap found in the review of Icon T1).

- [x] **T5. `data-print-hide` hook on the root (F5 Change 2026-10-08).** RF-7 — 25e2ee4 (APPROVED. Minor items recorded: subjects with a descriptive suffix (the F5 pattern was bare; parseable prefix intact, #102 OK); test/tsx comments cite "compound variant div[data-print-hide]" when global.css uses the simple selector — cosmetic, it is aligned with AppLayout T7; the end of M-1 is conditional on T7 + the F5 re-pass)
  - Done when: the root `<div>` renders `data-print-hide` next to its
    classes, in both `placement` values (structural test `toHaveAttribute`); no
    other attribute/aria/style changes; previous tests intact; the F5 re-pass
    confirms that in print the whole tab disappears (end of finding M-1:
    an empty strip with background/border); green after `feat(CornerTab): T5`.

- [x] **T6. `.float` above the positioned `h1` (Change 2026-11-10).** RF-3 — 03c571d
  - Done when: in `@media (min-width: 992px)`, `.float` sets
    `z-index: var(--z-raised)` (not `auto`); CSS inspection confirms that
    the positioned `h1` of `SectionTitle.decorated` stays below and that the tab
    receives clicks on its lower half; `pointer-events: none` is not used on the
    `h1`; previous tests intact; green after `fix(CornerTab): T6`.
