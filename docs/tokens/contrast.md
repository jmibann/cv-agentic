# Contrast (WCAG 2.2)

Thresholds: **AA normal text ≥ 4.5:1**, AA large text (≥ 24px, or ≥ 18.66px in bold) ≥ 3:1,
UI components and graphics that convey information ≥ 3:1.

Values computed with WCAG's relative luminance formula on the
tokens of `tokens.css`.

## Text on surfaces

| Text → / Background ↓ | `bg` | `surface` | `surface-muted` | `surface-raised` |
|---|---|---|---|---|
| **Light** `heading` / `text` `#3b4b5e` | 7.69 ✅ | 8.92 ✅ | 8.31 ✅ | 8.31 ✅ |
| **Light** `text-muted` `#637085` | **4.32 ⚠️** | 5.02 ✅ | 4.67 ✅ | 4.67 ✅ |
| **Light** `accent-text` `#304cfd` | 5.06 ✅ | 5.87 ✅ | 5.47 ✅ | 5.47 ✅ |
| **Dark** `heading` `#ffffff` | 18.24 ✅ | 16.11 ✅ | 17.38 ✅ | 14.17 ✅ |
| **Dark** `text` `#e8e8e8` | 14.88 ✅ | 13.15 ✅ | 14.18 ✅ | 11.57 ✅ |
| **Dark** `text-muted` `#9e9e9e` | 6.81 ✅ | 6.01 ✅ | 6.49 ✅ | 5.29 ✅ |
| **Dark** `accent-text` `#fadd7f` | 13.65 ✅ | 12.06 ✅ | 13.00 ✅ | 10.60 ✅ |

### Derived pairs (opacity)

| Use | Pair | Contrast |
|---|---|---|
| Inactive NavTabs tab (`--color-text` at 80% opacity) | light on `surface-raised` | 4.92 ✅ |
| Inactive NavTabs tab (`--color-text` at 80% opacity) | dark on `surface-raised` | 7.96 ✅ |
| Button on hover (whole element at 90%, on `surface`) | light: `on-accent` on the start / end of the gradient | 4.92 ✅ / 5.75 ✅ |
| Button on hover (whole element at 90%, on `surface`) | dark: `on-accent` on the start / end of the gradient | 11.19 ✅ / 9.20 ✅ |
| Disabled Button (50%) | both themes | **Exempt**: WCAG 1.4.3 does not require contrast for inactive components. The disabled state must also be conveyed by `disabled` (native) and `cursor: not-allowed` |

Any other use of `opacity` on informative text or icons must
add its row here with the computed value.

### Informative icons (WCAG 1.4.11, minimum 3:1)

| Use | Light | Dark |
|---|---|---|
| Sidebar social icons (`--color-text-muted` on `surface`) | 5.02 ✅ | 6.01 ✅ |
| Social icons on hover/focus (`--color-accent-text` on `surface`) | 5.87 ✅ | 12.06 ✅ |

## Text on accent

| Pair | Contrast |
|---|---|
| Light: `on-accent` `#fff` on `#304cfd` (start of the gradient) | 5.87 ✅ |
| Light: `on-accent` `#fff` on `#2640eb` (end of the gradient) | 6.96 ✅ |
| Dark: `on-accent` `#151517` on `#fadd7f` | 13.65 ✅ |
| Dark: `on-accent` `#151517` on `#f6c16f` | 11.09 ✅ |
| Dark: **white** on `#fadd7f` (forbidden) | 1.34 ❌ |

## Lines and decoration

| Pair | Contrast | Allowed use |
|---|---|---|
| Light: `track`/`border` `#e3e5e8` on `surface` | 1.26 | Decorative only |
| Dark: `track`/`border` `#2f2f30` on `surface` | 1.20 | Decorative only |
| Dark: `surface-raised` on `surface` | 1.14 | Only with a 1px `--color-border` border |
| Timeline dot (`accent`) on `surface` | 5.87 light / 12.06 dark | ✅ |

## Rules that follow

1. **`--color-text-muted` never goes directly on `--color-bg`** in light (4.32:1).
   Everything that sits on the page background (ControlsBar) uses `--color-text`.
2. **Text on `--gradient-accent` or `--color-accent` always uses `--color-on-accent`**,
   never a fixed white: in dark the accent is gold and white is unreadable.
3. **`--color-track` and `--color-border` are decorative.** No state
   (active, selected, error) may be conveyed with them alone. The carousel
   bullets mark the active one by **size** (10px → 20px) as well as color.
4. **`--color-surface-raised` always carries a 1px border** (`--color-border`);
   without it the CornerTab cannot be told apart from the card in dark.
5. Focus ring: always
   `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);`
   (2px / 2px). The color is the solid accent: against `surface` it gives 5.87:1 in light and
   12.06:1 in dark (minimum required for focus indicators: 3:1).
6. Icons with a gradient (`IconBox`, testimonial quote) are decorative and
   always come with text; if an icon is the only content of a
   control, the control carries `aria-label`.

## Verification

axe (`expectNoA11yViolations`) runs in jsdom and **does not measure contrast** (jsdom computes no
styles). Contrast is guaranteed by design: components only use
the pairs of this table. In visual QA the reviewer checks those pairs in both
themes (and runs axe in a real browser if one is available). If a new color
token is added, **its row is added here** with the computed value.
