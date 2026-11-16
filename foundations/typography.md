# Typography

## Font

- **Poppins**, served from the site itself (no Google Fonts at runtime).
- Recommended implementation: the `@fontsource/poppins` package, importing only
  the weights used, in the app's entry:

  ```ts
  import "@fontsource/poppins/300.css";
  import "@fontsource/poppins/400.css";
  import "@fontsource/poppins/500.css";
  import "@fontsource/poppins/600.css";
  ```

  Alternative with no dependency: `.woff2` in `public/fonts/` with its own
  `@font-face` (`font-display: swap`, latin subset, which covers á é í ó ú ñ ¿ ¡).
- No italics: the design does not use them.
- Fallback stack: `--font-family` (system-ui…).

## Base styles (global, in the app's global CSS)

```css
body {
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-light);
  line-height: var(--line-height-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 {
  color: var(--color-heading);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading);
  margin: 0;
}
h4 { font-weight: var(--font-weight-medium); }
strong, b { font-weight: var(--font-weight-semibold); color: var(--color-heading); }
```

The body at **weight 300** is part of the visual identity (light text,
firm headings). Do not raise it "so it reads better" without asking.

## Scale

| Token | < 580px | ≥ 580px | Weight | Use |
|---|---|---|---|---|
| `--font-size-h1` | 24px | 32px | 600 | Page title ("About Me", "Resume") |
| `--font-size-h2` | 18px | 24px | 600 | Section titles (Education, Testimonials, dialog) |
| `--font-size-h3` | 16px | 18px | 600 | ServiceCard, name in TestimonialCard |
| `--font-size-h4` | 14px | 16px | 500 | TimelineItem title |
| `--font-size-h5` | 12px | 14px | 600 | Reserved |
| `--font-size-h6` | 10px | 12px | 600 | Reserved |
| `--font-size-body` | 14px | 15px | 300 | Paragraphs |
| `--font-size-name` | 17px | 27px (≥768) | 500 | Name in the sidebar |
| `--font-size-button` | 14px | 16px | 400 | Button |
| `--font-size-small` | 12px | 12px | 400 | Button `size="small"` |
| `--font-size-badge` | 11px | 13px (≥768) | 400 | Role badge, skill chips |
| `--font-size-overhead` | 11px | 12px | 400, UPPERCASE | Contact labels |
| `--font-size-nav` | 14px | 16px (≥992) | 500 | NavTabs |

## Visual level vs. semantic level

**Visual size does not define the heading level**. The document's
hierarchy is:

```
h1  page title (one per tabpanel)
└─ h2  section (Services, Testimonials, Experience, Projects, Education, Skills)
   └─ h3  item (ServiceCard, TimelineItem, TestimonialCard)
```

The title of a TimelineItem is an `<h3>` styled as h4 (the module's class,
not the tag). The original theme used `<h5>`; that breaks the hierarchy and is **not**
replicated. The sidebar name is not a heading: it is a `<p>` with its own style
(decision pinned in `specs/layout/Sidebar/spec.md`; the only `h1` is the one of the
active panel).

## Heading margins

| Element | Margin-bottom |
|---|---|
| h1 with bar (SectionTitle `decorated`) | `var(--title-decorated-gap)` (24px < 580 → 37px) — includes the bar; the text→bar distance is `--title-bar-offset` |
| h2 | 1.25rem |
| h3 | 0.5rem |
| h4 (TimelineItem) | 0 (the period goes right below) |
