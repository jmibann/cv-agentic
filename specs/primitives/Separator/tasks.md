# Tareas — Separator

- [x] **T1. Raíz decorativa.** RF-1, RF-2 — 1a1c8bd
  - Hecho cuando: renderiza un `<div>` con `aria-hidden="true"`;
    `queryByRole("separator")` es `null` y no hay `<hr>` en el DOM; verde tras
    `feat(Separator): T1`.

- [x] **T2. Línea + full-bleed + margen por tokens.** RF-3, RF-4, RF-5 — 05dd5b0
  - Hecho cuando: el módulo declara alto 1px, `background-color:
    var(--color-track)`, `margin-inline: calc(var(--box-padding) * -1)` +
    `width: calc(100% + var(--box-padding) * 2)` y
    `margin-block: var(--separator-gap)` (ambos lados), sin `@media` propios
    (inspección); `className` se une al raíz (P2); verde tras
    `feat(Separator): T2`.

- [x] **T3. Cierre a11y.** — RF-1, RF-2 — 7c3af0c
  - Hecho cuando: el archivo termina con `expectNoA11yViolations` (dentro de un
    `Box outer` de armazón si hace falta para el escenario); lint + typecheck +
    test verdes tras `feat(Separator): T3`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `Separator` (el plan lo
    lista y las tareas no lo cubrían; gap detectado en el review de Icon T1).