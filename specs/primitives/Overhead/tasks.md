# Tareas — Overhead

- [x] **T1. Render con mayúsculas solo por CSS.** RF-1 — 6a18005
  - Hecho cuando: `getByText("Email")` encuentra el texto **sin transformar**
    en el DOM y el módulo declara `text-transform: uppercase` (inspección);
    verde tras `feat(Overhead): T1`.

- [ ] **T2. `as="dt"` con armazón `<dl>`.** RF-2
  - Hecho cuando: default `span`; `as="dt"` renderiza `<dt>` (el test lo envuelve
    en `<dl>`); `className` queda unida al raíz (P2); verde tras
    `feat(Overhead): T2`.

- [ ] **T3. Estilos (elipsis/muted/tamaño) y cierre a11y.** RF-3, RF-4, RF-5, RF-6
  - Hecho cuando: el módulo declara `display: block` +
    `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` sin
    `max-width` propio, color `--color-text-muted`, tamaño
    `--font-size-overhead`, peso regular, cero `@media`, cero roles/interactividad
    (inspección); archivo termina con `expectNoA11yViolations`; lint +
    typecheck + test verdes tras `feat(Overhead): T3`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `Overhead` y tipos (el
    plan lo lista y las tareas no lo cubrían; gap detectado en el review de Icon T1).