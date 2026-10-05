# Tareas — Badge

- [ ] **T1. Render `span` por defecto y `li` con `as`.** RF-1, RF-2
  - Hecho cuando: `getByText` encuentra el texto; el raíz es `span` por defecto
    y `<li>` con `as="li"` (test con `<ul>` de armazón); verde tras
    `feat(Badge): T1`.

- [ ] **T2. `className` unida al raíz.** RF-3
  - Hecho cuando: la clase externa queda junto a la base en el único elemento
    (aserción P2); verde tras `feat(Badge): T2`.

- [ ] **T3. Estilos por tokens, no interactivo y cierre a11y.** RF-4, RF-5, RF-6
  - Hecho cuando: el módulo resuelve fondo `--color-surface-muted`,
    `--radius-8`, `--font-size-badge`, `--line-height-tight`, padding
    `0.5rem 1rem`, `white-space: nowrap`, `inline-flex` (inspección: cero
    literales de color, cero `@media`, cero reglas `:hover`/`:focus`); archivo
    termina con `expectNoA11yViolations` (span y li-en-ul); lint + typecheck +
    test verdes tras `feat(Badge): T3`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `Badge` y tipos (el plan
    lo lista y las tareas no lo cubrían; gap detectado en el review de Icon T1).