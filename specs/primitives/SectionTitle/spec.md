# SectionTitle
Status: implemented

## Purpose

Page and section titles with two treatments:

- **decorated**: page h1 with a gradient bar below ("About Me", "Resume").
- **Exception to "no outer margin"** (documented in `specs/README.md`): the
title's `margin-bottom` is part of the component, because the
title → content space is always the same and does not depend on who uses it. Values:
decorated h1 `var(--title-decorated-gap)`; h2 `1.25rem`; h3 `0.5rem` (see
`foundations/typography.md` → "Heading margins"). No other margin.

**with icon**: section h2 with an `IconBox` on the left ("Experience", "Projects", "Education").

## Requirements (EARS)

- RF-1: WHEN the component receives `as`, THEN THE SYSTEM renders that heading level (`h1`, `h2` or `h3`) with the size of the matching `--font-size-h1/2/3`.
- RF-2: WHEN it receives `decorated`, THEN THE SYSTEM draws the gradient bar with an `::after` with no text content.
- RF-3: WHEN it receives `icon`, THEN THE SYSTEM renders an `IconBox` on the left without altering the heading's accessible name.
- RF-4: WHEN it receives `id`, THEN THE SYSTEM passes it to the heading so that the section can use `aria-labelledby`.
- RF-5: THE SYSTEM applies, as the only exception to "no outer margin", its own `margin-bottom` according to the level: **decorated** h1 `--title-decorated-gap` (an h1 without `decorated` takes the global heading margin, `foundations/typography.md`), h2 `1.25rem`, h3 `0.5rem`. Verification: CSS inspection (jsdom does not compute margins).
- RF-6: THE SYSTEM resolves color, radius, font size and bar with tokens; the title→content margins are the literals pinned in RF-5. It declares no `@media` of its own (CSS inspection).

## Anatomy

```
decorated:            with icon:
About Me              [▣] Education
▬▬▬
```

## API

```ts
import type { IconName } from "../Icon";

export interface SectionTitleProps {
  as: "h1" | "h2" | "h3";
  children: React.ReactNode;
  /** Gradient bar below. */
  decorated?: boolean;
  /** IconBox on the left. */
  icon?: IconName;
  id?: string;             // for the section's aria-labelledby
  /** Joined to the base class of the heading (the root element; no wrapper). */
  className?: string;
}
```

`as` is required: the level is decided by the context (see `foundations/typography.md`).
The **size** follows the level (`--font-size-h1/2/3`).

## Styles and tokens

**Level**: the module sets the classes `.h1/.h2/.h3 { font-size: var(--font-size-h1/2/3); }` (the size does **not** depend on the global per-tag typography).

**decorated**
- `position: relative; margin-bottom: var(--title-decorated-gap)` (24px < 580 → 37px).
- `::after` (decorative): `width: var(--size-title-bar-w); height: var(--size-title-bar-h);`
  `background: var(--gradient-accent); border-radius: var(--radius-8);`
  `position: absolute; left: 0; bottom: calc(var(--title-bar-offset) * -1)` (10px < 580 → 17px).

**with icon**
- `display: flex; align-items: center; gap: var(--space-4);` **on the heading itself** (no wrapper).
- IconBox on the left; text right after.

**decorated + icon (valid combination)**: both treatments are applied on the
same heading; the `::after` bar is anchored to the bottom-left edge of the
**whole** heading (`left: 0`: it sits under the IconBox too), because
`position: absolute` takes the pseudo-element out of the flex flow. The margin follows
the RF-5 rule per level.

## States

Not interactive.

## Responsive

No `@media` of its own: size (`--font-size-h1/2/3`), separation
(`--title-decorated-gap`) and bar (`--size-title-bar-*`, `--title-bar-offset`)
scale through tokens.

## Accessibility

- The bar is an `::after` (no text content): it is not read.
- The IconBox is `aria-hidden`: the heading's accessible name is only the text.

## Expected tests

- `as="h1"` → `getByRole("heading", { level: 1, name })`; same for h2/h3.
- `decorated` applies its class (assertion with the phase's CSS Modules criterion); the `::after` with no text content is verified by inspection.
- `icon` renders an IconBox and the heading's accessible name does **not** change.
- `decorated` + `icon` together: the heading keeps the decorated class **and** the IconBox (they do not cancel each other; see "decorated + icon" in Styles).
- `id` reaches the heading.
- `expectNoA11yViolations` with no violations.

## Do not

- Do not infer the level from the size or vice versa.
- Do not use `<hr>` or a real `<span>` for the bar.
