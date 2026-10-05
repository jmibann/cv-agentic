# Tareas — IconBox

- [ ] **T1. Estructura: `<span>` con `Icon tone="gradient"` centrado.** RF-1
  - Hecho cuando: el test (con `AccentGradientDefs` de armazón) encuentra un
    `svg` con `stroke="url(#accent-gradient)"`; el IconBox no renderiza defs
    propias (un solo `#accent-gradient` en el DOM del test); verde tras
    `feat(IconBox): T1`.

- [ ] **T2. Raíz decorativa + `className`.** RF-2
  - Hecho cuando: el `<span>` raíz tiene `aria-hidden="true"`; la `className`
    externa queda unida a la clase base del raíz (P2); verde tras
    `feat(IconBox): T2`.

- [ ] **T3. Estilos por tokens y cierre a11y.** RF-3, RF-4, RF-5
  - Hecho cuando: el módulo fija cuadrado `--size-icon-box`, fondo
    `--color-surface-muted`, `--radius-12`, `inline-flex` centrado y
    `flex-shrink: 0`, sin margen propio, sin `@media`, sin
    `:hover`/`:focus`/transiciones (inspección); archivo termina con
    `expectNoA11yViolations`; lint + typecheck + test verdes tras
    `feat(IconBox): T3`.