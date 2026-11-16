# Breakpoints

Mobile-first. Base styles are for the smallest viewport and each `@media`
**adds** upwards with `min-width`. `max-width` is not used except in
`@media print` or for cases documented in a component's spec.

| Name | Query | Typical viewport | What changes (summary) |
|---|---|---|---|
| base | — | < 580px (phones) | One column, mobile typography, `--box-padding` 0.9375rem |
| `sm` | `(min-width: 580px)` | large phones | Desktop typography, `--box-padding` 1.5rem |
| `md` | `(min-width: 768px)` | portrait tablet | `--box-padding` 1.875rem, 2 testimonials per view, sidebar contacts in 2 columns |
| `lg` | `(min-width: 992px)` | landscape tablet / small laptop | Full-size NavTabs with the `h1` on the same strip, ServiceCards in 2 columns |
| `xl` | `(min-width: 1200px)` | desktop | Vertical Sidebar fixed on the left (3/12), content 9/12, avatar sticks out, contacts always visible, `--gutter-top` 10rem |

## Rules

- **The only height exception:** `(min-height: 900px)`, combined with
  `(min-width: 1200px)`, and only to enable the Sidebar's sticky in
  AppLayout (see `foundations/layout.md`). No other component uses height
  media queries.
- **Only these four width values** may appear in `@media`. Media queries do
  not accept custom properties, so they are written as literals:

  ```css
  .grid { display: grid; gap: var(--stack-gap); }

  @media (min-width: 768px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  ```

- **Every measure that changes by breakpoint is a token.** Typography,
  paddings, heights, gaps, radii and offsets that vary with the viewport live
  in `tokens.css` (section "Component internal measures"), with their scale
  in that file's `@media` blocks.
- A component **only** adds `@media` for *layout* changes
  (direction, columns, order, visibility, `position`/`float`). Inside
  that `@media`, any measure that goes with the layout change may only
  be a **token**, a **`calc()` of tokens** or **`0`** (e.g. the negative
  margins of `CornerTab placement="float"` or the panel's `padding-top: 0`).
  **Never** a new literal: if one is needed, a token is added (and
  documented in the spec).
- **Fixed** measures (that do not change by breakpoint) may be literals
  in the component's CSS if its spec defines them; if they repeat in more than one
  component, they become a token.
- `prefers-reduced-motion` and `print` are valid `@media` too.
- In tests (jsdom) there is no real layout: responsive behavior is
  verified in the visual QA phase (375 / 768 / 1024 / 1440), not in unit tests.
  Components must **not** branch logic in JS by width, unless
  the spec explicitly asks for it.

## Mapping to the reference theme

The original theme is desktop-first (`max-width`). The translation is:

| Theme (max-width) | Kit (min-width) |
|---|---|
| `≤ 580px` | base (< 580) |
| `≤ 767/768px` | < `md` |
| `≤ 991/992px` | < `lg` |
| `≤ 1199/1200px` | < `xl` |
