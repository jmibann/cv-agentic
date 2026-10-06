# Tareas — ThemeToggle

- [ ] **T1. Render conectado a `useTheme()` (requiere Foundation T12).** RF-1, RF-2, RF-3, RF-6
  - Hecho cuando: `<button>` con `aria-pressed` según `theme`, label `darkModeLabel` en claro / `lightModeLabel` en oscuro, ícono `lucide-moon` en claro y `lucide-sun` en oscuro, y click → `toggleTheme()` (integration: `dataset.theme` + storage cambian); el componente no referencia `localStorage` ni `document.documentElement` (inspección); verde tras `feat(ThemeToggle): T1`.

- [ ] **T2. Teclado nativo.** RF-4
  - Hecho cuando: foco con Tab + Espacio alterna (test con `user-event`); sin handlers propios `onKeyDown` (inspección: Enter/Espacio nativos del `<button>`); verde on-arrival donde el alcance no discrimina, declarado per #101; verde tras el commit correspondiente.

- [ ] **T3. Estilos por tokens y cierre a11y.** RF-4 (anillo), RF-5
  - Hecho cuando: el módulo fija `--size-control` cuadrado, `--color-surface-raised`, borde `1px solid var(--color-border)`, `--radius-12`, `--shadow-control`, color `--color-text` → hover `--color-accent-text`, anillo `focus-visible` estándar, `transform: translateY(1px)` en active con `transition: transform var(--duration-fast) var(--ease-standard)`, cero `@media`, cero gradiente en fondo (inspección); archivo termina con `expectNoA11yViolations` (claro y oscuro); `index.ts` re-exporta `ThemeToggle` y tipos; lint + typecheck + test verdes tras `feat(ThemeToggle): T3`.
