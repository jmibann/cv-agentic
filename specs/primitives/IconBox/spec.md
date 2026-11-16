# IconBox
Status: implemented

## Purpose

A tinted square container with an icon in gradient. It is used in the Sidebar's
contact list and next to the h2 headings of the ResumeSections.

## Requirements (EARS)

- RF-1: WHEN the component receives `icon`, THEN THE SYSTEM renders an `Icon tone="gradient"` centered in a tinted square container. IconBox **does not mount** the gradient's defs: AppLayout guarantees the single mount (RF-6 of its spec).
- RF-2: THE SYSTEM marks the container decorative (`aria-hidden="true"`): the meaning comes from the text next to it.
- RF-3: THE SYSTEM keeps the size with `--size-icon-box` and declares no `@media` of its own (verification: CSS inspection).
- RF-4: THE SYSTEM renders IconBox with no interactive roles and no `:hover`/`:focus`/transition rules of its own (verification: inspection + axe).
- RF-5: IF IconBox is placed inside a `Box variant="inner"`, THEN it shares its background with the container and loses visibility, so that use is forbidden. Usage restriction: the reviewer verifies it in F3/F4 (the primitive does not detect surfaces).

## Anatomy

A square `<span>` with a centered `Icon tone="gradient"`.

## API

```ts
import type { IconName } from "../Icon";

export interface IconBoxProps {
  icon: IconName;
  /** Joined to the base class of the root `<span>`. Note: `--icon-size` set here does NOT reach the icon (it does not inherit). */
  className?: string;
}
```

## Styles and tokens

| Property | Value |
|---|---|
| Size | `--size-icon-box` (3rem) square |
| Background | `--color-surface-muted` |
| Radius | `--radius-12` |
| Icon | `Icon tone="gradient"`: IconBox does **not** pass `--icon-size`, it applies Icon's default fallback (`--size-icon`) |
| Display | `inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` |

## States

Not interactive.

## Responsive

Fixed size (`--size-icon-box`); no `@media` of its own.

## Accessibility

Always decorative (`aria-hidden="true"` on the span). The meaning comes from the
text next to it (Overhead or a title).

## Expected tests

- Renders an svg with `stroke="url(#accent-gradient)"` (the test mounts `AccentGradientDefs` as scaffold, as in Icon).
- The container has `aria-hidden="true"`.
- `expectNoA11yViolations` with no violations.

## Do not

- Do not put it inside a `Box variant="inner"` (same background).
- Do not use it as a button.
- Do not declare a margin of its own: the spacing with the accompanying text is set by the consumer (the gap of Sidebar/ResumeSection).
