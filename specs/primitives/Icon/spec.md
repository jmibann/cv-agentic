# Icon
Status: implemented

## Purpose

The only entry point to `lucide-react`. It centralizes size, color, the
gradient treatment and the accessibility of interface icons.

## Requirements (EARS)

- RF-1: WHEN the component receives a valid `name` of `IconName`, THEN THE SYSTEM renders the lucide `<svg>` that matches the explicit name → component map.
- RF-2: WHILE an `Icon` receives no `label`, THE SYSTEM marks it decorative (`aria-hidden="true"`).
- RF-3: WHEN the component receives `label`, THEN THE SYSTEM exposes `role="img"` with `aria-label` equal to the received label.
- RF-4: WHEN `tone` is `gradient`, THEN THE SYSTEM applies `stroke="url(#accent-gradient)"`, resolving the shared definitions of `AccentGradientDefs`; AppLayout guarantees the single mount in the app (RF-6 of its spec).
- RF-5: IF a name of the `ServiceIcon` `enum` of `data/cv.schema.json` has no entry in the component's map, THEN compilation fails (the link is `data/cv.types.generated.ts`: it requires `gen:types`, which runs in `prebuild`; without regenerating, nothing fails at runtime). Verification: build/prebuild (not testable in a unit test).
- RF-6: THE SYSTEM sizes the icon through CSS only (`--icon-size`, with `--size-icon` by default): no `size` prop and no `@media` of its own.
- RF-7: THE SYSTEM sets `focusable="false"` on the `<svg>` in every case (with and without `label`).

## Anatomy

A lucide `<svg>` with `stroke` configured. Optionally, the stroke uses the
shared accent gradient (`<AccentGradientDefs />`).

## API

```ts
import type { ServiceIcon } from "@data/cv.types.generated";

export type UiIconName =
  | "mail" | "phone" | "message-circle" | "map-pin" | "download"
  | "chevron-down" | "sun" | "moon" | "book-open" | "briefcase"
  | "quote" | "x";

export type IconName = UiIconName | ServiceIcon;

export interface IconProps {
  name: IconName;
  /** current = inherits color; accent = --color-accent; gradient = stroke with gradient. Default: "current". */
  tone?: "current" | "accent" | "gradient";
  /** If passed, the icon is informative: role="img" + aria-label. If not, aria-hidden. */
  label?: string;
  /** JOINED to the base class `.icon` on the root `<svg>` (it does not replace it); the parent sets `--icon-size` exactly here. */
  className?: string;
}
```

Explicit name → component map (no `import * as`, for tree-shaking):

| name | lucide | Use |
|---|---|---|
| mail | `Mail` | email contact |
| phone | `Phone` | phone contact |
| message-circle | `MessageCircle` | WhatsApp contact (lucide has no logo) |
| map-pin | `MapPin` | location contact |
| download | `Download` | Download CV button |
| chevron-down | `ChevronDown` | Show Contacts button |
| sun / moon | `Sun` / `Moon` | ThemeToggle |
| book-open | `BookOpen` | ResumeSection Education |
| briefcase | `Briefcase` | ResumeSection Experience |
| quote | `Quote` | TestimonialCard / Dialog |
| x | `X` | close TestimonialDialog |
| code, layout, palette, smartphone, server, database, cloud, pen-tool, camera, megaphone, gauge, shield | `Code`, `LayoutTemplate`, `Palette`, `Smartphone`, `Server`, `Database`, `Cloud`, `PenTool`, `Camera`, `Megaphone`, `Gauge`, `Shield` | ServiceCard |

The map is typed as `Record<IconName, LucideIcon>`: if a name is added to the
`ServiceIcon` `enum` of `data/cv.schema.json` (and to `SERVICE_ICONS` of `@data/constants`)
without adding it here, **compilation fails** (the generated type is a union of literals).

## Gradient

Lucide draws with `stroke`; `background-clip: text` (what the theme used)
does not apply to SVG. Instead:

- `AccentGradientDefs` (exported from the same module) renders **once**,
  in `AppLayout`, an `<svg width="0" height="0" aria-hidden="true" focusable="false">`
  with `<linearGradient id="accent-gradient" gradientUnits="userSpaceOnUse" x1="0.62" y1="-0.56" x2="23.38" y2="24.56">`
  and two `<stop>` elements whose color comes from tokens **through the CSS Module** (no inline styles):
  `<stop offset="0.2631" className={styles.stopStart} />` / `<stop offset="0.9375" className={styles.stopEnd} />`
  with `.stopStart { stop-color: var(--gradient-accent-start); }` and
  `.stopEnd { stop-color: var(--gradient-accent-end); }`.
