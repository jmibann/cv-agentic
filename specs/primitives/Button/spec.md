# Button
Status: implemented

## Purpose

Main action with the accent gradient. In this scope it is used for
"Download CV" (link) and is available for other uses.

## Requirements (EARS)

- RF-1: WHEN the component receives no `href`, THEN THE SYSTEM renders a `<button>` with the received `type` (default `"button"`).
- RF-2: WHEN it receives `href`, THEN THE SYSTEM renders an `<a>` with that target; IF it also receives `target="_blank"` with no `rel`, THEN it adds `rel="noopener noreferrer"`.
- RF-3: WHEN it receives `onClick` and is not `disabled`, THEN THE SYSTEM invokes the handler when activated; IF it is `disabled`, THEN it does not invoke it.
- RF-4: WHEN it receives `icon`, THEN THE SYSTEM renders the decorative icon (`aria-hidden`) without altering the accessible name, which remains the visible text.
- RF-5: THE SYSTEM applies on `focus-visible` the standard focus ring (`--focus-ring-width` / `--focus-ring-offset`) and on `disabled` (`<button>` only) `opacity: 0.5` with `cursor: not-allowed`, with no hover. Verification: CSS inspection + axe (pseudo-states are not testable in jsdom).
- RF-6: THE SYSTEM resolves background, padding and typography with tokens and declares no `@media` of its own (verification: CSS inspection).
- RF-7: WHEN it receives `iconPosition="end"`, THEN THE SYSTEM renders the icon **after** the label (default `start`).
- RF-8: WHEN it receives `download`, THEN THE SYSTEM passes it to the `<a>` with the received value.
- RF-9: IF it receives an explicit `rel`, THEN THE SYSTEM uses it as is, without merging it with the default of RF-2.

## Anatomy

`<button>` or `<a>` (if it receives `href`) with: optional icon + label. A
`::before` pseudo-element adds a diffuse glow under the button.

## API

```ts
import type { IconName } from "../Icon";

interface CommonProps {
  children: React.ReactNode;
  size?: "default" | "small";         // default "default"
  icon?: IconName;
  iconPosition?: "start" | "end";      // default "start"
  fullWidth?: boolean;                  // default false
  /** Joined to the base class of the root element (<button> or <a>). */
  className?: string;
}

export type ButtonProps =
  | (CommonProps & { href?: undefined; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean })
  | (CommonProps & { href: string; download?: boolean | string; target?: "_blank"; rel?: string });
```

- With `href` → `<a>`; with `target="_blank"` it adds `rel="noopener noreferrer"` if none was passed.
- Without `href` → `<button type="button">` by default.

## Styles and tokens

| Part | default | small |
|---|---|---|
| Background | `--gradient-accent` | same |
| Text | `--color-on-accent`, `--font-weight-regular`, `--font-size-button` | `--font-size-small` |
| Padding | `var(--button-padding-block) var(--button-padding-inline)` (12/18px < 580 → 15/32px) | `var(--button-small-padding-block) var(--button-small-padding-inline)` (10/16px, fixed) |
| Radius | `--radius-20` | same |
| Shadow | `--shadow-accent` | same |
| `::before` glow | `box-shadow: var(--shadow-accent-glow)`, height 1rem, width 64%, centered at the bottom with `bottom: 0` (the halo comes from the token's blur), `z-index: var(--z-below)` (the button creates its own stacking context with `position: relative; z-index: var(--z-base)` so that the glow does not end up behind the card) | no glow (`::before` with `content: none`) |
| Icon | `gap: 0.375rem` between icon and text | `gap: 0.5rem` (intentional: a compact button centered on the icon) |

- `display: inline-flex; align-items: center; justify-content: center;`
- `fullWidth` → `width: 100%`.
- Border: none. Cursor pointer.

## States

| State | Effect |
|---|---|
| Hover | `opacity: 0.9` (contrast recorded in `docs/tokens/contrast.md`: ≥ 4.92:1); shadow and glow → `none` (transition `--duration-base`) |
| Active | `transform: translateY(1px)` (`--duration-fast`) |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` + `--shadow-accent-focus` |
| Disabled (`<button>` only) | `opacity: 0.5; cursor: not-allowed;` with no hover. Exempt from contrast (WCAG 1.4.3, inactive component; see `docs/tokens/contrast.md`) |

## Responsive

Resolved by tokens (`--button-padding-*`, `--font-size-button`). The
component has no `@media` of its own.

## Accessibility

- The visible text is the accessible name; the icon is decorative (`Icon` with no `label`).
- `download` on file links; if it opens in a new tab, the label should
  say so (whoever uses it resolves that).

## Expected tests

- Without `href`: `getByRole("button", { name })`, `type="button"` by default; `type="submit"` reaches the `<button>`.
- With `href`: `getByRole("link", { name })` with that `href`.
- `target="_blank"` adds `rel="noopener noreferrer"`; an explicit `rel` is used as is (RF-9).
- `download` is passed to the `<a>` with its value (RF-8).
- `onClick` is called on click; it is not called if `disabled`.
- `icon` renders an `aria-hidden` svg and the accessible name is still only the text; with `iconPosition="end"` the svg appears **after** the text in the DOM (RF-7).
- `size="small"` and `fullWidth` apply their classes (assertion with the phase's CSS Modules criterion).
- `expectNoA11yViolations` with no violations (button and link).

## Do not

- Do not use `color: #fff`: always `--color-on-accent` (in dark the text is dark).
- No `transition: all`.
