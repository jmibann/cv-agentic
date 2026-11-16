# TestimonialCarousel
Status: implemented

## Purpose

Horizontal carousel of testimonials with native scroll-snap, pagination
bullets and a single `TestimonialDialog` to see the full text. With no
libraries (it replaces Swiper) and **no autoplay**.

## Requirements (EARS)

- RF-1: WHEN `testimonials` contains elements, THEN THE SYSTEM renders **the only `<section>` of the region** (decision 20: the carousel owns the section; AboutPage does **not** wrap it in another one) with `aria-roledescription="carousel"`, named by `labelledBy` (if passed) or `aria-label=labels.carousel`, with one slide per testimonial; IF `testimonials` is empty, THEN it renders nothing.
- RF-2: THE SYSTEM scrolls the track with native `overflow-x` and `scroll-snap-type` (no libraries), and implements no autoplay, loop or prev/next arrows. **Nor navigation with keyboard arrows** (decision 21): Tab between buttons + native scroll/swipe.
- RF-3: THE SYSTEM renders one bullet per reachable position (`getScrollStops`), not one per testimonial, recalculating them on mount **and every time the size of the track changes (it instantiates a `ResizeObserver` on the track that re-measures the stops; real wiring, not only theoretical)**; IF there is one stop or fewer, THEN it renders no bullets. The recalculation on resize **has no unit test** (the global `ResizeObserver` mock is a no-op; decision 21: the decision removes the test, not the behavior — its validation is QA F5). The initial active bullet, once the stops are calculated (mount, `scrollLeft = 0`), is that of the stop from `getActiveStop` → the first one.
- RF-4: WHEN the user presses a bullet, THEN THE SYSTEM calls `track.scrollTo` with the `left` of that stop, using `behavior: "smooth"` only if `prefers-reduced-motion` is `no-preference` (read through `window.matchMedia` on the click; it does not need to react live). Verification: `scrollTo` test with `behavior` according to the `matchMedia` mock (F1 setup: configurable `matches`).
- RF-5: THE SYSTEM marks `aria-current="true"` on the active bullet according to `getActiveStop(stops, scrollLeft)`, recalculated on the `scroll` event with one calculation per frame. **No `aria-live` region** (decision 21): the slide change is not announced; there is no autoplay.
- RF-6: THE SYSTEM keeps a single `TestimonialDialog`: the card's `onOpen(id)` sets the selected state and `onClose` clears it (with `testimonial` derived from `selectedId`; never value→value without an intermediate `null`, see the cycle in `TestimonialDialog.md`).
- RF-7: THE SYSTEM reserves the avatar's space with `padding-block: var(--testimonial-headroom) 2rem` on the track (the only place that does it: at the top, protrusion + shadow; at the bottom, a fixed `2rem` set textually by the table — the same criterion of fixed measures of `breakpoints.md` — so as not to clip the hover shadow) and hides the scrollbar.
- RF-8: THE SYSTEM prints the testimonials stacked with the full text and the pagination hidden, and scales the responsive behavior only with columns and tokens (no literal measures in `@media`; the `2rem` of RF-7 is outside `@media`).

## Anatomy

```html
<section aria-roledescription="carousel" aria-label="Testimonials">
  <div class="track">                                  <!-- overflow-x: auto + scroll-snap -->
    <div role="group" aria-roledescription="slide" aria-label="1 of 3" class="slide">
      <TestimonialCard … />
    </div>
    …
  </div>
  <div class="pagination">                          <!-- bullets -->
    <button aria-label="Go to slide 1" aria-current="true"></button>
    <button aria-label="Go to slide 2"></button>
    …
  </div>
  <TestimonialDialog testimonial={selected} onClose={…} closeLabel={labels.close} />
</section>
```

The carousel's `<section>` **is** the named region (decision 20): AboutPage
renders the `SectionTitle` and the carousel as siblings in the tabpanel, without wrapping
them in another `<section>`; when there is a visible h2 above, `labelledBy` is passed with the id
of the h2 (instead of `aria-label`).

