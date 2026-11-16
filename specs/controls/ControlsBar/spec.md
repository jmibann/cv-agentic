# ControlsBar
Status: implemented

## Purpose

A small bar **above the cards, aligned to the right and outside them**,
with the display controls: ThemeToggle and LanguageSwitcher. It takes the
lower part of the `--gutter-top` space and looks the same at every breakpoint.

## Requirements (EARS)

- RF-1: THE SYSTEM renders the bar with `justify-content: flex-end`, height `--size-control` and the controls aligned to the right, **outside the cards**; the vertical position within the `--gutter-top` space and the width of the `<header>` (full-width) are defined by AppLayout (table → Vertical position). Verification: inspection of the piece's CSS; page layout in F4/F5.
- RF-2: THE SYSTEM exposes a `<header>` landmark (banner) with a named group inside; the **page uniqueness** of the banner is AppLayout's responsibility (no other `<header>`) and the reviewer verifies it in F4/F5.
- RF-3: WHEN the interface language changes, THEN THE SYSTEM updates the translated labels of ThemeToggle and LanguageSwitcher.
- RF-4: ControlsBar must be among the first things in the tab order, right after the skip link: a **page-level usage restriction** — AppLayout (its spec) guarantees the DOM order; it is not verifiable in ControlsBar's unit (the piece does not know the skip link). The reviewer verifies it in F4.
- RF-5: THE SYSTEM declares in its module no text color on `--color-bg` and does not use `--color-text-muted` (the piece renders no text of its own; the text it shows comes from its children, which bring their own tokens). Verification: CSS inspection.
- RF-6: THE SYSTEM looks the same at every breakpoint: only the `gap` scales, with a token and no `@media` of its own. Verification: CSS inspection. In **print** it is hidden by the `data-*` contract (G-D; F5 Change 2026-10-08): the root `<header>` renders **`data-print-hide`** — `global.css` hides it with `[data-print-hide]` because the native `header` selector lost on specificity against the module's class (finding B-2 of `docs/qa-report.md`). The piece declares no `@media print`.

## Anatomy

```
                                              [☾]  [EN|ES]
┌──────────── cards ────────────────────────────────────────┐
```

```html
<header class="controlsBar">
  <div role="group" aria-label={t.controls.label}>
    <ThemeToggle darkModeLabel={t.controls.darkMode} lightModeLabel={t.controls.lightMode} />
    <LanguageSwitcher label={t.controls.language} />
  </div>
</header>
```

## API

```ts
export interface ControlsBarProps {
  /** Joined to the base class of the root `<header>` (G-B). */
  className?: string;
}
```

It consumes `useLocale()` to pass the translated labels to its children
(`t.controls.label`, `t.controls.language`, and to ThemeToggle
`darkModeLabel={t.controls.darkMode}` + `lightModeLabel={t.controls.lightMode}`
— the key `controls.lightMode` is added as a previous F3 task, see the spec of
ThemeToggle).

## Styles and tokens

| Property | Value |
|---|---|
| Layout | `display: flex; justify-content: flex-end; align-items: center; gap: var(--controls-gap);` (8px < 580 → 12px) |
| Height | `var(--size-control)` |
| Layer | `position: relative; z-index: var(--z-controls);` |
| Vertical position | Defined by AppLayout (see `foundations/layout.md`) |

- It sits on `--color-bg`: any text uses `--color-text` (never
  `--color-text-muted`; see `docs/tokens/contrast.md`). The controls carry their
  own `surface-raised` background, so the inner contrast does not depend on the background.

## States

No states of its own: those of ThemeToggle and LanguageSwitcher.

## Responsive

The same at every size; only the `gap` scales, through a token (`--controls-gap`). No `@media` of its own.

## Accessibility

- Page-level `<header>` landmark (banner); AppLayout guarantees its uniqueness (RF-2).
- A named group ("Display settings" / "Ajustes de visualización").
- Tab order: right after the skip link — AppLayout sets it (RF-4).
- Print: the bar is hidden by the shared styles; no `@media print` of its own (G-D).

## Expected tests

- Renders a `banner` that contains a `group` with a translated name.
- It contains the ThemeToggle and the LanguageSwitcher (by role and name).
- When the language changes to `es`, the labels of the controls change to Spanish.
- The root `<header>` renders `data-print-hide` (F5 Change: hook of the print contract; a simple structural test).
- `expectNoA11yViolations` with no violations.

(The tests wrap with `ThemeProvider` **and** `LocaleProvider` — the children
consume both contexts — and reset `data-theme`, `lang` and `localStorage` in
`afterEach`, as in the sibling specs.)

## Do not

- Do not place it inside the cards: it goes above, to the right and outside them.
- Do not use `--color-text-muted` for text: it sits on `--color-bg` (`docs/tokens/contrast.md`).
- Do not add another `<header>` landmark: the banner is unique on the page (AppLayout).
- Do not add `@media` of its own: only the `gap` scales, through `--controls-gap`; nor `@media print` (the shared styles hide it).
