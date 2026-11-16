# CornerTab
Status: implemented

## Purpose

A "folder tab" shape attached to the top right corner of a
`Box variant="outer"`. It is the visual base of **NavTabs** (content card) and
of the **Show Contacts** button (Sidebar card, < xl). It only provides shape and
position; the content and the behavior are set by whoever uses it.

## Requirements (EARS)

- RF-1: WHEN `placement` is `"overlay"` (default), THEN THE SYSTEM positions it absolutely at the top right corner of the containing Box, with `z-index: var(--z-raised)`. Verification: inspection + QA when it is used in F3/F4 (jsdom does not compute position).
- RF-2: WHEN it receives `size`, THEN THE SYSTEM applies the `sm` or `md` variant (default `md`).
- RF-3: WHEN it receives `placement="float"` and the viewport is ≥ 992px, THEN THE SYSTEM takes it out of absolute positioning (with `z-index: var(--z-raised)` to stay above the positioned `h1` that flows beside it) and floats it to the right so that the following content flows beside it; IF the viewport is < 992px, THEN it stays absolute.
- RF-4: THE SYSTEM keeps the tab visible at every **screen** breakpoint; in print it is hidden with the shared styles (`foundations/layout.md`): CornerTab declares **no** `@media print` of its own.
- RF-5: THE SYSTEM always paints the border `1px solid var(--color-border)`: in dark it separates `surface-raised` from `surface` (without a border it would be 1.14:1; rule 4 of `docs/tokens/contrast.md`). Verification: CSS inspection (axe does not measure contrast in jsdom).
- RF-6: THE SYSTEM adds no roles or `aria-*` attributes to the tab; the hover and focus states belong to its content.
- RF-7: THE SYSTEM renders the attribute `data-print-hide` on the tab's root `<div>`, in both `placement` values (F5 Change 2026-10-08, finding M-1 of `docs/qa-report.md`: in print the **whole** tab must disappear — the inner `[role="tablist"]` was already hidden, the wrapper with background/border was not). The attribute is not `aria-*` (RF-6 still holds): it is the hook of print contract #103; every CornerTab is navigation chrome and `foundations/layout.md` → Print mandates hiding "CornerTab/NavTabs". Verification: structural test.

## Anatomy

```
┌──────────────────────────────╭────────────────────────┐   ← top and right edges
│                              │   content (children)   │     match those of the Box
│                              ╰────────────────────────┤
│                                                       │
```

A `<div>` positioned absolutely inside the Box (which is `position: relative`).

## API

```ts
export interface CornerTabProps {
  children: React.ReactNode;
  /** "md": nav height (--size-nav-tab-height). "sm": compact (Show Contacts). Default "md". */
  size?: "sm" | "md";
  /**
   * "overlay" (default): always positioned absolutely over the corner.
   * "float": absolute at < lg; at ≥ lg it floats to the right (in the flow) so
   * that the content that follows (the panel's h1) flows beside it using the
   * tab's real width. Only NavTabs uses it.
   */
  placement?: "overlay" | "float";
  /** Joined to the base class of the root `<div>`. */
  className?: string;
}
```

## Styles and tokens

| Property | Value |
|---|---|
| Position | `position: absolute; top: 0; right: 0; z-index: var(--z-raised);` (base; it governs in `overlay`, RF-1) |
| Background | `--color-surface-raised` |
| Border | `border-left: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);` |
| Radius | `border-radius: 0 var(--radius-20) 0 var(--radius-32);` (top-right = the Box's radius) |
| Shadow | none |
| Inner layout | `display: flex; align-items: center;` |
| `size="md"` | `min-height: var(--size-nav-tab-height); padding-inline: var(--corner-tab-padding-inline)` (20px < 992 → 32px) |
| `size="sm"` | `min-height: 2.75rem; padding-inline: 1.25rem;` |

- In dark, `surface-raised` against `surface` is 1.14:1: **the border is
  mandatory** (rule 4 of `docs/tokens/contrast.md`).
- The Box has a 5px `border-bottom`; it does not affect the tab (it sits on top).

## States

None of its own. The hover/focus states belong to the content (tabs, button).

## Responsive

- The padding of `size="md"` scales through a token (`--corner-tab-padding-inline`).
- The tab **is always visible** at every screen breakpoint; in print it is hidden by the shared style of `foundations/layout.md` (RF-4).
- `placement="float"`, in `@media (min-width: 992px)` (a positioning change only):

  ```css
  .float {
    position: relative;          /* leaves absolute positioning; stays anchored to the corner */
    z-index: var(--z-raised);    /* above the positioned h1 that flows beside it */
    float: right;
    margin-top: calc(var(--box-padding) * -1);
    margin-right: calc(var(--box-padding) * -1);
    margin-left: var(--space-6); /* air between the h1 and the tab */
  }
  ```

  The negative margins offset the Box's padding so that the tab stays
  attached to the corner. Requirement for the content that follows: it must **not**
  create a formatting context of its own (flex, grid, `overflow` ≠ visible,
  `display: flow-root`) in the stretch that coexists with the tab; otherwise it
  narrows as a whole instead of flowing (see `specs/pages/*.md`).

  The tab floats above the panel's positioned `h1`: with
  `z-index: auto`, the box of the `h1` (`SectionTitle.decorated`,
  `position: relative`) was painted over the lower half of the tab and
  took the clicks. The `h1` is still selectable; `pointer-events: none` is **not**
  used.

## Accessibility

No role of its own (it is a visual container). It must not have `aria-*`.

## Expected tests

- Renders `children`.
- `size="sm"` / `"md"` apply different classes; default `md` (assertion with the phase's CSS Modules criterion).
- `placement="float"` applies its class; default `overlay` does not.
- The root has no `role` attribute **and no `aria-*`**.
- (F5 Change) The root `<div>` renders `data-print-hide` in both `placement` values (structural test).
- `expectNoA11yViolations` with no violations.

## Do not

- Do not add a shadow "to separate it": the design separates it by color + border.
- Do not use the accent gradient on the background (the original theme had a pill
  with a gradient; this design replaces it).
