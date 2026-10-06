# Plan — Timeline

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Timeline/Timeline.tsx` | `<ol role="list">` con `<li><article aria-labelledby>` por entrada: h3 (id fórmula), organization, período con dos `<time>`, description | RF-1…RF-5 |
| `src/components/Timeline/Timeline.module.css` | ítem con línea/borde, punto `::before` centrado, `:last-child` sin línea, sangría por token, título con `top: calc(var(--timeline-title-shift) * -1)` | RF-6, RF-7 |
| `src/components/Timeline/Timeline.test.tsx` | tests + cierre a11y | todas |
| `src/components/Timeline/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguna nueva. Timeline **no** usa `formatPeriod` (devuelve una string compuesta): para el markup de dos `<time>` usa el nuevo **`formatPeriodEndpoint`** (Foundation T12) en cada extremo y pinta el separador `" — "` literal del contrato de `foundations/i18n.md`. No reimplementa formateos ni parsea strings.

## Interfaz

`TimelineProps { entries; locale; presentLabel; idPrefix; className? }` (spec → API; `className` al `<ol>` raíz, G-B). Id del título: `const titleId = \`${idPrefix}-${entry.id}-title\`` (fórmula RF-5).

## Decisiones

- **Depende de Foundation T12** (`formatPeriodEndpoint`): tarea previa de la fase; sin ella T2 no compila. *Descartado:* reimplementar el formateo (prohibido por la spec).
- `end === null` → un solo `<time>` + `presentLabel` como texto plano dentro de `.period` (RF-3/4; "Present es texto" → Accesibilidad).
- `role="list"` explícito en el `<ol>` (decisión 13; quirk Safari con `list-style: none`).
- Línea del último ítem: corte **posicional** `:last-child` (RF-6; no por contenido).
- H3 con estilo de h4: `--font-size-h4` fijado por el módulo sobre la clase del título (la tabla de la spec); no se usa SectionTitle (nivel h3 con estilo h4 — fuera de su contrato).
- Impresión: `break-inside` del ítem es del estilo compartido (G-D, F4); cero `@media print` propio.
- `entries=[]` → `null`.

## Estrategia de tests

Render aislado con props fixture de `TimelineEntry` (dos entradas: una con `end: null`, otra con rango; `locale="en"` y con `locale="es"` para el caso 5). Queries por rol: `list` (verifica `role="list"`), `listitem`, heading nivel 3 nombrado; `container.querySelectorAll("time")` con `dateTime` por extremo (test 6); texto formateado ("Mar 2019" / "mar 2019" + separador `" — "` — el mismo que produce `formatPeriod`, pero aquí se aserta el markup de dos `<time>`); ids con fórmula y sin colisión entre dos Timelines (test 7); vacío (test 8). `presentLabel` como texto (test 4). Cierre `expectNoA11yViolations`. P1: punto/línea/`:last-child`/sangría/`--timeline-title-shift` por inspección (#101; sin leer CSS como texto). El `behavior` formateo puro ya está testeado junto a la función (F1 + T12), no acá.

Cobertura: T1→RF-1,RF-2,RF-5 · T2→RF-3,RF-4 (requiere T12) · T3→RF-6,RF-7 + cierre.