- `tone="gradient"` → `stroke="url(#accent-gradient)"`.
- **`gradientUnits="userSpaceOnUse"` is mandatory.** With the default
  value (`objectBoundingBox`) each stroke of the icon takes its own box: the
  gradient changes from one stroke to another and straight lines (a box of zero
  width or height) **are not drawn**. With `userSpaceOnUse` the gradient is mapped to the
  0–24 space of lucide's `viewBox`, the same for the whole icon. The
  end points `x1/y1/x2/y2` reproduce the 137.84° angle and the `offset` values the
  26.31 % / 93.75 % positions of `--gradient-accent`.
- The `<svg>` of `AccentGradientDefs` is invisible by size
  (`width="0" height="0"`, `position: absolute`), **never with
  `display: none`**: some browsers do not resolve `url(#…)` references to
  definitions inside an SVG that is not rendered.
- Since the stops use custom properties, the gradient **changes on its own with the theme**.
- If `AccentGradientDefs` is not mounted, the stroke is not visible: that is why the tests
  of components that use `tone="gradient"` also mount `AccentGradientDefs`,
  and AppLayout has a test that verifies it exists only once.

## Styles and tokens

**Size: through CSS only.** The `width`/`height` attributes of an SVG do not accept
`var()`, so the size is **not** a prop:

```css
.icon {
  width: var(--icon-size, var(--size-icon));
  height: var(--icon-size, var(--size-icon));
  flex-shrink: 0;
}
```

- By default it measures `--size-icon` (1.125rem).
- For another size, **the parent passes a `className` to the `Icon`** and sets
  `--icon-size` in that class (it applies on the `<svg>` itself). E.g. in
  ServiceCard: `<Icon name="code" tone="gradient" className={styles.glyph} />`
  with `.glyph { --icon-size: var(--size-service-icon); }`.
- `--icon-size` is registered with `@property … { inherits: false }` in
  `tokens/tokens.css`: setting it on a container **has no effect** on the
  icons inside (so it does not leak into nested icons).
  The CSS wins over the `width`/`height` attributes lucide sets by default.
- `stroke-width` 2 (lucide's default).
- `tone` is applied through **classes of the CSS Module** (e.g. `.toneAccent { color: var(--color-accent); }`; `current` adds no class), with no inline styles. `gradient` is not a color: it uses the `stroke` attribute with the gradient's url.

## States

No states of its own (it is not interactive). The color on hover/focus is inherited from
the control that contains it (`tone="current"`).

## Responsive

No `@media` of its own. If a size must change by breakpoint, the token
assigned to `--icon-size` is the one that scales (its `@media` blocks live in
`tokens/tokens.css`, following the general rule of `docs/tokens/breakpoints.md`).

## Accessibility

- Without `label`: `aria-hidden="true"`; with `label`: `role="img"` and `aria-label={label}`.
- An empty-string `label` is treated as **decorative** (the same as not passing it: `aria-label=""` produces no accessible name).
- `focusable="false"` always (RF-7).
- `tone="gradient"` with `label` is a valid combination: the gradient decorates
  the stroke (exempt from a contrast pair, see `docs/tokens/contrast.md`) and the
  accessible name comes from `aria-label`.

## Expected tests

- Renders an svg for each `IconName` (a parametrized test over the full list).
- The `<svg>` carries `focusable="false"` (with and without `label`; RF-7).
- Without `label`: `aria-hidden="true"`; it does not show up in `getByRole("img")`.
- With `label`: `getByRole("img", { name: label })`.
- `tone="gradient"` → attribute `stroke="url(#accent-gradient)"`.
- The received `className` is joined to the base class `.icon` on the `<svg>` itself (class assertion with the phase's CSS Modules criterion). The visual size is controlled by `--icon-size`: jsdom computes no styles, it is verified in visual QA.
- `AccentGradientDefs` renders a `linearGradient` with id `accent-gradient`, `gradientUnits="userSpaceOnUse"` and 2 stops (`offset` 0.2631 and 0.9375) **with no `style` attribute** (the color goes through a class).
- `expectNoA11yViolations` with no violations (with and without label).

## Do not

- Do not import lucide in other components: always through `Icon`.
- Do not use lucide's brand icons (they were removed); for social networks, `BrandIcon`.
- Do not hardcode colors in the `<stop>` elements.
