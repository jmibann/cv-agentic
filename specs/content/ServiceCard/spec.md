# ServiceCard
Status: implemented

## Purpose

"What I'm Doing" card in the About panel: icon, title and description
of a service or area of work.

## Requirements (EARS)

- RF-1: WHEN the component receives a `service`, THEN THE SYSTEM renders an `<article>` named by its `h3`, with the title (as `SectionTitle as="h3"`, decision 16: size and 0.5rem margin are provided by SectionTitle, the piece does not duplicate them) and the description of the service. The level is fixed at h3, with no prop to change it.
- RF-2: THE SYSTEM renders the icon with `name = service.icon` (`icon` field of the schema) and `tone="gradient"`, decorative; the size is set with `--icon-size` on the class of the icon itself (`.glyph`). There is no `.icon` wrapper: the `Icon` already brings `flex-shrink: 0` (the "box" is the 2.5rem glyph itself, with no inset — decision 16). **It does not use `IconBox`** by contract: IconBox RF-5 forbids putting it inside `Box variant="inner"` (the card is an inner Box) and its API does not rescale the glyph.
- RF-3: THE SYSTEM generates the title's id with the fixed formula `service-${service.id}-title` and the `<article>` is named with that id (no duplicates thanks to the schema's `service.id`).
- RF-4: THE SYSTEM organizes the layout **mobile-first**: the base (no media) stacks the icon on top and centers the text; WHEN the width is 580px or more (`@media (min-width: 580px)`), THEN the icon sits to the left of the text. Verification: CSS inspection + QA F5 (jsdom does not compute).
- RF-5: THE SYSTEM leaves the number of columns to AboutPage, evens out heights with `height: 100%` and declares no `@media` with literal measures. In print, `break-inside: avoid` is set by the shared style (G-D; `foundations/layout.md` → Print): the piece declares no `@media print`.
- RF-6: THE SYSTEM renders ServiceCard with no interactive states of its own (no hover or focus). Verification: CSS inspection + axe.

## Anatomy

```
≥ 580px                                  < 580px
┌───────────────────────────────┐        ┌─────────────────┐
│ ⟨⟩   Web Applications         │        │       ⟨⟩        │
│      Single-page apps with…   │        │ Web Applications│
└───────────────────────────────┘        │ Single-page…    │
                                         └─────────────────┘
```

```html
<Box variant="inner" as="article" aria-labelledby="service-web-apps-title">
  <Icon name={service.icon} tone="gradient" className={styles.glyph} />
  <div>
    <SectionTitle as="h3" id="service-web-apps-title">Web Applications</SectionTitle>
    <p>Single-page apps with…</p>
  </div>
</Box>
```

## API

```ts
import type { Service } from "@data/cv.types.generated";

export interface ServiceCardProps {
  service: Service;
  /** Joined to the root: it is passed on to the `as="article"` Box (Box applies the join on its root, G-B). */
  className?: string;
}
```

## Styles and tokens

| Part | Value |
|---|---|
| Container (base) | `Box variant="inner"`; `display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-4); height: 100%;` |
| ≥ 580px (layout only) | `flex-direction: row; align-items: flex-start; text-align: start;` (the `gap` is still `--space-4`; no literal measures in the media) |
| Icon | `.glyph { --icon-size: var(--size-service-icon); }` on the `Icon` itself (2.5rem; the variable is not inherited, Icon RF-6; `flex-shrink: 0` already comes with Icon) |
| Title | `SectionTitle as="h3"` (font-size `--font-size-h3` and `margin-bottom: 0.5rem` by RF-1/RF-5 of SectionTitle; the piece does not declare them) |
| Description | body; `margin: 0` |

The grid (1 column; 2 columns ≥ lg with `gap: var(--layout-gap)`) is built by
AboutPage. `height: 100%` evens out heights in the same row.

## States

It is not interactive: no hover or focus.

## Responsive

- Base (mobile-first): icon on top and centered text.
- ≥ 580px: icon on the left (a change of direction, without changing measures).
- The number of columns is decided by AboutPage.

## Accessibility

- `<article>` named by its h3 (SectionTitle with `id`).
- Decorative icon; the tests with `tone="gradient"` mount a scaffold `AccentGradientDefs` (Icon's contract, IconBox criterion).

## Expected tests

1. `getByRole("article", { name: service.title })`.
2. Level 3 heading with the title and a paragraph with the description.
3. It renders a decorative svg with `stroke="url(#accent-gradient)"` and the glyph matches `service.icon` (`lucide-*` class propagated by Icon; `AccentGradientDefs` scaffold).
4. The title's id is `service-${service.id}-title` and the `<article>` references it in `aria-labelledby`.
5. `expectNoA11yViolations` with no violations.

## Do not

- Do not add hover or focus: it is not interactive.
- Do not pass `size` to the `Icon` or set `--icon-size` on a container: it goes on the class of the icon itself (`.glyph`).
- Do not wrap the icon in a `<span class="icon">`: the box is the glyph (decision 16).
- Do not use `IconBox` inside this card (inner Box): forbidden by IconBox RF-5.
- Do not declare the title with a raw h3 + styles of its own: it uses `SectionTitle as="h3"`.
- Do not invert the responsive order: base = centered column; the `@media (min-width: 580px)` switches to a row (mobile-first, `docs/tokens/breakpoints.md`).
- Do not decide the number of columns: the grid is built by AboutPage.
- Do not change measures in the `@media`: only direction, alignment and centering.
