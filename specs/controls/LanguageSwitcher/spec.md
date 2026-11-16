# LanguageSwitcher
Status: implemented

## Purpose

Choose the site's language (EN / ES). It lives in the ControlsBar, next to the ThemeToggle.

## Requirements (EARS)

- RF-1: THE SYSTEM shows one option for each value of `LOCALES` of `@data/constants`, in that order, with fixed visible text (`EN` / `ES`). Verification: a `getAllByRole("button")` test, in order and with the expected `textContent`.
- RF-2: WHEN the user chooses a language, THEN THE SYSTEM invokes `setLocale()` from the context; changing `document.documentElement.lang` and persisting in `localStorage["cv:locale"]` with `try/catch` are the `LocaleProvider`'s responsibility (G-A: the component does not touch storage or the global DOM). Verification: component+provider integration (the tests wrap `LocaleProvider`) + its own `aria-pressed`.
- RF-3: WHEN the user activates the language that is already active, THEN THE SYSTEM **does not invoke `setLocale()`** (a guard in the component; decision 2=a). Verification: test with a spied `setLocale`.
- RF-4: THE SYSTEM exposes the container as `role="group"` with a translated `aria-label` and each option as a `<button type="button">` with its `aria-label` and its `lang` attribute.
- RF-5: THE SYSTEM exposes both buttons as consecutive tab stops (Tab goes through them); it does not implement the radiogroup pattern. Verification: focus test with Tab + inspection (no radiogroup roles).
- RF-6: THE SYSTEM keeps the size fixed with `--size-control` and declares no `@media` of its own. (Verification: CSS inspection.)

## Anatomy

```
┌────┬────┐
│ EN │ ES │   segmented control: a group with two buttons, with NO divider:
└────┴────┘   the separation is only the `gap: 0.125rem` on the group's background
```

## API

```ts
export interface LanguageSwitcherProps {
  /** Label of the group, already translated. E.g. "Language" / "Idioma". */
  label: string;
  /** Joined to the base class of the root `role="group"` (G-B). */
  className?: string;
}
```

It consumes `useLocale()`. The languages come from `LOCALES` of `@data/constants`, in that
order (`en`, `es`).

Fixed names (not translated):

| locale | Visible text | aria-label | lang |
|---|---|---|---|
| en | EN | English | en |
| es | ES | Español | es |

## Styles and tokens

| Part | Value |
|---|---|
| Group | `display: inline-flex; height: var(--size-control); padding: 0.1875rem; gap: 0.125rem;` background `--color-surface-raised`, border `1px solid var(--color-border)`, radius `--radius-12`, shadow `--shadow-control` |
| Button | `min-width: 2.25rem; padding-inline: var(--space-2);` radius `--radius-8`, `--font-size-small`, `--font-weight-medium`, color `--color-text` |
| Button hover | color `--color-accent-text` |
| Active button (`aria-pressed="true"`) | background `--gradient-accent`, color `--color-on-accent` |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |

## States

| State | Effect |
|---|---|
| Inactive option | color `--color-text`, no background |
| Inactive option hover | color `--color-accent-text` |
| Active option (`aria-pressed="true"`) | background `--gradient-accent`, color `--color-on-accent`; no change on hover |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active (press) | `transform: translateY(1px)` with `transition: transform var(--duration-fast) var(--ease-standard)` (G-E; DESIGN forbids `transition: all`) |

## Responsive

Fixed size at every breakpoint (`--size-control`); no `@media` of its own.

## Accessibility

- Container `role="group"` with `aria-label={label}`.
- Each option is a `<button type="button">` with `aria-pressed`, `aria-label`
  ("English" / "Español") and its own `lang`, so that the reader pronounces it right.
- Clicking the active language does nothing (it stays pressed).
- Tab goes through both buttons (it is not a radiogroup: two plain buttons are more
  predictable with two options).

## Expected tests

- `getByRole("group", { name: label })` with two buttons.
- Order and visible text: `getAllByRole("button")` → `["EN", "ES"]` (textContent, order of `LOCALES`).
- Buttons named "English" and "Español"; the one of the active language has `aria-pressed="true"`.
- Click on the other one → `aria-pressed`, `document.documentElement.lang`
  and `localStorage["cv:locale"]` change (integration with the provider).
- Click on the active one: `setLocale` is **not** invoked again (RF-3 guard, spy).
- Tab goes through both buttons in order (RF-5).
- Each button has its `lang` attribute.
- `expectNoA11yViolations` with no violations.

(The tests wrap with `LocaleProvider` — seeding the initial language through
`document.documentElement.lang` before the render, as the anti-flash does — and
reset `lang` and `localStorage` in `afterEach`.)

## Do not

- Do not implement the radiogroup pattern (arrows, a single tab stop): they are two buttons reached with Tab.
- Do not translate the names of the languages (`EN`/`ES`, "English"/"Español"): they are fixed.
- Do not hardcode the list of languages: it comes from `LOCALES` of `@data/constants`, in that order.
- Do not invoke `setLocale()` when the chosen language is already active (RF-3).
- Do not read or write `localStorage` or touch `document.documentElement.lang` from the component: that belongs to the `LocaleProvider` (G-A); its `try/catch` and the key `cv:locale` apply there.
