# HexAvatar
Status: implemented

## Purpose

An avatar shaped as a **vertical hexagon with rounded corners**, with an
outline in the surface color and a shadow. It is the **only** implementation
of that shape: `TestimonialCard` and `TestimonialDialog` use it.

## Requirements (EARS)

- RF-1: WHEN the component receives `src`, THEN THE SYSTEM renders an `<img>` clipped to the inner hexagon.
- RF-2: WHILE no `alt` is passed, THE SYSTEM treats the image as decorative (`alt=""`); IF `alt` is passed, THEN that text becomes the accessible name.
- RF-3: THE SYSTEM applies two different `clipPath`s (`hex-avatar-outer` and `hex-avatar-inner`, geometry in "Shape") defined in `HexAvatarDefs`, exported by this module; AppLayout guarantees the single mount in the app (RF-6 of its spec).
- RF-4: THE SYSTEM applies the shadow with `filter: drop-shadow` on the root container, never with `box-shadow` (CSS inspection: jsdom does not compute `filter`).
- RF-5: THE SYSTEM keeps the size fixed at every breakpoint and exposes no interactive states (inspection + axe).

## Anatomy

```html
<span class="wrap">                 <!-- drop-shadow (respects the clip) -->
  <span class="border">             <!-- outer hexagon, outline color -->
    <img class="image" src alt="" /> <!-- inner hexagon, clips the photo -->
  </span>
</span>
```

## API

```ts
export interface HexAvatarProps {
  src: string;
  /** Default "". In card and dialog the name is next to it: the image is decorative. */
  alt?: string;
  /** Joined to the base class of the `wrap` (root element). */
  className?: string;
}
```

## Styles and tokens

| Part | Value |
|---|---|
| Wrap | `display: inline-block; width: fit-content; filter: var(--filter-avatar-drop);` |
| Outline | `width: var(--size-testimonial-avatar-w); height: var(--size-testimonial-avatar-h); background: var(--color-surface);` clipped with `clip-path: url(#hex-avatar-outer)` |
| Image | `position: relative; top: 0.25rem; left: 0.25rem; width: calc(var(--size-testimonial-avatar-w) - 0.5rem); height: calc(var(--size-testimonial-avatar-h) - 0.5rem); object-fit: cover; background: var(--color-track);` clipped with `clip-path: url(#hex-avatar-inner)` |

### Shape

- A **vertical** hexagon (point at the top and at the bottom) in an 80 × 88 box, with rounded corners.
- **Fixed geometry (not left to the builder's judgment)**; coordinates normalized for `clipPathUnits="objectBoundingBox"`:

| clipPath | Box | Vertices (px) | Normalized (x, y) |
|---|---|---|---|
| `hex-avatar-outer` | 80 × 88 | (40,0) (80,22) (80,66) (40,88) (0,66) (0,22) | (0.5,0) (1,0.25) (1,0.75) (0.5,1) (0,0.75) (0,0.25) |
| `hex-avatar-inner` | 72 × 80 (its own box) | (36,0.57) (72,20.37) (72,59.63) (36,79.43) (0,59.63) (0,20.37) | (0.5,0.0071) (1,0.2546) (1,0.7454) (0.5,0.9929) (0,0.7454) (0,0.2546) |

- `hex-avatar-inner` is the **true 4 px geometric inset** of the outer one (each parallel
  side moved 4 px inwards; vertices = intersections), **not a
  scaling**: with a single scaled `clipPath` the border would not be uniform (the
  80:88 and 72:80 proportions differ). The outline ring is 4 px on the
  straight stretches.
- Corner radii: outer 6 px (normalized rx ≈ 0.075 / ry ≈ 0.068);
  inner 2 px (rx ≈ 0.028 / ry = 0.025) — the radius of the inner path is the
  one that results from the inset, not a free value.
- The agent writes the final `d` of both paths from these data and documents it
  in a comment (it does not copy the `clip-path` of the reference theme).
- Both `clipPath`s live in `HexAvatarDefs`, exported from this module; mounting
  it next to `AccentGradientDefs` in AppLayout and the uniqueness of the mount are
  AppLayout's responsibility (RF-6 of its spec).
- The `<svg>` of `HexAvatarDefs` is invisible by size
  (`width="0" height="0"`, `position: absolute`), **never with
  `display: none`**. The tests of components that use HexAvatar also
  mount `HexAvatarDefs`.
- **Safari:** `-webkit-clip-path` is **not** added for now. The F5 visual QA
  verifies `clip-path: url(#…)` on HTML in Safari; if it fails, the user decides
  the fallback (prefix or an SVG per avatar).
- The shadow goes on the wrap with `filter: drop-shadow` because `box-shadow` does not
  respect the clip.

## States

Not interactive. No error state defined: if the image fails or is
transparent the `--color-track` background of the `<img>` stays visible as a placeholder
(there is no `onError`; not testable in jsdom).

## Responsive

Fixed size at every breakpoint (the positioning is decided by whoever uses it).

## Accessibility

- `alt` empty by default: decorative. If a future use shows it without the
  name next to it, it must pass a descriptive `alt`.

## Expected tests

1. Renders an `img` with the received `src`.
2. Without `alt` → `alt=""` (the image does not show up in `getByRole("img")`).
3. With `alt="Foto de X"` → `getByRole("img", { name: "Foto de X" })`.
4. Concatenates `className` on the root `wrap` (an RF implicit in the API; assertion with the phase's CSS Modules criterion).
5. Outline and image carry their module classes (class assertion). That each one references `url(#hex-avatar-outer)` / `url(#hex-avatar-inner)` is verified by **inspection of the `.module.css`** (jsdom does not apply `clip-path`).
6. `HexAvatarDefs` renders two `clipPath`s with ids `hex-avatar-outer` and `hex-avatar-inner`.
7. `expectNoA11yViolations` with no violations.

## Do not

- Do not reimplement the hexagon in TestimonialCard or TestimonialDialog.
- Do not use `box-shadow` for the shadow.
