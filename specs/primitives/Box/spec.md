# Box
Status: implemented

## Purpose

Base surface of the design. Two variants: the floating card (`outer`) and the
tinted inner block (`inner`).

## Requirements (EARS)

- RF-1: WHEN the component is rendered without `variant`, THEN THE SYSTEM applies the `outer` variant (floating surface with a bottom border and a shadow).
- RF-2: WHEN it receives `variant="inner"`, THEN THE SYSTEM applies the `inner` variant (tinted background, no border or shadow).
- RF-3: WHEN it receives `as`, THEN THE SYSTEM renders that element (`div` by default) and only passes it `children`, `id`, `aria-label`, `aria-labelledby` and `className`.
- RF-4: IF it is passed an attribute outside the closed API (e.g. `role` or `tabIndex`), THEN THE SYSTEM does not pass it to the element. Verification: inspection (the closed props type guarantees it; no unit test is possible for an untyped use).
- RF-5: THE SYSTEM resolves background, radius, padding and breakpoint changes with tokens only; Box declares no `@media` of its own (verification: CSS inspection).
- RF-6: THE SYSTEM keeps `overflow: visible` on `outer` so that the Sidebar's avatar and the CornerTab are not clipped.

## Anatomy

A single container element (configurable tag) with `children`.

## API

```ts
type BoxElement = "div" | "section" | "article" | "aside" | "header";

export interface BoxProps {
  variant?: "outer" | "inner";   // default "outer"
  as?: BoxElement;               // default "div"
  children: React.ReactNode;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}
```

Closed API: only those attributes reach the element (no generic
pass-through of `role`, `tabIndex` or `...rest`). `aria-label` and
`aria-labelledby` are used by Sidebar (`as="aside" aria-label`) and ServiceCard
(`as="article" aria-labelledby`).

The tabpanel of NavTabs is **not** a Box: it is a `<div role="tabpanel">` inside
the content Box (see `specs/layout/AppLayout/spec.md`).

`className` is **joined** to the variant's class on the root element (it does not
replace it). The order in the `class` attribute does not resolve specificity
conflicts: the order in the style sheet rules.

## Styles and tokens

| | outer | inner |
|---|---|---|
| Background | `--color-surface` | `--color-surface-muted` |
| Radius | `--radius-20` | `--radius-box-inner` (14px < 580 → 16px) |
| Padding | `--box-padding` | `--box-inner-padding` |
| Border | `border-bottom: var(--size-box-edge) solid var(--color-box-edge)` | — |
| Shadow | `--shadow-box` | — |
| Position | `position: relative` (CornerTab's anchor) | — |

- `outer` uses `overflow: visible` (the sidebar's avatar and the CornerTab
  depend on that). The CornerTab resolves its corner with its own radius.
- `inner` **does not declare** `overflow` (it stays `visible` by default).

## States

No interactive states.

## Responsive

Resolved entirely by tokens (`--box-padding`, `--box-inner-padding`,
`--radius-box-inner`). The component has no `@media` of its own.

## Accessibility

Neutral. The semantics come from the element chosen with `as` (`section`,
`article`, `aside`) plus its name (`aria-label` / `aria-labelledby`). Box does not
accept `role`.

## Expected tests

- Renders `children`.
- Default: `div` with the `outer` class.
- `variant="inner"` applies the inner class and not the outer one.
- `as="section"` renders a `<section>`.
- Passes `id`, `aria-label` and `aria-labelledby` to the element (e.g. `as="aside" aria-label="Profile"` → `getByRole("complementary", { name: "Profile" })`).
- Concatenates `className`.
- `expectNoA11yViolations` with no violations.

## Do not

- Do not add an outer margin.
- Do not create new variants (e.g. "outlined") without updating this spec.
