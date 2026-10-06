# Tareas — SectionTitle

- [x] **T1. Headings por nivel con `id`.** RF-1, RF-4 — ec409cf
  - Hecho cuando: `as="h1| h2| h3"` renderiza `getByRole("heading", { level,
    name })` y `id` llega al heading; verde tras `feat(SectionTitle): T1`.

- [ ] **T2. Tamaño por nivel desde el módulo.** RF-1
  - Hecho cuando: cada nivel aplica su clase `.h1/.h2/.h3` (P2) con
    `font-size: var(--font-size-h1/2/3)` (inspección: sin literales de px);
    verde tras `feat(SectionTitle): T2`.

- [ ] **T3. `decorated`: barra `::after`.** RF-2
  - Hecho cuando: la clase `decorated` aplica `position: relative` + `::after`
    con `--gradient-accent`, `--size-title-bar-*`, `bottom:
    calc(var(--title-bar-offset) * -1)` y **sin contenido textual**
    (`content: ""`; inspección); el nombre accesible no cambia (test); verde tras
    `feat(SectionTitle): T3`.

- [ ] **T4. `icon` (IconBox en el heading) y combinación decorated+icon.** RF-3
  - Hecho cuando: con `icon` el heading renderiza `IconBox` y su nombre
    accesible sigue siendo solo el texto; `decorated` + `icon` juntos conserva
    ambos tratamientos (clase decorated **y** IconBox presentes); el flex va en
    el propio heading sin wrapper (inspección); verde tras `feat(SectionTitle): T4`.

- [ ] **T5. `className`, márgenes y cierre a11y.** RF-5, RF-6
  - Hecho cuando: `className` unida al heading raíz (P2); `margin-bottom` según
    RF-5 — h1 solo con `decorated` usa `--title-decorated-gap`, h2 `1.25rem`,
    h3 `0.5rem`, h1 sin decorar no declara margen propio (inspección); cero
    `@media` propios; archivo termina con `expectNoA11yViolations`; lint +
    typecheck + test verdes tras `feat(SectionTitle): T5`.
  - Nota para el cierre de pieza: `index.ts` re-exporta `SectionTitle` y tipos
    (el plan lo lista y las tareas no lo cubrían; gap detectado en el review de Icon T1).