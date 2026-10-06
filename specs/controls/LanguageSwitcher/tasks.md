# Tareas — LanguageSwitcher

- [ ] **T1. Grupo con opciones por `LOCALES`.** RF-1, RF-4
  - Hecho cuando: `getByRole("group", { name: label })` con dos botones en el orden de `LOCALES`, `textContent` "EN"/"ES", `aria-label` "English"/"Español" y `lang` propio en cada botón (tests); verde tras `feat(LanguageSwitcher): T1`.

- [ ] **T2. Estado activo, `setLocale` y guard.** RF-2, RF-3, RF-5
  - Hecho cuando: el botón del idioma activo (sembrado vía `document.documentElement.lang`) tiene `aria-pressed="true"`; click en el otro conmuta `aria-pressed` y llama `setLocale(next)` (mock espiado); click en el activo **no** llama `setLocale` (guard RF-3); Tab enfoca ambos botones en orden (RF-5); verde tras `feat(LanguageSwitcher): T2`.

- [ ] **T3. Estilos por tokens y cierre a11y.** RF-6
  - Hecho cuando: el módulo fija grupo (`inline-flex`, `--size-control`, `0.1875rem` padding, `gap 0.125rem`, fondo `--color-surface-raised`, borde, `--radius-12`, `--shadow-control`), botón (`2.25rem` min-width, `--radius-8`, `--font-size-small`, `--color-text` → hover `--color-accent-text`), activo (`--gradient-accent` + `--color-on-accent`), press con `transition: transform var(--duration-fast) var(--ease-standard)`, anillo focus-visible, cero `@media` (inspección); archivo termina con `expectNoA11yViolations` (activo en en y en es); `index.ts` re-exporta `LanguageSwitcher` y tipos; lint + typecheck + test verdes tras `feat(LanguageSwitcher): T3`.
