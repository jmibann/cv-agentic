# TestimonialCard
Status: implemented

## Purpose

Testimonial card in the carousel: a hexagonal avatar that sticks out at the top,
name, role, an excerpt of the text and a quote icon. It is **operable over its whole
surface through the stretched button** (*stretched link* pattern: the button
covers the card with its `::after`; the `<article>` is not clickable) and it opens the
full text in `TestimonialDialog`.

## Requirements (EARS)

- RF-1: WHEN the user activates the stretched button (click, Enter or Space), THEN THE SYSTEM invokes `onOpen(testimonial.id)`; THE SYSTEM keeps that button as the only focusable element of the card, with `aria-label` equal to `openLabel`, and the `<article>` is not clickable. The button is **always** shown (even if the text fits entirely in the 4 lines).
- RF-2: THE SYSTEM clamps the excerpt to 4 lines on screen (verification: CSS inspection; jsdom does not compute clamp); in its own `@media print` it shows the full text and hides the stretched button (the shadow is already resolved by the `--shadow-control: none` token in print — the card does not redeclare it).
- RF-3: THE SYSTEM reserves the space of the protruding avatar through `--testimonial-headroom` on the container that hosts the card. (Verification in the consumer — carousel RF-7 —; the piece does not test it.)
- RF-4: THE SYSTEM uses `HexAvatar` with `alt=""` and treats the quote as decorative; it does not reimplement the hexagon or show a date. The excerpt is filled with `testimonial.text` (the long field of the schema).
- RF-5: THE SYSTEM applies on hover the shadow `--shadow-control` (rule `.card:hover` on the root; transition `box-shadow var(--duration-base) var(--ease-standard)`, G-E) and on visible focus the standard focus ring on the button's `::after`. **F5 Change 2026-10-08 (finding D3 of `docs/qa-report.md`): the root `<button>` suppresses the browser's own ring (`outline: none` on the button's base): the only visible ring is that of the `::after`; the UA ring of the stretched button duplicated a 2px ring foreign to the kit (hard rule 7 of `docs/DESIGN.md`).** Verification: CSS inspection + focus by ring test impossible in jsdom → QA F5.
- RF-6: THE SYSTEM declares no **breakpoint** `@media` of its own: padding, avatar lift and quote position scale with `--testimonial-*` tokens. The only exception is the card's own `@media print` block (RF-2 / decision 17 and G-D-1). Verification: CSS inspection.
- RF-7: THE SYSTEM renders the `author` in an `<h3>` with the fixed id `testimonial-${testimonial.id}-name` (the `<article>` is named with that id), the `role` and the excerpt (RF-4). Fixed h3 level, with no prop.

## Anatomy

```
   ⬡⬡⬡
  ⬡ av ⬡  María González              ❝   ← quote with gradient (top right)
   ⬡⬡⬡   Product Manager, Acme Corp
  Alex consistently delivered high-quality work and made
  complex features feel simple for our users…             ← clamped to 4 lines
```

```html
<Box variant="inner" as="article" className="card" aria-labelledby="testimonial-t-maria-name">
  <div class="header">                                                 <!-- grid auto | 1fr -->
    <HexAvatar src={testimonial.avatar.src} className="avatar" />     <!-- alt="" by default -->
    <div class="identity">
      <h3 id="testimonial-t-maria-name" class="name">María González</h3>
      <p class="role">Product Manager, Acme Corp</p>
    </div>
  </div>
  <p class="excerpt">Alex consistently…</p>
  <Icon name="quote" tone="gradient" className="quote" />
  <button type="button" class="stretched" aria-label="Read full testimonial from María González"></button>
</Box>
```

The `<button>` covers the whole card with `::after` (*stretched link* pattern):
a `<button>` cannot contain headings, so the heading stays outside and the
button stretches over it.

## API

```ts
import type { Testimonial } from "@data/cv.types.generated";

export interface TestimonialCardProps {
  testimonial: Testimonial;
  /** "Read full testimonial from {author}", already interpolated. */
  openLabel: string;
  onOpen: (id: string) => void;
  className?: string;
}
```

## Styles and tokens

| Part | Value |
|---|---|
| Card | `Box variant="inner" as="article"` (the Box's `surface-muted` background) with its own class `.card` that adjusts: `position: relative; display: flex; flex-direction: column; border-radius: var(--radius-16); padding: var(--testimonial-padding); height: 100%;` (16px < 580 → 30/30/24px). **No `margin-top`**. Decision 17: the surface is an inner Box, not a hand-made card. |
| Avatar | `HexAvatar` with `margin-top: calc(var(--testimonial-avatar-offset) * -1);` (it rises 40px < 580 → 60px) |
| Header | `display: grid; grid-template-columns: auto 1fr; column-gap: 0.9375rem; align-items: start; margin-bottom: 0.75rem;` (avatar in column 1, name and role in column 2; no negative margins). `align-items: start` (Change 2026-11-12, decision #113; previously `end`): the avatar stays anchored at the top and always protrudes `--testimonial-avatar-offset − --testimonial-padding-top`, with any number of lines of name and role; with `end` it went down with each line and ended up misaligned between cards |
| Identity | block with name and role: `padding-inline-end: var(--testimonial-quote-reserve);` — it reserves exactly what the quote invades of the content area: width of the quote (2rem) + `--testimonial-quote-inset-inline` − right padding of the card (2.2rem < 580 → 2rem ≥ 580), so that name and role never end up under it (Changes 2026-11-12: #112 introduced it, #113 adjusts it to the exact value) |
| Name | h3: `--font-size-h3`; `margin: 0;` |
| Role | `color: var(--color-text-muted); margin: 0;` |
| Excerpt | `display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; margin: 0;` |
| Quote | `Icon name="quote" tone="gradient" className={styles.quote}` with `.quote { --icon-size: 2rem; }` (on the class of the icon itself; Icon RF-6); `position: absolute; top: var(--testimonial-quote-inset-block); right: var(--testimonial-quote-inset-inline);` |
| Stretched button | `position: static; background: none; border: 0;` `::after { content: ""; position: absolute; inset: 0; border-radius: inherit; }`; `cursor: pointer` |

### Space for the avatar (headroom)

The avatar protrudes above the top edge of the card by
`--testimonial-avatar-offset − --testimonial-padding-top` (30px ≥ 580,
24px < 580). The card **does not reserve that space**: the container that
hosts it does, using the `--testimonial-headroom` token (= that protrusion + 0.5rem
for the shadow). In the carousel it is the track's `padding-top` (see
`TestimonialCarousel.md`). If the card is used outside the carousel, the parent
must apply that same token.

The hexagonal shape is resolved by the `HexAvatar` primitive
(`specs/primitives/HexAvatar/spec.md`): it is not reimplemented here.

## States

| State | Effect |
|---|---|
| Hover (on the card) | `box-shadow: var(--shadow-control)` with a `box-shadow` transition of `--duration-base` |
| Focus-visible (button) | on the button's `::after`: `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active | no effect of its own |

## Responsive

No `@media` of its own: padding, avatar lift and quote position
scale through tokens (`--testimonial-*`).

## Print

In `@media print` (the carousel uses it when printing the stacked testimonials):
the excerpt shows the **full text** (`display: block; -webkit-line-clamp: unset; overflow: visible;`),
the stretched button is hidden (`display: none`) and the card has no shadow.

## Accessibility

- `<article>` named by the h3.
- Avatar with `alt=""`: the name is next to it, announcing it twice is noise.
- The button has an explicit name (`openLabel`) and is the only focusable thing in the card.
- The quote is decorative.

## Expected tests

1. `getByRole("article", { name: author })` with a level 3 heading and id `testimonial-${testimonial.id}-name` (RF-7).
2. It shows `role` and the excerpt (`testimonial.text`).
3. `getByRole("button", { name: openLabel })`; click → `onOpen(testimonial.id)`.
4. Enter and Space on the button call `onOpen`.
5. The avatar image has `alt=""` (decorative) and is rendered with `HexAvatar` (the test mounts `HexAvatarDefs` and `AccentGradientDefs`).
6. `expectNoA11yViolations` with no violations.

## Do not

- Do not wrap the whole card in a `<button>` or put `onClick` on the `<article>`.
- Do not show a date (decision: testimonials carry no date).
- Do not reimplement the hexagon: use `HexAvatar`.
- Do not add breakpoint `@media` of its own (RF-6); the only one allowed is its own `@media print` block (RF-2).
