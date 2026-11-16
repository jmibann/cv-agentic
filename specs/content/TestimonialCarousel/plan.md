# Plan — TestimonialCarousel

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/TestimonialCarousel/getScrollStops.ts` | pure functions `getScrollStops(slideOffsets, maxScroll)` (clamp + 1px dedup + order) and `getActiveStop(stops, scrollLeft)` (closest; tie → lower) | RF-3, RF-5 |
| `src/components/TestimonialCarousel/getScrollStops.test.ts` | 4 cases of the spec (pure functions) | RF-3, RF-5 |
| `src/components/TestimonialCarousel/TestimonialCarousel.tsx` | a single `<section aria-roledescription="carousel">` (RF-1/decision 20), grid+snap track with `role="group"` slides "n of N", bullets by stops (`goToSlide` interpolated with the stop→n rule), `selectedId` + a single `TestimonialDialog`, i18n `format` | RF-1,RF-2,RF-3,RF-4,RF-5,RF-6,RF-8 |
| `src/components/TestimonialCarousel/TestimonialCarousel.module.css` | track (`grid-auto-flow/columns`, `--layout-gap`, `overflow-x`, `scroll-snap`, `overscroll-behavior-x`, `padding-block: var(--testimonial-headroom) 2rem`, hidden scrollbar), slide (snap-align, width ≥ md by `/2`), pagination, bullet (`--size-bullet`, active `--size-bullet-active` + `--gradient-accent`, muted hover, focus ring, 24×24 touch `::after`), stacked `@media print` + hidden pagination | RF-2,RF-7,RF-8 |
| `src/components/TestimonialCarousel/TestimonialCarousel.test.tsx` | tests + a11y closing case | all |
| `src/components/TestimonialCarousel/index.ts` | re-export (`TestimonialCarousel`, types; `getScrollStops`/`getActiveStop` stay in their own file, with no re-export needed) | — |

## Pure functions and algorithm

- `getScrollStops`: `slideOffsets.map(o => Math.min(o, maxScroll))` → dedup with 1px tolerance (it keeps the lower one) → asc. The spec's cases are fixed.
- `getActiveStop`: argmin by distance to `scrollLeft`; tie → lower index (case 4).
- Name of the bullet (decision 21): `bulletNumber(stop) = testimonios.findIndex(t => t.offsetLeft >= stop - 1) + 1` (1-based; implemented where offsets are read in the component — it is not strictly pure because of the DOM; it is documented in the `.tsx`).

## Interface

`TestimonialCarouselProps { testimonials; labels: TestimonialCarouselLabels; labelledBy?; className? }` (spec → API; `className` to the root `<section>`, G-B). Interpolation with `format` from `src/i18n/format.ts` (slide `current` 1-based/`total = length`; `goToSlide {n}` by the rule above; `readMore {author}` per card, already passed to the card as `openLabel`).

## Decisions

- **Internal state:** `selectedId: string | null` (RF-6); `onOpen(id)` sets it, `onClose` → null; the dialog's `testimonial` is derived (`find`). No value→value (RF-6 + the dialog's cycle).
- **Stops in layout:** measurement of the slides' `offsetLeft` and the track's `scrollWidth/clientWidth` in an effect after mount; **a `ResizeObserver` on the track re-measures when the size changes (real wiring, RF-3; no unit test → QA F5, decision 21)**. In jsdom they are set with `Object.defineProperty` in the tests; the local `scrollTo` mock (`vi.fn`) is enough.
- **`behavior` (RF-4):** `window.matchMedia("(prefers-reduced-motion: no-preference)").matches ? "smooth" : "auto"` read on the click (no live state; the setup mock gives `matches=false` → "auto"; the smooth case with a local stub in the test).
- **rAF per frame** in the `scroll` handler (RF-5): cancel with `cancelAnimationFrame`/a flag in the cleanup.
- **No keyboard arrows, no aria-live** (decision 21): it is documented in the component with a comment citing the spec.
- **DOM model of slides (Accessibility change, user's decision 2026-10-07, option A):** track and slides are `<div>`, not `<ul>/<li>`; each slide `<div class="slide" role="group" aria-roledescription="slide" aria-label>`. `li[role=group]` violates `aria-allowed-role` (axe) and makes Test 12 unfeasible with the track closed; the APG pattern uses divs. The module no longer declares `list-style` and the track carries `position: relative` (offsetParent for `offsetLeft`). Consequence: the structural asserts `tagName "UL"/"LI"` of T2/T3 are updated to `div`+`role="group"` within this Change (the user's decision; the observable contract "one `group` per testimonial n of N" does not change).
- Print: the stacking lives in the carousel's **own** `@media print` (RF-8; its spec sets the rule: track block, slide `break-inside`, margin, hidden pagination) — consistent with G-D: it is the declared contract of this piece.

## Test strategy

Pure functions: 4 exact cases (tests 1–4). Component: fixture of 3 testimonials (ids `t-a`/`t-b`/`t-c`); layout mock (offsets [0,300,600], scrollWidth 900, clientWidth 600 → 2 stops; and a 1/view variant). `scrollTo` mocked on the track (`Object.defineProperty(el,"scrollTo")`). Tests 5–12 of the spec, with the initial `aria-current` on the bullet of stop 0, `user-event` on bullets, `fireEvent.scroll` for the active one, and test 10: click "Read full testimonial from …" → dialog with the author; closing → it disappears (it uses the real `TestimonialDialog` with the F1 dialog mock; `HexAvatarDefs`+`AccentGradientDefs` scaffold). Closing with `expectNoA11yViolations` (closed and dialog open) — **feasible only with the div model of the Change**. P1: snap/columns/print/touch bullet/RO → inspection + QA F5.

Coverage: T1→(pure) · T2→RF-1,RF-6 · T3→RF-3,RF-5 · T4→RF-4 · T5→RF-2,RF-3(RO),RF-7,RF-8 + div-model Change (structural updates of T2/T3) + extra test of the `className` join + closing.
