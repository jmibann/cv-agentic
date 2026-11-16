# Plan — ServiceCard

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/ServiceCard/ServiceCard.tsx` | named `Box variant="inner" as="article">`: `Icon name=service.icon tone="gradient"` with `.glyph`, and a `<div>` with `SectionTitle as="h3" id` + description `<p>` | RF-1…RF-3, RF-6 |
| `src/components/ServiceCard/ServiceCard.module.css` | flex container, **centered column (base)**; `@media (min-width: 580px)` → flex-start row (layout only); `.glyph { --icon-size: var(--size-service-icon); }`; `height: 100%` | RF-4, RF-5 |
| `src/components/ServiceCard/ServiceCard.test.tsx` | tests + a11y closing case | all |
| `src/components/ServiceCard/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`ServiceCardProps { service: Service; className?: string }` (spec → API; G-B: `className` is passed on to the root `Box` and Box applies the join).

## Decisions

- Title by `SectionTitle as="h3" id=service-${service.id}-title` (decision 16): size and margin are set by SectionTitle (its RF-1/RF-5); the `<article aria-labelledby>` points to that id. *Discarded:* a raw h3 with duplicated styles (it clashes with the rule on margin exceptions).
- Icon **with no wrapper** (decision 16): `<Icon className={styles.glyph}>` directly as a child of the flex; Icon already brings `flex-shrink: 0`; the gradient requires an `AccentGradientDefs` scaffold in the tests.
- Mobile-first (decision 16): the module's base is a centered column with `text-align: center`; the `@media (min-width: 580px)` changes `flex-direction: row; align-items: flex-start; text-align: start;` — layout only, no measures (`breakpoints.md` criterion).
- `height: 100%` to even out rows; the columns are built by AboutPage (RF-5).
- No interactivity: zero pseudo-states (RF-6). Print: `break-inside` from the shared style (G-D); zero `@media print` of its own.
- No IconBox (its RF-5 forbids inner Box; recorded in the spec).

## Test strategy

`Service` fixture (id `web-apps`, icon `code` — a valid ServiceIcon). Tests: `getByRole("article", { name: service.title })` with a level 3 `heading`; paragraph with the description; svg `stroke="url(#accent-gradient)"` inside the article and the `lucide-code` class propagated (decision 16/RF-2); title id `service-web-apps-title` and the article's `aria-labelledby` pointing to it (test 4); `expectNoA11yViolations`. P1: base column + 580 media row, with no other properties in the media → inspection; `--icon-size` set on `.glyph`, not on the container → inspection.

Coverage: T1→RF-1,RF-2,RF-3 · T2→RF-4,RF-5,RF-6 + closing.
