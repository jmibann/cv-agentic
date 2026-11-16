# BrandIcon
Status: implemented

## Purpose

Social network logos as inline SVG. Lucide no longer includes brand
icons, so this component provides them separately.

## Requirements (EARS)

- RF-1: WHEN the component receives a `network` of `SOCIAL_NETWORKS`, THEN THE SYSTEM renders an `<svg fill="currentColor">` with the `viewBox` of its entry in `paths.ts` (default `0 0 24 24`) and one or more non-empty `path` elements.
- RF-2: THE SYSTEM keeps `BRAND_NAMES` with a non-empty display name for each network of `SOCIAL_NETWORKS`.
- RF-3: THE SYSTEM renders the logo always decorative (`aria-hidden="true"` and `focusable="false"`): the accessible name comes from the wrapping link with `BRAND_NAMES`.
- RF-4: IF a network of `SOCIAL_NETWORKS` does not exist in the installed version of Simple Icons, THEN the brand's official SVG is used as a constant; the builder **reports** the substitution and the orchestrator records it in `docs/BACKLOG.md` (subagents do not write in `docs/`). Verification: coverage check at install time (the reviewer's inspection; not testable at runtime).
- RF-5: THE SYSTEM colors the logo with `currentColor` (monochrome, no gradient or distortion) and sizes it through CSS only via `--icon-size` (CSS inspection; not testable in jsdom).
- RF-6: THE SYSTEM scales the logo through the token `--size-social-icon`; BrandIcon declares no `@media` of its own (CSS inspection).

## Source of the paths

- **Simple Icons** (CC0 license): the `simple-icons` package, importing only the
  icons needed (`import { siGithub, siX, … } from "simple-icons"`), which
  expose `path` and `title` for a `viewBox="0 0 24 24"`.
- **Verify at install time** that each network of `SOCIAL_NETWORKS` (`@data/constants`) exists in the
  installed version. Simple Icons removes brands at their owners' request (LinkedIn
  is a known case). For a missing network: the official SVG from the brand's
  press kit, stored as a constant in `BrandIcon/paths.ts` with a provenance
  comment (recording is the orchestrator's job, through the builder's report).
- **Structure of `paths.ts`**: per network, `{ viewBox: string; d: string | string[] }`.
  An official SVG that is not a 24×24 square **keeps its viewBox**: it is not
  distorted or cropped; it may bring several paths.
- Respect the brand guidelines: the logo is not distorted or recolored with
  gradients; it is used in monochrome with `currentColor`.

## Anatomy

```html
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="…" />   <!-- one or more <path>; the viewBox may be the official logo's own -->
</svg>
```

## API

```ts
import type { SocialNetwork } from "@data/cv.types.generated";

export interface BrandIconProps {
  network: SocialNetwork;
  /** JOINED to the base class of the root `<svg>` (it does not replace it). */
  className?: string;
}

/** Display name of each network, for aria-labels. Literal values defined
    in this spec/code ("GitHub", "LinkedIn", "X"…), NOT derived from the `title`
    of simple-icons. */
export const BRAND_NAMES: Record<SocialNetwork, string>;
```

## Styles and tokens

- `<svg viewBox="0 0 24 24" fill="currentColor">`.
- **Size through CSS only**, with the same mechanism as `Icon`:
  `width/height: var(--icon-size, var(--size-social-icon));`. The default
  `--size-social-icon` already scales (16px < 580 → 18px). For another size, the
  parent passes a `className` to the `BrandIcon` that sets `--icon-size` (registered
  as non-inheriting: on a container it has no effect). There is no `size` prop (SVG
  attributes do not accept `var()`).
- Color inherited from the parent link: BrandIcon uses plain `currentColor`, with no
  opacity or color of its own; the base color and the hover are set by the Sidebar (its spec).

## States

No states of its own; it inherits the link's color.

## Responsive

No `@media` of its own: the size scales through the token `--size-social-icon`.

## Accessibility

- Always decorative: `aria-hidden="true"`, `focusable="false"`. The accessible
  name is set by the link that contains it (`aria-label={BRAND_NAMES[network]}`).

## Expected tests

- Renders an `svg` with at least one non-empty `path` for **each** value of `SOCIAL_NETWORKS`.
- `fill="currentColor"`, `aria-hidden="true"` and `focusable="false"`.
- `BRAND_NAMES` has an entry for each network (the `Record` type guarantees it; the test
  verifies that no value is an empty string).
- `expectNoA11yViolations` with no violations.

## Do not

- Do not use generic icons (Link/Globe) as a silent substitute: if a
  logo is missing, it is documented.
- Do not copy SVGs from the reference theme.
