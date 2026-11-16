# Overhead
Status: implemented

## Purpose

A small uppercase label that precedes a value ("EMAIL" above
"alex@example.com").

## Requirements (EARS)

- RF-1: WHEN the component receives text, THEN THE SYSTEM shows it in uppercase through CSS (`text-transform: uppercase`) without transforming the text in the DOM.
- RF-2: WHEN it receives `as="dt"`, THEN THE SYSTEM renders a `<dt>`; the validity of the `<dl>` context belongs to the consumer (the test uses a scaffold `<dl>`).
- RF-3: THE SYSTEM truncates long text with an ellipsis (`overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`) **when the container restricts the width**: Overhead declares no `max-width` of its own. Verification: CSS inspection (jsdom does not compute the truncation).
- RF-4: IF the Overhead sits on `--color-bg` in light, THEN the contrast is 4.32:1 and is insufficient; that is why its use is restricted to `surface`, `surface-muted` and `surface-raised`. Usage restriction: the reviewer verifies it in the consumer (the component does not know the background).
- RF-5: THE SYSTEM scales the size with `--font-size-overhead` and declares no `@media` of its own (verification: CSS inspection).
- RF-6: THE SYSTEM renders it non-interactive and with no added roles (inspection + axe).

## Anatomy

A block-level `<span>` (or `<dt>` depending on `as`).

## API

```ts
export interface OverheadProps {
  children: React.ReactNode;
  as?: "span" | "dt";  // default "span"; "dt" when it goes in a <dl>
  /** Joined to the base class of the root element. */
  className?: string;
}
```

## Styles and tokens

| Property | Value |
|---|---|
| Color | `--color-text-muted` |
| Size | `--font-size-overhead` |
| Weight | `--font-weight-regular` |
| Transform | `text-transform: uppercase` |
| Display | `block`; `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` |

## States

Not interactive.

## Responsive

No `@media` of its own: the size scales through `--font-size-overhead` (11px < 580 → 12px).

## Accessibility

`text-transform` does not alter what screen readers read: the text in the
DOM is in normal capitalization ("Email"), not in uppercase.

## Contrast rules

Never on `--color-bg` in light (4.32:1). Allowed on `surface`,
`surface-muted` and `surface-raised` (see `docs/tokens/contrast.md`).

## Expected tests

- Renders the text as is (untransformed in the DOM).
- `as="dt"` renders a `<dt>` (inside a `<dl>` in the test).
- Concatenates `className` (the phase's CSS Modules criterion).
- `expectNoA11yViolations` with no violations.

## Do not

- Do not write the text in uppercase in the DOM: the capitalization comes from `text-transform` (Accessibility).
- Do not use it on `--color-bg` in the light theme (4.32:1): only on `surface`, `surface-muted` or `surface-raised`.
- Do not add `@media` of its own: the size scales through `--font-size-overhead`.
- Do not make it interactive or add roles to it.
