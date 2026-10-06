# Tareas — ResumeSection

- [ ] **T1. Sección nombrada con SectionTitle + Timeline.** RF-1, RF-2, RF-3, RF-5
  - Hecho cuando: `getByRole("region", { name: title })` (nombre vía `aria-labelledby="resume-${id}-title"`); contiene `heading` nivel 2 con el título y su `IconBox` decorativo (armazón `AccentGradientDefs`) y un `list` con `listitem` × n; heading de ítem nivel 3 dentro de la región; `entries=[]` → `container` vacío; dos secciones con `id` distintos no duplican ids; el `timelineIdPrefix` recibido llega al Timeline (ids de ítems con la fórmula); verde tras `feat(ResumeSection): T1`.

- [ ] **T2. Estilos (columna sin gaps extra) y cierre a11y.** RF-4
  - Hecho cuando: el módulo declara solo `display: flex; flex-direction: column;` (sin gap, sin margen extra, cero `@media` — inspección); el archivo termina con `expectNoA11yViolations`; `index.ts` re-exporta `ResumeSection` y tipos; lint + typecheck + test verdes tras `feat(ResumeSection): T2`.
