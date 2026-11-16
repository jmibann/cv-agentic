# Layout

## Document structure

```html
<body>
  <a class="skip-link" href="#main-panel">Skip to content</a>
  <div class="container">                     <!-- AppLayout -->
    <ControlsBar />                       <!-- renders its own <header> (banner) -->
    <div class="grid">
      <Sidebar />                         <!-- renders its own <aside aria-label> -->
      <main>
        <Box variant="outer">                 <!-- content card -->
          CornerTab > NavTabs (role="tablist")
          <div role="tabpanel" id="main-panel">  AboutPage | ResumePage  </div>
        </Box>
      </main>
    </div>
  </div>
</body>
```

## Container

- `max-width: var(--container-max)` (1290px), centered, `padding-inline: var(--container-padding-inline)`.
- `padding-bottom: var(--gutter-bottom)`.
- On top: the `--gutter-top` space (5rem; 10rem at xl) holds the **ControlsBar**.
  The bar takes the lower part of that space, aligned to the right:

  ```
  padding-top: calc(var(--gutter-top) - var(--size-control) - var(--space-4));
  ControlsBar (height: var(--size-control))
  margin-bottom: var(--space-4)
  ```

  At xl the sidebar avatar sticks out upwards into that space,
  but only in the left column; the ControlsBar is on the right, they do not collide.

## Grid per breakpoint

### base → lg (< 1200px): one column

```
┌──────────────────────────────────── ControlsBar ─ [☀] [EN|ES] ┐
┌───────────────────────────────────────────────────╭──────────────┐
│ ┌──────┐  Name                                          ⌄         │  ← button (chevron, F5 Change #104b)
│ │avatar│  [Role]                                            ╰─────┤
│ └──────┘  (social links, centered)                                 │
│ ─────────────────────── (collapsible) ────────────────────────── │
│ ✉ EMAIL        ☎ PHONE          ← 2 columns ≥768, 1 column <768   │
│ [ Download CV ] (only if downloadCvUrl exists)                   │
└──────────────────────────────────────────────────────────────────┘
  gap: var(--stack-gap)
┌──────────────────────────────────────────╭───────────────────────┐
│ About Me                                 │  About   Resume       │  ← CornerTab > NavTabs
│ ▬▬▬                                      ╰───────────────────────┤
│ …tabpanel…                                                       │
└──────────────────────────────────────────────────────────────────┘
```

- **< lg**: the panel's `h1` goes **below** the CornerTab so they do not
  overlap. A single formula (defined in `specs/layout/AppLayout/spec.md`),
  applied on the tabpanel (`.panel`):
  `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`.
  It subtracts the Box's `--box-padding` because the tab is positioned from the
  card's edge, not from its content.
- **≥ lg**: the tab **floats** to the right (`CornerTab placement="float"`) and
  the `h1` flows to its left on the same strip, using the tab's real width
  (no fixed reserves). `.panel` goes back to `padding-top: 0`. Detail in
  `specs/layout/AppLayout/spec.md` and `specs/primitives/CornerTab/spec.md`.

### xl (≥ 1200px): sidebar + content

```
                ┌──────┐                    ControlsBar ─ [☀] [EN|ES]
┌───────────────│avatar│┐  ┌─────────────────────────╭──────────────────┐
│               └──────┘│  │ About Me                │  About   Resume  │
│         Name          │  │ ▬▬▬                     ╰──────────────────┤
│        [Role]         │  │                                            │
│    (social links)     │  │ …tabpanel…                                 │
│ ───────────────────── │  │                                            │
│ ✉ EMAIL               │  │                                            │
│ ☎ PHONE               │  │                                            │
│ ⌖ LOCATION            │  │                                            │
│ [   Download CV   ]   │  │                                            │
└───────────────────────┘  └────────────────────────────────────────────┘
      3 / 12                              9 / 12
```

```css
@media (min-width: 1200px) {
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
    gap: var(--layout-gap);
    align-items: start;
  }
}

/* Sticky only if the Sidebar fits entirely on screen while it is fixed.
   Sidebar ≈ 665px + top ≈ 158px ≈ 823px; 900px leaves room for variable
   content (each extra contact adds ≈ 72px). The only height media query
   allowed (see docs/tokens/breakpoints.md). */
@media (min-width: 1200px) and (min-height: 900px) {
  .aside {
    position: sticky;
    /* the avatar sticks out ≈ 0.71 × its size above the card: the top
       includes it so it is not cut off when it becomes fixed */
    top: calc(var(--size-avatar-sidebar) * 0.71 + var(--space-7));
    z-index: var(--z-sticky);
  }
}
```

- **Sticky** Sidebar with CSS (`position: sticky`), no libraries. The `top`
  adds the avatar's protrusion (≈ 128px) and `--space-7`: with `top: 30px` the
  avatar would be cut off against the top edge when scrolling.
  Also, the sticky is enabled **only with `min-height: 900px`**: on shorter
  screens the fixed Sidebar (≈ 823px with the `top`) would not fit entirely and the
  Download CV button would be out of view. Below that height, the Sidebar
  scrolls with the page.
- The avatar sticks out: `margin-top: calc(var(--size-avatar-sidebar) * -0.71)` (≈ −8rem
  with 11.25rem), centered. That is why the `aside` needs an equivalent `padding-top`
  within `--gutter-top`; it is accounted for in the 10rem.

## Content of the panels

Visual summary. **The normative spec of each panel is in
[specs/pages/AboutPage/spec.md](../specs/pages/AboutPage/spec.md) and
[specs/pages/ResumePage/spec.md](../specs/pages/ResumePage/spec.md)**; if this
summary and those specs differ, the specs win.

### AboutPage

```
h1 About Me (SectionTitle decorated)
paragraphs (profile.about)
h2 Services  → ServiceCard grid: 1 col; 2 cols ≥ lg
h2 Testimonials → TestimonialCarousel (1 per view; 2 ≥ md)
```

### ResumePage

```
h1 Resume (SectionTitle decorated)
┌ ResumeSection Experience ────────────────────────────┐   a single column at
└──────────────────────────────────────────────────────┘   every width (#114)
┌ ResumeSection Education ─────────────────────────────┐   gap --stack-gap
└──────────────────────────────────────────────────────┘
h2 Skills → SkillList (chips) at full width
```

## Vertical spacing

- Between blocks of a panel: `var(--stack-gap)` (1rem → 1.875rem).
- Between a section h2 and its content: the h2's margin (1.25rem).
- No "loose" margins on components: a component gives itself no outer
  margin; the parent positions it (flex/grid with `gap`).

## Print (`@media print`)

The CV must print cleanly on A4/Letter:

- Hide: ControlsBar, CornerTab/NavTabs, the Sidebar's contacts chevron, Download CV,
  skip link, carousel bullets and the dialog.
- Testimonials: **all stacked, with the full text** (detail in
  `specs/content/TestimonialCarousel/spec.md` → "Print").
- **Print both panels** (About and Resume) one after the other, regardless of
  the active tab: hidden tabpanels are shown in print.
- Sidebar on top in one column, contacts always expanded.
- Always the light palette (also if the active theme is dark), white background and
  no shadows: **`tokens/tokens.css`** resolves it in its `@media print` block,
  which reassigns the semantic tokens. Components do nothing special
  about color for printing.
- `break-inside: avoid` on TimelineItem and ServiceCard.
- Contact links: show the value as text (it already is), not the URL.
