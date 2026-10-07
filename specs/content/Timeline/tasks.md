# Tareas — Timeline

- [x] **T1. Estructura: `<ol role=\"list\">` por entrada.** RF-1, RF-2, RF-5 — 581ffb0 (menores para r-completa: `<li>` sin clase `item` → T3; rama truthy org/desc con fixture `""` imposible post-validación)
  - Hecho cuando: `getByRole("list")` con un `listitem` por entrada en orden; cada `<article aria-labelledby>` apunta a su `<h3>` con id `${idPrefix}-${entry.id}-title` y heading nivel 3 con el título; muestra `organization` y `description` si existen; `entries=[]` → `container` vacío; verde tras `feat(Timeline): T1`.

- [x] **T2. Período con `<time>` por extremo (requiere Foundation T12).** RF-3, RF-4 — 4ef038c
  - Hecho cuando: rango → dos `<time>` con `dateTime` igual a cada valor crudo y texto formateado por `formatPeriodEndpoint` según `locale` (en/es, test 5–6); `end: null` → un `<time>` + `presentLabel` como texto; sin strings compuestas parseadas (inspección: usa la función); verde tras `feat(Timeline): T2`.

- [x] **T3. Estilos por tokens y cierre a11y.** RF-6, RF-7 — dc4d7b9 (F5: geometría punto↔línea↔título, halo en oscuro, `:last-child` con `end: null` en el medio)
  - Hecho cuando: el módulo declara ítem (`position: relative`, `border-left: var(--timeline-line-width) solid var(--color-track)`, padding con `--timeline-indent`), punto `::before` centrado (`--size-timeline-dot`, `--timeline-dot-ring`, `--color-accent`, `top: var(--timeline-dot-top)`), `:last-child` con `border-left-color: transparent` y `padding-bottom: 0` (inspección), título con `--font-size-h4` y `top: calc(var(--timeline-title-shift) * -1)` (el token debe existir en `tokens/tokens.css` — T12/usuario), `margin/padding` de lista/ítem según tabla, cero `@media`; el archivo termina con `expectNoA11yViolations`; `index.ts` re-exporta `Timeline` y tipos; lint + typecheck + test verdes tras `feat(Timeline): T3`.
