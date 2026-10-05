# Plan — SectionTitle

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/SectionTitle/SectionTitle.tsx` | heading `h1/h2/h3` con `id`, `decorated`, `icon` (IconBox) | RF-1…RF-4 |
| `src/components/SectionTitle/SectionTitle.module.css` | `.h1/.h2/.h3` (font-size), `.decorated` (`::after` barra), `.withIcon` (flex en el heading), márgenes RF-5 | RF-1, RF-2, RF-5, RF-6 |
| `src/components/SectionTitle/SectionTitle.test.tsx` | tests + cierre a11y | todas |
| `src/components/SectionTitle/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno: composición de clases según props.

## Interfaz

`SectionTitleProps` de la spec (`as` obligatorio). `className` unida al heading
— el único elemento raíz, **sin wrapper** (el flex de `icon` va en el propio
heading) (P3/S-5).

## Decisiones

- `font-size` por clases del módulo `.h1/.h2/.h3` (S-6): el componente es
  self-contained. *Descartado:* depender de la tipografía global por etiqueta
  (un wrapper/global podría pisarlo y el test del módulo no lo afirmaría).
- `decorated` + `icon` es combinación **válida** con regla fija (S-2): ambos
  tratamientos se pintan; la barra `::after` se ancla al borde del heading
  completo (`position: absolute` la excluye del flujo flex).
- RF-6 acotada: tokens para color/radio/fuente/barra; márgenes título→contenido
  son los literales de RF-5 (S-3=A). *Descartado:* tokens nuevos para los
  márgenes h2/h3 (no escalan por breakpoint).
- h1 **sin** `decorated` no declara `margin-bottom`: toma el margen global de
  headings (S-1).
- Depende de: `Icon` → `IconBox` (previos en el orden de F2).

## Estrategia de tests

Roles `heading` con `level` y `name`; `id` en el heading; clases P2
(`decorated`, nivel); combinación decorated+icon (ambas clases + IconBox
presente, nombre accesible intacto); barra sin contenido textual e ícono
`aria-hidden` → inspección + axe. P1: márgenes/`@media`/`::after` por
inspección. Cierre `expectNoA11yViolations`. `npm test`.

Cobertura: T1→RF-1,RF-4 · T2→RF-1 · T3→RF-2 · T4→RF-3 · T5→RF-5,RF-6.