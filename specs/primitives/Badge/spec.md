# Badge
Status: implemented

## Purpose

A compact label on a tinted background. A single component, **`Badge`**
(folder `src/components/Badge/`, export `Badge`), with two uses:

- **Badge**: the role/headline under the name in the Sidebar.
- **Chip**: each skill in `SkillList`.

## Requirements (EARS)

- RF-1: WHEN the component receives `children` with text, THEN THE SYSTEM renders it in its root element (`<span>` by default; `<li>` with `as="li"`).
- RF-2: WHEN it receives `as="li"`, THEN THE SYSTEM renders an `<li>`; the validity of the list context is the consumer's responsibility (the test uses a scaffold `<ul>`).
- RF-3: WHEN it receives `className`, THEN THE SYSTEM joins it to its base class on the root element.
- RF-4: THE SYSTEM renders Badge with no interactive states and no added roles: plain text (verification: inspection + axe).
- RF-5: THE SYSTEM scales the text size with `--font-size-badge` and declares no `@media` of its own; the text does not break (`white-space: nowrap`). Verification: CSS inspection.
- RF-6: IF a Badge is placed inside a `Box variant="inner"`, THEN it disappears visually (same background color), so its use is restricted to `surface` surfaces. Usage restriction: the reviewer verifies it **in the consumer** (F3/F4: SkillList, Sidebar); the primitive does not detect surfaces.

## Anatomy

A `<span>` (or `<li>` when it is a list item) with text.

## API

```ts
export interface BadgeProps {
  /** Text only: chips do not nest elements or icons. */
  children: string;
  as?: "span" | "li";   // default "span"
  /** Joined to the base class of the root element. */
  className?: string;
}
```

Exported as `Badge`. `SkillList` uses it with `as="li"`.

## Styles and tokens

| Property | Value |
|---|---|
| Background | `--color-surface-muted` |
| Text | `--color-text`, `--font-size-badge`, `--font-weight-regular`, `line-height: var(--line-height-tight)` |
| Padding | `0.5rem 1rem` |
| Radius | `--radius-8` |
| Display | `inline-flex; align-items: center;` |
| Wrapping | `white-space: nowrap` (chips do not break; the list wraps) |

**Important:** the background is `surface-muted`, so a Badge **cannot** go
inside a `Box variant="inner"` (same color: it disappears). Always on `surface`.

## States

Not interactive. If a chip ever became clickable, that would be a different
component.

## Responsive

No `@media` of its own: the text size scales through `--font-size-badge`
(11px < 768 → 13px). Documented exception: the badge's step is at md (768),
not at sm; the token in `tokens/tokens.css` takes precedence over the general
rule in `docs/tokens/breakpoints.md`.

## Accessibility

Plain text, no extra roles.

## Expected tests

- Renders the text.
- Default `<span>`; `as="li"` renders an `<li>` (inside a `<ul>` in the test).
- Concatenates `className` (the phase's CSS Modules criterion).
- `expectNoA11yViolations` with no violations (as an `li` inside a `ul`).

## Do not

- Do not add color variants (success/warning…): there are no states in this design.
- Do not nest elements or icons inside the badge: text only (`children: string`).