**Accessibility change (user's decision 2026-10-07, option A):** the track
and the slides are `<div>`, not `<ul>/<li>`. `li[role="group"]` violates
axe's `aria-allowed-role` (the `group` role is not allowed on `li`) and drags in
the `list` rule; the APG carousel pattern uses `<div role="group">` containers.
Test 12 (`expectNoA11yViolations` on the whole track **closed**) is
unfeasible with `ul/li`, so the spec adopts divs to keep axe intact (without
disabling rules). Consequence for the approved tests of T2/T3: their structural
assertions `tagName "UL"/"LI"` are updated to `div`+`role="group"` **as
part of this same Change** (explicit decision of the user; it is not weakening —
the observable contract, "one `group` per testimonial with the name n of N", does not change).

## API

```ts
import type { Testimonial } from "@data/cv.types.generated";

export interface TestimonialCarouselLabels {
  carousel: string;        // "Testimonials"
  slide: string;           // "{current} of {total}"
  goToSlide: string;       // "Go to slide {n}"
  readMore: string;        // "Read full testimonial from {author}"
  close: string;           // "Close"
}

export interface TestimonialCarouselProps {
  testimonials: readonly Testimonial[];
  labels: TestimonialCarouselLabels;
  labelledBy?: string;
  /** Joined to the base class of the root `<section>` (G-B). */
  className?: string;
}
```

It interpolates with the i18n `format` function.

## Behavior

- **Slides per view**: 1 (< md), 2 (≥ md). CSS resolves it:
  `grid-auto-columns: 100%` → `calc((100% - var(--layout-gap)) / 2)`.
- **Scroll**: `overflow-x: auto; scroll-snap-type: x mandatory;` each slide
  `scroll-snap-align: start`. Native swipe/trackpad.

### Bullets: one per reachable scroll position

With 2 slides per view, not every testimonial can end up first (the
last one never reaches the left edge). That is why the bullets are **not** one
per testimonial, but one per **position the track can really
scroll to** (`stop`).

Two pure functions in the component's module, tested separately:

```ts
/** Reachable positions: offset of each slide limited to the maximum scroll, with no duplicates (1px tolerance), sorted. */
export function getScrollStops(slideOffsets: readonly number[], maxScroll: number): number[];
/** Index of the stop closest to scrollLeft (tie → the lower one). */
export function getActiveStop(stops: readonly number[], scrollLeft: number): number;
```

- `slideOffsets` = `offsetLeft` of each slide relative to the track;
  `maxScroll` = `track.scrollWidth - track.clientWidth`.
- Example: 3 testimonials, 2 per view → 2 stops (position 0 and the end).
  1 per view → 3 stops. 2 testimonials with 2 per view → 1 stop.
- The stops are recalculated on mount and when the size of the track changes
  (`ResizeObserver`).
- **Click on a bullet** → `track.scrollTo({ left: stop, behavior })`, with
  `behavior: "smooth"` only if `prefers-reduced-motion: no-preference`.
- **Active bullet** = `getActiveStop(stops, track.scrollLeft)`, recalculated on the
  track's `scroll` event (limited to one calculation per frame with
  `requestAnimationFrame`). It carries `aria-current="true"`.
- **Name of the bullet**: `goToSlide` with `n` = number (1-based) of the **first
  testimonial whose `offsetLeft ≥ stop − 1px`** (fixed rule of decision 21 for
  stops clamped to `maxScroll`; at stop 0 it is testimonial 1).
- **Name of the slide** (`slideLabel`): `current` = 1-based index of the testimonial
  in the array; `total` = `testimonials.length` (not of stops).
- **With 1 stop or fewer**: no bullets are rendered (it covers 1 testimonial, and 2
  testimonials with 2 per view). With **0 testimonials**: it renders nothing.

### Dialog

State `selectedId`; the card's `onOpen(id)` sets it; the dialog's `onClose`
clears it (see the state machine in `TestimonialDialog.md`).

## Styles and tokens

