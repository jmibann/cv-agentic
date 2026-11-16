# Timeline
Status: implemented

## Purpose

Vertical chronological list for Experience, Projects and Education: a thin line on the
left, one accent dot per item, title, period and description.

## Requirements (EARS)

- RF-1: WHEN `entries` contains items, THEN THE SYSTEM renders an `<ol role="list">` (the explicit `role` protects the semantics against the `list-style: none` quirk in Safari/VoiceOver) with one `<li>` per entry in the order of the data; IF `entries` is empty, THEN it renders nothing.
- RF-2: THE SYSTEM renders per item the title as `<h3>` (a level fixed by `docs/DESIGN.md`, with no prop to change it) and shows `organization` and `description` if they exist in the entry.
- RF-3: WHEN `end` is `null`, THEN THE SYSTEM ends the period in `presentLabel` ("Present" / "Actualidad").
- RF-4: THE SYSTEM wraps **each date** in `<time dateTime>` with the value from the data and formats each endpoint with the per-endpoint formatter exported by `src/i18n/formatPeriod.ts`, according to the `locale`. Decision 12=a: **a prior extension of Foundation** (F3 task delegated to `foundation`, without breaking `formatPeriod`: the current function keeps the same signature and uses; an endpoint formatter is exported — that task sets the exact name). Timeline does not reimplement it or parse composite strings.
- RF-5: THE SYSTEM generates the title ids with the fixed formula `${idPrefix}-${entry.id}-title` (the schema's `entry.id` goes into the formula), so that two Timelines on the same page do not collide.
- RF-6: THE SYSTEM treats the dot and the line as decorative (pseudo-elements) and removes the line from the **last item by position** (`:last-child` of the `<ol>`), even if an item with `end: null` ends up in the middle. Verification: CSS inspection.
- RF-7: THE SYSTEM scales the indent with `--timeline-indent` and declares no `@media` of its own (nor `@media print`: the item's `break-inside: avoid` is set by the shared print style per `foundations/layout.md` → Print, G-D). Verification: CSS inspection.

## Anatomy

```
●  B.Sc. in Computer Science          ← h3 (h4 style) — title
│  University of Buenos Aires         ← organization
│  2012 — 2017                        ← period (text-muted, <time>)
│  Focus on software engineering…     ← description
│
●  Web Accessibility Specialist
   …                                  ← the last item has no line
```

```html
<ol class="timeline" role="list">
  <li class="item">
    <article aria-labelledby="edu-uba-cs-title">
      <h3 id="edu-uba-cs-title" class="title">B.Sc. in Computer Science</h3>
      <p class="organization">University of Buenos Aires</p>
      <p class="period"><time datetime="2012">2012</time> — <time datetime="2017">2017</time></p>
      <p class="description">…</p>
    </article>
  </li>
</ol>
```

## API

```ts
import type { Locale, TimelineEntry } from "@data/cv.types.generated";

export interface TimelineProps {
  entries: readonly TimelineEntry[];
  locale: Locale;
  /** "Present" / "Actualidad". */
  presentLabel: string;
  /** Prefix for unique title ids (e.g. "edu", "exp"); formula: `${idPrefix}-${entry.id}-title`. */
  idPrefix: string;
  /** Joined to the base class of the root `<ol>` (G-B). */
  className?: string;
}
```

It uses `formatPeriod` from `src/i18n/formatPeriod.ts` (foundation creates it in F1,
with its tests; spec in `foundations/i18n.md`). Timeline does not reimplement it.
For the per-endpoint `<time>` elements it also uses the **per-endpoint formatter** that
extension exports (RF-4; decision 12=a — `formatPeriod` is not broken).
The render order is **that of the data** (the content decides the order).

The title of each item is **always `<h3>`** (with h4 style). There is no prop
to change the level: the hierarchy is fixed in `docs/DESIGN.md` and
`foundations/typography.md` (h2 section → h3 item).

## Styles and tokens

| Part | Value |
|---|---|
| List | `list-style: none; margin: 0; padding: 0 0 0 calc(var(--size-timeline-dot) / 2 + var(--timeline-dot-ring));` (it leaves room so that the dot and its halo are not cut off on the left) |
| Item | `position: relative; border-left: var(--timeline-line-width) solid var(--color-track); padding: 0 0 var(--space-6) var(--timeline-indent);` (indent 30px < 580 → 40px) |
| Last item | `border-left-color: transparent; padding-bottom: 0;` |
| Dot (`::before`) | `width/height: var(--size-timeline-dot); border-radius: 50%; background: var(--color-accent); box-shadow: 0 0 0 var(--timeline-dot-ring) var(--color-track); position: absolute; top: var(--timeline-dot-top); left: calc((var(--size-timeline-dot) + var(--timeline-line-width)) / -2);` (centered on the line: half the dot plus half the line's thickness) |
| Title | `font-size: var(--font-size-h4); font-weight: var(--font-weight-medium); margin: 0; position: relative; top: calc(var(--timeline-title-shift) * -1);` |
| Organization | `color: var(--color-heading); font-weight: var(--font-weight-regular); margin: 0;` |
| Period | `color: var(--color-text-muted); margin: 0;` |
| Description | `margin: var(--space-1) 0 0;` |

**New token (decision 13): `--timeline-title-shift: 0.3125rem`** in `tokens/tokens.css` (a fixed value, it does not scale by breakpoint; it replaces the title's `-0.3125rem` literal and documents the coupling with `--timeline-dot-top` that today lives only in a comment). **The user adds it** in the components section, before Timeline T3 (the same mechanics approved in #99 for `--button-small-padding-*`; `tokens/` is kit and the agents do not write it). The exact line is presented at the Plan + Tasks gate of F3.

The line and the halo use `--color-track` (in dark = `--color-border`, so
that they are visible: dark `grey-200` is darker than the card).

`border-left-color: transparent` on the last item uses the keyword
`transparent`, allowed by hard rule 1 of `docs/DESIGN.md`.

## States

It is not interactive: no hover or focus. A single variant: the last item with no line.

## Responsive

No `@media` of its own: the indent scales through the `--timeline-indent` token.

## Accessibility

- `<ol role="list">`: the order matters (the explicit `role` is because of the `list-style: none` quirk; RF-1).
- Each item is an `<article>` named by its title.
- The dot and the line are decorative (pseudo-elements).
- Dates with `<time dateTime>`; "Present" is text.

## Expected tests

1. It renders a `list` (ol) with one `listitem` per entry, in order.
2. Each item has a **level 3** heading with the title.
3. It shows organization, formatted period and description.
4. `end: null` → the period ends in `presentLabel`.
5. `YYYY-MM` dates are formatted according to `locale` (en vs es) with the per-endpoint formatter (RF-4).
6. There are **two `<time>`** per item with a range (start and end), each with `dateTime` equal to the value from the data; `end: null` → a single `<time>` + `presentLabel` as text.
7. Title ids follow the formula `${idPrefix}-${entry.id}-title` and two Timelines on the same page do not collide.
8. Empty `entries` → it renders nothing (`null`).
9. `expectNoA11yViolations` with no violations.

The tests of `formatPeriod` live next to the function (F1), not in Timeline.

## Do not

- Do not use `h5` (the original theme did; it breaks the hierarchy).
- Do not sort the entries inside the component.
