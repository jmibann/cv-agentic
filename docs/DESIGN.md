# Design — principles and rules

## Visual language

- **Cards floating on a tinted background.** All the content lives in cards,
  white (light) or graphite (dark), with a generous radius (20px), a thick
  and subtle bottom border (5px `box-edge`) and a long, diffuse shadow.
- **Accent used sparingly and with intent.** Never on large backgrounds. It is used in
  two ways, and each use has **a single** allowed form:
  - **Gradient** (`--gradient-accent`, or `url(#accent-gradient)` in SVG):
    bar under the `h1`, Button, icons of IconBox and ServiceCard, testimonial
    quote, active bullet of the carousel, active language of the LanguageSwitcher.
  - **Solid** (`--color-accent` / `--color-accent-text`): Timeline
    dot, active tab of NavTabs, accent text and links, hover of
    controls and social links, focus ring.
  - Light: blue `#304cfd → #2640eb` (solid `#304cfd`).
  - Dark: gold `#fadd7f → #f6c16f` (solid `#fadd7f`).
- **Light typography with firm headings.** Poppins 300 in the body,
  600 in headings, 500 in tabs, name and Timeline items.
- **Tabs on the corners.** The navigation is a tab (`CornerTab`)
  attached to the top right corner of its card: a barely raised background,
  a thin border and an asymmetric radius (0 / 20 / 0 / 32). The Sidebar's "Show
  Contacts" is **not** a tab: it is a gold chevron (`--color-accent-text`)
  with no background, attached to the corner (F5 Change #104b — the tab with a
  background overlapped the name at 375px; the identity and the typographic
  hierarchy stay intact).
- **Tints, not lines.** Inner blocks are separated by background
  (`surface-muted`) rather than by borders. Lines (Timeline, Separator)
  are 1px and decorative.

## Hard rules (the reviewer verifies them)

1. **Zero color literals outside `tokens/tokens.css`.** No `#hex`, no
   `rgb()`, no `hsl()`, no names (`white`, `black`), neither in CSS nor in TSX.
   Exceptions: the keywords `transparent` and `currentColor` (they are not
   brand colors); the two initial `theme-color` values in the anti-flash
   script of `index.html` (it runs before `tokens.css` loads; a test
   verifies they equal `--palette-light-bg` / `--palette-dark-bg`); and
   the content images in `public/` (placeholders), which are not styles. The light palette for printing is forced by `tokens.css`
   in its `@media print` block; components do not touch it.
2. **Only semantic tokens in components** (`--color-*`, `--gradient-*`,
   `--shadow-*`, `--filter-*`, `--space-*`, `--radius-*`, `--size-*`,
   `--font-*`, `--duration-*`, `--ease-*`, `--z-*`, `--focus-*` and the
   components' internal measures). `--palette-*` tokens are not used outside
   `tokens.css`. `z-index` always with a `--z-*` token (the negative one too:
   `--z-below`).
3. **CSS Modules only.** No styled-components, CSS-in-JS, Tailwind, or
   `style={{…}}` for static styles (allowed for dynamic values that are
   impossible in CSS, justified in a comment). The only global CSS
   allowed is `src/styles/global.css`, with exactly: reset,
   typographic base (`foundations/typography.md`), shared print
   styles and the dialog's scroll lock
   (`html:has(dialog[open]) { overflow: hidden; }`).
4. **Mobile-first** with the 4 breakpoints of `docs/tokens/breakpoints.md`.
5. **AA contrast** in both themes: only pairs from `docs/tokens/contrast.md`.
   Text on accent → `--color-on-accent`.
6. **Content as data.** No CV text in components: the
   content lives in `src/content/cv.{en,es}.json` (format defined by
   `data/cv.schema.json`). No hardcoded interface text (everything through
   `ui.{en,es}.ts`).
7. **Accessibility is non-negotiable**: correct roles and names, full
   keyboard, visible focus, no axe violations (`expectNoA11yViolations`) in every component.
   The focus ring is always the same:
   `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);`
   (`:focus-visible` only).
8. **No new dependencies** outside the approved ones (see README).

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| `color: var(--color-accent-text)` for accent text | `color: var(--color-accent)` for text (they may differ in the future) |
| `color: var(--color-on-accent)` on the gradient | `color: #fff` on the gradient (unreadable in dark) |
| Chips on `surface` | Chips inside `Box variant="inner"` (same background) |
| `CornerTab` with a 1px border | CornerTab with no border or with a shadow |
| `h3` styled as h4 in Timeline | `h5` in Timeline (breaks the hierarchy) |
| Native `<dialog>` | Modal libraries |
| scroll-snap + bullets | Swiper / autoplay |
| Transitions on concrete properties | `transition: all` |
| Informative icon with `label` | Icon as the only content of a button with no `aria-label` |
| `gap` on the parent for spacing | outer `margin` on components |

## Provenance

Tokens, measures and layout patterns were extracted from the commercial theme
"vCard 2" (light and dark) and from reference captures for the navigation.
**No code or assets were copied from the theme**: all the CSS and the SVGs are written
from scratch from these specs. Do not include images, logos or avatars from
the theme's demo.

## Out of scope (closed decisions)

Portfolio, Blog, Contact page (form), skills with percentage/bars,
skill grouping, clients carousel, preloader, triangles background,
date in testimonials, hamburger menu/drawer. Reopening any of them is a
scope change the user decides.
