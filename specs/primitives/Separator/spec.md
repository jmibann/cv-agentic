# Separator
Status: implemented

## Purpose

A 1px horizontal line that separates blocks inside a `Box variant="outer"`,
extending to the edges of the card (full-bleed). It is used in the Sidebar
between the basic information and the contact list.

## Requirements (EARS)

- RF-1: WHEN the component is rendered, THEN THE SYSTEM draws a 1px decorative line with `aria-hidden="true"`.
- RF-2: THE SYSTEM exposes no `separator` role and does not use `<hr>` (it would announce a thematic break in the content).
- RF-3: THE SYSTEM extends the line to the edges of the card (`full-bleed` computed from `--box-padding`).
- RF-4: THE SYSTEM separates vertically with `--separator-gap` **on each side of the line** (`margin-block`); the container that hosts it does **not** add its `gap` in that stretch (the blocks-line-blocks space does not accumulate). `--separator-gap` scales by breakpoint with no `@media` of its own.
- RF-5: THE SYSTEM applies `margin-block` as a documented exception to "no outer margin" (the only one along with `SectionTitle`).

## Anatomy

A decorative `<div>`.

## API

```ts
export interface SeparatorProps {
  className?: string;
}
```

## Styles and tokens

| Property | Value |
|---|---|
| Height | 1px |
| Color | `background-color: var(--color-track)` |
| Full-bleed | `margin-inline: calc(var(--box-padding) * -1); width: calc(100% + var(--box-padding) * 2);` |
| Vertical margin | `margin-block: var(--separator-gap)` (16px < 580 → 24px) |

Exception to "no outer margin": the full-bleed depends on the padding of the parent
Box, and that is why the separator positions itself.

## States

Not interactive.

## Responsive

No `@media` of its own: the vertical separation scales through `--separator-gap` and the
full-bleed follows `--box-padding`.

## Accessibility

Decorative: `aria-hidden="true"` (not `<hr>`, which announces a thematic break in the
content).

## Expected tests

- Renders an element with `aria-hidden="true"`.
- Exposes no `separator` role.
- `expectNoA11yViolations` with no violations.
- RF-1 (1px thickness), RF-3 (full-bleed), RF-4/RF-5 (margin): verification by **CSS inspection** (jsdom does not compute it).

## Do not

- Do not use `<hr>` or `role="separator"`: it is decorative (`aria-hidden="true"`).
- Do not use it outside a `Box variant="outer"`: the full-bleed depends on `--box-padding`.
- Do not take its `margin-block` as a precedent: it is one of the only two exceptions to "no outer margin" (along with `SectionTitle`).
- Do not combine it with the parent's `gap` in its stretch: the separator provides all the vertical space (RF-4).
- Do not add `@media` of its own: the separation scales through `--separator-gap`.
