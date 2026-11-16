# ThemeToggle
Status: implemented

## Purpose

Switch between the light and the dark theme. It lives in the ControlsBar.

## Requirements (EARS)

- RF-1: WHEN the user activates the button, THEN THE SYSTEM invokes `toggleTheme()` from the context; switching the theme, applying `data-theme` and persisting in `localStorage["cv:theme"]` with `try/catch` are the `ThemeProvider`'s responsibility (G-A: the component does not touch storage or the global DOM). Verification: component+provider integration (the piece's tests wrap `ThemeProvider`).
- RF-2: THE SYSTEM reflects the current theme in the button's `aria-pressed` (`false` in light, `true` in dark); the reflection in `data-theme` of `<html>` is provided by the provider (already verified in `ThemeProvider.test.tsx`; here it is checked only indirectly, through integration).
- RF-3: THE SYSTEM shows the moon in the light theme and the sun in dark, with a translated `aria-label` that **names the mode you go to** (decision 1=a): in light → `darkModeLabel` ("Dark mode"), in dark → `lightModeLabel` ("Light mode"); the label names a mode, never an action ("Activar/Desactivar").
- RF-4: THE SYSTEM operates with Enter and Space (native to the `<button>`) and applies the standard focus ring on `focus-visible`. (Verification: keyboard test + CSS inspection.)
- RF-5: THE SYSTEM keeps the size fixed with `--size-control` and declares no `@media` of its own. (Verification: CSS inspection.)
- RF-6: THE SYSTEM consumes `useTheme()` directly (a documented exception to the rule "props in, events out").

## Anatomy

A single square, icon-only `<button>`: moon in light (go to dark),
sun in dark (go to light).

## API

```ts
export interface ThemeToggleProps {
  /** aria-label in the light theme: names the mode you go to. E.g. "Dark mode" / "Modo oscuro". */
  darkModeLabel: string;
  /** aria-label in the dark theme: names the mode you go to. E.g. "Light mode" / "Modo claro". */
  lightModeLabel: string;
  /** Joined to the base class of the root `<button>` (G-B). */
  className?: string;
}
```

It consumes `useTheme()` (a documented exception to "props in, events out"). The active label is `theme === "light" ? darkModeLabel : lightModeLabel`.
It requires the new i18n key `controls.lightMode` ("Light mode" / "Modo claro") in `src/i18n/ui.{en,es}.ts`
(user decision 1=a; a previous F3 task delegated to `foundation`, owner of i18n/providers after F1, adds it; `ControlsBar` passes both labels).

## Styles and tokens

| Property | Value |
|---|---|
| Size | `--size-control` square (2.5rem) |
| Background | `--color-surface-raised` |
| Border | `1px solid var(--color-border)` |
| Radius | `--radius-12` |
| Shadow | `--shadow-control` |
| Icon | `Icon name="moon" \| "sun"`, `tone="current"`, size `--size-icon` |
| Color | `--color-text`; hover → `--color-accent-text` |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |

## States

| State | Effect |
|---|---|
| Light (`aria-pressed="false"`) | moon icon |
| Dark (`aria-pressed="true"`) | sun icon |
| Hover | color `--color-accent-text` |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active (press) | `transform: translateY(1px)` with `transition: transform var(--duration-fast) var(--ease-standard)` (G-E; DESIGN forbids `transition: all`) |

## Responsive

Fixed size at every breakpoint (`--size-control`); no `@media` of its own.

## Accessibility

**Toggle button** pattern:

- `aria-label` that names the mode you go to (RF-3) + `aria-pressed={theme === "dark"}`.
- The icon is decorative.
- It operates with Enter/Space (native to the `<button>`).

## Expected tests

- `getByRole("button", { name: darkModeLabel })` with `aria-pressed="false"` in light.
- Click → `aria-pressed="true"`, **`aria-label` becomes `lightModeLabel`**, `document.documentElement.dataset.theme === "dark"`,
  `localStorage["cv:theme"] === "dark"` (integration with the provider).
- A second click goes back to light: `aria-pressed="false"`, label `darkModeLabel` again.
- It shows the moon icon in light and the sun one in dark (verify through the
  attribute/class of lucide's svg, e.g. `lucide-moon`; criterion of `Icon`'s contract, which propagates those classes).
- Keyboard: focus with Tab, and Space toggles.
- `expectNoA11yViolations` with no violations.

(The tests wrap with `ThemeProvider` and reset `data-theme` and
`localStorage` in `afterEach`.)

## Do not

- Do not show an action in the `aria-label` ("Activar/Desactivar…"): it names the **mode** you go to (RF-3). The state comes from `aria-pressed`.
- Do not hardcode the labels: they arrive translated through the props.
- Do not read or write `localStorage` or touch `data-theme` from the component: persistence belongs to the `ThemeProvider` (G-A); the `try/catch` and the key `cv:theme` apply there.
- Do not change the size by breakpoint or add `@media` of its own (`--size-control`).
