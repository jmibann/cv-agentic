# Plan — Separator

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Separator/Separator.tsx` | `<div>` decorativo `aria-hidden="true"` | RF-1, RF-2 |
| `src/components/Separator/Separator.module.css` | línea 1px `--color-track`, full-bleed con `calc()` de `--box-padding`, `margin-block: var(--separator-gap)` | RF-3, RF-4, RF-5 |
| `src/components/Separator/Separator.test.tsx` | tests + cierre a11y | todas |
| `src/components/Separator/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`SeparatorProps { className?: string }`. `className` unida al raíz (P3).

## Decisiones

- `<div>` con `aria-hidden`, nunca `<hr>` ni `role="separator"`: es decoración
  (un `hr` anunciaría cambio de tema de sección).
- `margin-block` en **ambos lados** (resolución P-2): el contenedor del
  separador no debe sumar `gap` en ese tramo; el espacio bloque-línea-bloque lo
  aporta todo el Separator. *Descartado:* `margin-block-end` solo (la línea
  quedaría pegada al bloque anterior).
- Full-bleed con márgenes negativos + ancho calcados desde `--box-padding`
  (excepción #54 a "sin margen externo"; depende del Box outer).

## Estrategia de tests

Test: raíz con `aria-hidden="true"`, `tagName` `div`, sin rol separator
(`queryByRole("separator")` null), `className` unida (P2), cierre
`expectNoA11yViolations`. P1: grosor, color, full-bleed y márgenes (RF-1/3/4/5)
se verifican por inspección del CSS (jsdom no computa). `npm test`.

Cobertura: T1→RF-1,RF-2 · T2→RF-3,RF-4,RF-5 · T3→RF-3 (className) + a11y.