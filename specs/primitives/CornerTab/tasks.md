# Tareas — CornerTab

- [ ] **T1. Render base overlay con `children`.** RF-1, RF-6
  - Hecho cuando: el raíz `<div>` renderiza los `children` y aplica la clase
    base (P2); el raíz no tiene `role` ni ningún atributo `aria-*` (test);
    la clase base fija absolute/top/right/`z-index: var(--z-raised)`
    (inspección); verde tras `feat(CornerTab): T1`.

- [ ] **T2. Variantes `size`.** RF-2
  - Hecho cuando: default `md`; `sm` y `md` aplican clases distintas (P2);
    alturas/padding según tabla de la spec (`--size-nav-tab-height` +
    `--corner-tab-padding-inline` / literales fijos 2.75rem y 1.25rem)
    (inspección); verde tras `feat(CornerTab): T2`.

- [ ] **T3. `placement="float"` y su `@media`.** RF-3, RF-4
  - Hecho cuando: `float` aplica su clase (P2) y `overlay` (default) no; el
    único `@media` del módulo es `(min-width: 992px)` con
    `position: relative; z-index: auto; float: right` + márgenes negativos de
    `calc()` sobre `--box-padding` y `margin-left: var(--space-6)` — sin
    literales de tamaño (inspección); verde tras `feat(CornerTab): T3`.

- [ ] **T4. Forma (bordes/radio/fondo), visible en pantalla y cierre a11y.** RF-4, RF-5, RF-6
  - Hecho cuando: el módulo pinta siempre `border-left/bottom: 1px solid
    var(--color-border)` sobre `--color-surface-raised` y
    `border-radius: 0 var(--radius-20) 0 var(--radius-32)`, sin sombra; ningún
    `@media print` en el módulo (inspección); archivo termina con
    `expectNoA11yViolations`; lint + typecheck + test verdes tras
    `feat(CornerTab): T4`.