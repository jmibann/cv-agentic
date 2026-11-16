# Plan — TestimonialCard

## Files and responsibilities

| File | Responsibility | RF |
|---|---|---|
| `src/components/TestimonialCard/TestimonialCard.tsx` | `Box variant="inner" as="article">` + `.card`: header grid (HexAvatar + identity h3/p), excerpt, gradient quote, stretched button | RF-1, RF-2, RF-4, RF-7 |
| `src/components/TestimonialCard/TestimonialCard.module.css` | card adjustments on top of the Box (relative/flex/`--radius-16`/`--testimonial-padding`/`height: 100%`), avatar offset, grid, clamp, absolute quote, the button's `::after`, hover shadow + transition, its own `@media print` | RF-2, RF-5, RF-6 |
| `src/components/TestimonialCard/TestimonialCard.test.tsx` | tests + a11y closing case | all |
| `src/components/TestimonialCard/index.ts` | re-export | — |

## Pure functions and algorithm

None.

## Interface

`TestimonialCardProps { testimonial; openLabel; onOpen; className? }` (spec → API; `className` to the root Box via Box, G-B). The h3 id: `testimonial-${testimonial.id}-name` (fixed formula RF-7).

## Decisions

- Surface on `Box variant="inner" as="article">` + a `.card` class that adjusts (decision 17): background of the inner Box (`surface-muted`), its own radius/padding through tokens; the card declares no literal color.
- Stretched button (RF-1): `<button type="button" aria-label={openLabel}>` with no children; `::after { inset: 0 }` covers the card; `onOpen(testimonial.id)`; the only focusable; always visible (decision 17). Native Enter/Space.
- Avatar: `HexAvatar src=… className={styles.avatar}` (default alt ""), negative `margin-top` by token; the headroom is NOT reserved here (RF-3: it belongs to the track, carousel).
- Quote: `Icon name="quote" tone="gradient" className={styles.quote}` (`--icon-size: 2rem`, absolute with token insets) — decorative.
- 4-line clamp (`-webkit-line-clamp`) + its own `@media print` (RF-2: it removes the clamp/hides the button; shadow via the token in print, not redeclared) — the only F3 piece with its own print together with the dialog (G-D-1).
- Hover on the card: rule `.card:hover { box-shadow: var(--shadow-control) }` with transition `box-shadow var(--duration-base) var(--ease-standard)` (G-E; the button's `::after` needs no separate hover state).

## Test strategy

`Testimonial` fixture (id `t-maria`). Scaffolds: `HexAvatarDefs` + `AccentGradientDefs` (quote and gradient avatar; HexAvatar → Shape criterion). Tests: `getByRole("article", { name: author })` with a level 3 heading and formula id; role and excerpt visible (`testimonial.text`); `getByRole("button", { name: openLabel })` the only focusable of the article (`focus()` Tab-order: `queryAll...` of elements? assert that the article has no tabIndex or other control — NavTabs criterion); click/Enter/Space → `onOpen("t-maria")` once (user-event); avatar `img` with `alt=""`; `expectNoA11yViolations`. P1 (clamp, hover, focus ring of the ::after, print, offsets): inspection + QA F5 (#101). Red on-arrival likely in the "only focusable" case if T1 mounts another control — no: it must not exist.

Coverage: T1→RF-4,RF-7 · T2→RF-1 · T3→RF-2,RF-3(doc),RF-5,RF-6 + closing.
