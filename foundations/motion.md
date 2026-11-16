# Motion

Motion is subtle and functional: color and opacity transitions on
hover/focus, and an entry animation in the dialog. There are no scroll
animations, parallax, preloader or autoplay.

## Tokens

Approved scale (#106; applied in `c2befd1`, contract pinned by the
Foundation T17 test).

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 0.15s | Micro-feedback (button press) |
| `--duration-base` | 0.2s | Micro-interactions: hover, focus, tab change, chevron, dialog, bullet (previously 0.3s) |
| `--duration-slow` | 0.3s | Content/layout entering (previously 0.6s; no current uses) |
| `--duration-exit` | 0.22s | Content/layout leaving (~73 % of slow) |
| `--duration-stagger` | 0.03s | Stagger step between items (max. 4 steps; consumed by Change 3) |
| `--ease-standard` | ease-in-out | Default (reversible hover/focus) |
| `--ease-emphasized` | cubic-bezier(0.455, 0.03, 0.515, 0.955) | Width of the carousel's active bullet |
| `--ease-enter` | cubic-bezier(0.22, 1, 0.36, 1) | Entries (tabs of Change 2, dialog) |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Exits |

## Catalog

| What | Properties | Duration |
|---|---|---|
| Hover/focus of links, tabs, social links | `color`, `opacity`, `text-decoration-color` (tab underline) | base |
| Button hover | `opacity` (→ 0.9), `box-shadow` (→ none) | base |
| Press of Button / controls | `transform: translateY(1px)` | fast |
| TestimonialCard hover | `box-shadow` (→ `--shadow-control`) | base |
| "Show Contacts" chevron (Sidebar) | `transform: rotate(180deg)` when expanding | base |
| Carousel's active bullet | `width` 10px → 20px (the background changes with no transition: a gradient cannot be animated) | base + emphasized |
| Opening TestimonialDialog | `opacity` 0 → 1, `transform: scale(0.96)` → 1 | base |
| Expanding the Sidebar contacts (< xl) | No height animation; it appears/disappears | — |
| Theme change | No transition: `data-theme-switching` on `<html>` during the change (see Rules) | — |

## Rules

- Transition **concrete properties**, never `transition: all`.
- **Permanent rule (#116):** no `transition` that **produces animation**
  in a selector of specificity (0,2,0) or higher; `transition: none` is
  **excluded** — it is the suppression itself, not an animation. With this the
  theme-change suppression (`:root[data-theme-switching] *`, (0,2,0))
  wins **without `!important`** today and always. The reviewer verifies it on every
  delivery/Change.
- Do not animate layout `height` or `width`, nor `top/left` (except the bullet, which is small
  and isolated). Prefer `transform` and `opacity`. **The only height exception
  (#106/C3, in force since Change 3 of the Sidebar):** `grid-template-rows:
  0fr ↔ 1fr` with a wrapper `min-height: 0; overflow: hidden` — no `height: auto`
  and no JS measuring.
- **Theme change with no transitions (RF-9, T16):** `ThemeProvider` applies
  `data-theme-switching` + `data-theme` + meta `theme-color` in a single
  `useLayoutEffect`; the attribute goes on `<html>` **before** the new theme and is
  removed after two `requestAnimationFrame` calls (cleanup on unmount and on a new change;
  the initial mount does not apply it). In `global.css`,
  `:root[data-theme-switching] *` + `::before`/`::after` set
  `transition: none` without `!important` (specificity (0,2,0)).
- **`prefers-reduced-motion: reduce`**: `tokens.css` takes the **five**
  durations to 0.01ms; since the stagger delays are derived from
  `--duration-stagger`, they are cancelled too (no fades or staggering).
  Any `scroll-behavior: smooth` must go inside
  `@media (prefers-reduced-motion: no-preference)`.
- The theme change does not animate: when toggling, colors change in the same frame.
