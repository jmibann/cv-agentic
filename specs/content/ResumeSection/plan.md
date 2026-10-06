# Plan — ResumeSection

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/ResumeSection/ResumeSection.tsx` | `<section aria-labelledby="resume-${id}-title">` con `SectionTitle as="h2" icon` + `Timeline` (passthrough de `entries/locale/presentLabel/timelineIdPrefix`) | RF-1…RF-5 |
| `src/components/ResumeSection/ResumeSection.module.css` | `display: flex; flex-direction: column;` sin gaps extra, cero `@media` | RF-4 |
| `src/components/ResumeSection/ResumeSection.test.tsx` | tests + cierre a11y | todas |
| `src/components/ResumeSection/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`ResumeSectionProps { id; timelineIdPrefix; title; icon; entries; locale; presentLabel; className? }` (spec → API; G-B: `className` a la `<section>` raíz).

## Decisiones

- Id del título: `resume-${id}-title` (fórmula fija, RF-3); `aria-labelledby` de la sección apunta ahí.
- `timelineIdPrefix` llega **explícito por prop** (decisión 14) y se reenvía tal cual a `Timeline.idPrefix`; no hay mapa interno "education"→"edu".
- Icono: se pasa como `icon` a `SectionTitle` (es SectionTitle quien monta el `IconBox` decorativo, RF-3 de su spec) — la pieza no lo importa.
- Sin espaciado propio entre título y timeline (spec → Estilos/"No hacer"): el `margin-bottom` del h2 (1.25rem por SectionTitle RF-5) es el único.
- `entries=[]` → `null` (RF-1).
- Cero conocimiento de ResumePage/columnas (RF-4).

## Estrategia de tests

Render aislado con fixture (2 entradas); como hijo usa `Timeline` real (pieza ya construida en la fase) — no hace falta mock. Tests: `getByRole("region", { name: title })` (el nombre sale del h2 vía labelledBy); heading nivel 2 con el título; `listitem` × n dentro de la región; sección ausente con `entries=[]`; dos secciones con ids distintos → ids de título distintos (test 5); el h3 del ítem queda nivel 3 dentro de la región (assert de jerarquía mínimo: `getAllByRole("heading")` por nivel, cubre la parte verificable de RF-5 sin duplicar los tests de Timeline). El `IconBox` decorativo con gradiente → armazón `AccentGradientDefs` en los renders. Cierre `expectNoA11yViolations`. P1: flex column, cero `@media`, cero gap extra → inspección.

Cobertura: T1→RF-1,RF-2,RF-3,RF-5 · T2→RF-4 + cierre.
