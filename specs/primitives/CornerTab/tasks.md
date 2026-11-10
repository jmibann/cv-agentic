# Tareas — CornerTab

- [x] **T1. Render base overlay con `children`.** RF-1, RF-6 — e189ed8
  - Hecho cuando: el raíz `<div>` renderiza los `children` y aplica la clase
    base (P2); el raíz no tiene `role` ni ningún atributo `aria-*` (test);
    la clase base fija absolute/top/right/`z-index: var(--z-raised)`
    (inspección); verde tras `feat(CornerTab): T1`.
  - Nota: la unión de `className` externa al raíz (spec → API, plan →
    Interfaz) no estaba repartida en las tareas; se cubre en T1 (gap detectado
    al delegar, mismo tratamiento que la nota de `index.ts`).

- [x] **T2. Variantes `size`.** RF-2 — 79ab04e
  - Hecho cuando: default `md`; `sm` y `md` aplican clases distintas (P2);
    alturas/padding según tabla de la spec (`--size-nav-tab-height` +
    `--corner-tab-padding-inline` / literales fijos 2.75rem y 1.25rem)
    (inspección); verde tras `feat(CornerTab): T2`.

- [x] **T3. `placement="float"` y su `@media`.** RF-3, RF-4 — 1fa4dcd
  - Hecho cuando: `float` aplica su clase (P2) y `overlay` (default) no; el
    único `@media` del módulo es `(min-width: 992px)` con
    `position: relative; z-index: auto; float: right` + márgenes negativos de
    `calc()` sobre `--box-padding` y `margin-left: var(--space-6)` — sin
    literales de tamaño (inspección); verde tras `feat(CornerTab): T3`.

- [x] **T4. Forma (bordes/radio/fondo), visible en pantalla y cierre a11y.** RF-4, RF-5, RF-6 — d12b270
  - Hecho cuando: el módulo pinta siempre `border-left/bottom: 1px solid
    var(--color-border)` sobre `--color-surface-raised` y
    `border-radius: 0 var(--radius-20) 0 var(--radius-32)`, sin sombra; ningún
    `@media print` en el módulo (inspección); archivo termina con
    `expectNoA11yViolations`; lint + typecheck + test verdes tras
    `feat(CornerTab): T4`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `CornerTab` y tipos (el
    plan lo lista y las tareas no lo cubrían; gap detectado en el review de Icon T1).

- [x] **T5. Hook `data-print-hide` en el raíz (Cambio F5 2026-10-08).** RF-7 — 25e2ee4 (APROBADA. Menores registradas: subjects con sufijo descriptivo (patrón F5 era a secas; prefijo parseable intacto, #102 OK); comentarios de test/tsx citan "variante compuesta div[data-print-hide]" cuando global.css usa el selector simple — cosmético, se alinea con AppLayout T7; fin de M-1 queda condicionado a T7 + re-pasada F5)
  - Hecho cuando: el `<div>` raíz renderiza `data-print-hide` junto a sus
    clases, en ambos `placement` (test estructural `toHaveAttribute`); ningún
    otro atributo/aria/estilo cambia; tests previos intactos; la re-pasada F5
    confirma que en print la tab desaparece completa (fin del hallazgo M-1:
    franja vacía con fondo/borde); verde tras `feat(CornerTab): T5`.

- [ ] **T6. `.float` por encima del `h1` posicionado (Cambio 2026-11-10).** RF-3
  - Hecho cuando: en `@media (min-width: 992px)`, `.float` fija
    `z-index: var(--z-raised)` (no `auto`); la inspección del CSS confirma que
    el `h1` posicionado de `SectionTitle.decorated` queda debajo y que el tab
    recibe clicks en su mitad inferior; no se usa `pointer-events: none` en el
    `h1`; tests previos intactos; verde tras `fix(CornerTab): T6`.