| Part | Value |
|---|---|
| Track | `position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 100%; gap: var(--layout-gap); overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; padding-block: var(--testimonial-headroom) 2rem; margin: 0; scrollbar-width: none;` (≥ md: 2 visible columns). `position: relative` is a **mechanical necessity** of the contract "`slideOffsets` relative to the track": it makes the track the `offsetParent` of the slides so that `offsetLeft` measures correctly (HexAvatar T2 / dialog-flex criterion; it is not a design value, it goes with a comment). There is no `list-style` any more (the track is a `div`, Accessibility change) |
| Slide | `div class="slide"` (direct child of the track): `scroll-snap-align: start;` (Behavior → Scroll) + `min-width: 0` (mechanical: a grid item without it swells to `min-content` and breaks the column/measurement; with a comment) |
| Track headroom | **The only place** that reserves space for the avatar of TestimonialCard: `padding-top: var(--testimonial-headroom)` (avatar protrusion + 0.5rem of shadow; 32px < 580 → 38px). `padding-bottom: 2rem` (fixed) so that the card's hover shadow is not clipped. Reason: `overflow-x: auto` also clips the vertical axis. The card has no `margin-top` |
| Scrollbar | Hidden (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`): the visible navigation is the bullets |
| Pagination | `display: flex; justify-content: center; gap: 0.625rem; margin-top: var(--space-4);` |
| Bullet | `width/height: var(--size-bullet); border-radius: var(--radius-round); background: var(--color-track); border: 0;` + a 24×24px touch area achieved with a **transparent pseudo-element** (`::after` with a negative inset), not with padding: it keeps the pagination's visual `gap: 0.625rem` (a choice set in the Clarification pass on the rule's "or"; rejectable at the Plan gate) |
| Active bullet | `width: var(--size-bullet-active); background: var(--gradient-accent);` `width` transition `--duration-base` `--ease-emphasized` (the background changes with no transition: a gradient cannot be animated) |

The active one is distinguished by **size** (10 → 20px) in addition to the color, because
`--color-track` is decorative (rule 3 of `docs/tokens/contrast.md`).

## States

| State | Effect |
|---|---|
| Bullet hover | `background: var(--color-text-muted)` (inactive ones only) |
| Bullet focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active bullet | see the styles table |
| Dialog open | see `TestimonialDialog.md` |

## Responsive

- < md: 1 testimonial per view; ≥ md: 2 (a change of columns, with no new measures).
- The headroom scales through a token (`--testimonial-headroom`).
- The number of bullets changes by itself with the width (the stops are recalculated).

## Print

The testimonials are printed **all of them, stacked, with the full text**:

- Track: `display: block; overflow: visible; padding: var(--testimonial-headroom) 0 0;`
  each slide `break-inside: avoid;` and, from the second one on,
  `margin-top: var(--testimonial-headroom)` (space for the avatar).
- Pagination: `display: none`. The dialog is not printed.
- TestimonialCard, in its own `@media print`, removes the clamp of the excerpt
  (full text), hides the stretched button and the shadow (see its spec).

## Accessibility

- WAI-ARIA *carousel* pattern: `aria-roledescription="carousel"` on the named
  section; each slide `role="group"` + `aria-roledescription="slide"` + `aria-label` "n of N".
- No autoplay → no pause button is needed. No `aria-live` region: the slide
  change is not announced (RF-5, decision 21).
- No navigation with keyboard arrows (RF-2, decision 21): Tab between controls + native scroll.
- Keyboard focus goes through the buttons of the cards (one per slide) and then
  the bullets; when a card out of view is focused, the browser scrolls it in.
- The bullets are `<button type="button">` with a name ("Go to slide n", stop→n
  mapping rule in Behavior).

## Expected tests

jsdom has no layout or `ResizeObserver`, and does not implement `scrollTo`:
mock them (in `src/test/setup.ts` or in the test) and set `offsetLeft`,
`scrollWidth`, `clientWidth` and `scrollLeft` with `Object.defineProperty`.
The recalculation of stops **on resize is not tested** (no-op global mock): QA F5
(decision 21). The `behavior` of `scrollTo` is set with the `matchMedia` mock
(from `src/test/`, configurable; F1 setup).

Pure functions:

1. `getScrollStops([0, 300, 600], 300)` → `[0, 300]` (2 per view).
2. `getScrollStops([0, 300, 600], 600)` → `[0, 300, 600]` (1 per view).
3. `getScrollStops([0, 300], 0)` → `[0]`.
4. `getActiveStop([0, 300], 140)` → `0`; with `160` → `1`; with `150` → `0` (tie → the lower one).

Component:

5. Section with a name (by `aria-label` or `aria-labelledby`).
6. One `group` per testimonial with `aria-roledescription="slide"` and the name "n of N" (1-based, `total = testimonials.length`).
7. With a mocked layout of 3 testimonials and 2 per view: 2 bullets; the first one with `aria-current="true"`; names according to the stop→n rule (Go to slide 1 / Go to slide 2).
8. Click on bullet 2 → `track.scrollTo` with the `left` of stop 2 and `behavior` according to `matchMedia.matches` (smooth / auto).
9. `scroll` event with `scrollLeft` at stop 2 → bullet 2 becomes `aria-current="true"` and bullet 1 does not.
10. Click on "Read full testimonial from X" → the dialog opens with the name of X; closing → it disappears.
11. 1 stop (e.g. 1 testimonial) → no bullets; 0 testimonials → it renders nothing.
12. `expectNoA11yViolations` with no violations (closed and with the dialog open).

## Do not

- Do not install Swiper, Embla or similar.
- Do not add autoplay or an infinite loop.
- Do not add prev/next arrows (the design uses bullets; if they were wanted, it is a spec change).
