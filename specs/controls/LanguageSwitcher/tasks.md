# Tasks — LanguageSwitcher

- [x] **T1. Group with options per `LOCALES`.** RF-1, RF-4 — ce164bc
  - Done when: `getByRole("group", { name: label })` with two buttons in the order of `LOCALES`, `textContent` "EN"/"ES", `aria-label` "English"/"Español" and its own `lang` on each button (tests); green after `feat(LanguageSwitcher): T1`.

- [x] **T2. Active state, `setLocale` and guard.** RF-2, RF-3, RF-5 — 4aa9918
  - Done when: the button of the active language (seeded through `document.documentElement.lang`) has `aria-pressed="true"`; a click on the other one switches `aria-pressed` and calls `setLocale(next)` (spied mock); a click on the active one does **not** call `setLocale` (RF-3 guard); Tab focuses both buttons in order (RF-5); green after `feat(LanguageSwitcher): T2`.

- [x] **T3. Token-based styles and a11y closing case.** RF-6 — ea17cbf
  - Done when: the module sets the group (`inline-flex`, `--size-control`, `0.1875rem` padding, `gap 0.125rem`, background `--color-surface-raised`, border, `--radius-12`, `--shadow-control`), the button (`2.25rem` min-width, `--radius-8`, `--font-size-small`, `--color-text` → hover `--color-accent-text`), the active one (`--gradient-accent` + `--color-on-accent`), press with `transition: transform var(--duration-fast) var(--ease-standard)`, the focus-visible ring, zero `@media` (inspection); the file ends with `expectNoA11yViolations` (active in en and in es); `index.ts` re-exports `LanguageSwitcher` and types; lint + typecheck + test green after `feat(LanguageSwitcher): T3`.
