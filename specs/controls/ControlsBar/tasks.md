# Tareas — ControlsBar

- [x] **T1. Banner con grupo nombrado y controles compuestos (requiere Foundation T12).** RF-2, RF-3 — 695c111
  - Hecho cuando: `getByRole("banner")` contiene un `group` con `aria-label={t.controls.label}` y ambos controles (por rol+nombre); al elegir español, el `group` pasa a "Ajustes de visualización" y ThemeToggle expone sus labels en español (RF-3); verde tras `feat(ControlsBar): T1`.

- [ ] **T2. Estilos por tokens y cierre a11y.** RF-1, RF-5, RF-6
  - Hecho cuando: el módulo fija `display: flex; justify-content: flex-end; align-items: center; height: var(--size-control); gap: var(--controls-gap); position: relative; z-index: var(--z-controls);`, cero declaraciones de texto/color de texto propio, cero `@media` (inspección); el archivo termina con `expectNoA11yViolations`; `index.ts` re-exporta `ControlsBar` (y tipos si los hubiera); lint + typecheck + test verdes tras `feat(ControlsBar): T2`.
