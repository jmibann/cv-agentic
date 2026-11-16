# Tasks — ThemeToggle

- [x] **T1. Render wired to `useTheme()` (requires Foundation T12).** RF-1, RF-2, RF-3, RF-6 — 79ffa1f
  - Done when: `<button>` with `aria-pressed` according to `theme`, label `darkModeLabel` in light / `lightModeLabel` in dark, icon `lucide-moon` in light and `lucide-sun` in dark, and click → `toggleTheme()` (integration: `dataset.theme` + storage change); the component does not reference `localStorage` or `document.documentElement` (inspection); green after `feat(ThemeToggle): T1`.

- [x] **T2. Native keyboard.** RF-4 — 2a094ed (a single `test` commit, green on arrival declared #101; no `feat` because there is no new behavior to implement)
  - Done when: focus with Tab + Space toggles (test with `user-event`); no `onKeyDown` handlers of its own (inspection: Enter/Space native to the `<button>`); green on arrival where the scope does not discriminate, declared per #101; green after the corresponding commit.

- [x] **T3. Token-based styles and a11y closing case.** RF-4 (ring), RF-5 — bb623b5
  - Done when: the module sets a `--size-control` square, `--color-surface-raised`, border `1px solid var(--color-border)`, `--radius-12`, `--shadow-control`, color `--color-text` → hover `--color-accent-text`, the standard `focus-visible` ring, `transform: translateY(1px)` on active with `transition: transform var(--duration-fast) var(--ease-standard)`, zero `@media`, zero gradient on the background (inspection); the file ends with `expectNoA11yViolations` (light and dark); `index.ts` re-exports `ThemeToggle` and types; lint + typecheck + test green after `feat(ThemeToggle): T3`.
