# Plan — Overhead

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Overhead/Overhead.tsx` | raíz `span`/`dt` en bloque con el texto tal cual | RF-1, RF-2 |
| `src/components/Overhead/Overhead.module.css` | `uppercase`, `--color-text-muted`, `--font-size-overhead`, elipsis (`hidden/ellipsis/nowrap`), `block` | RF-1, RF-3, RF-5 |
| `src/components/Overhead/Overhead.test.tsx` | tests + cierre a11y | todas |
| `src/components/Overhead/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`OverheadProps { children: React.ReactNode; as?: "span" | "dt"; className?: string }`
(O-2: `"p"` fuera del tipo). `className` unida al raíz (P3).

## Decisiones

- Mayúsculas **solo por CSS** (`text-transform`): el DOM conserva "Email".
  *Descartado:* transformar el string (rompería lectores de pantalla).
- Elipsis sin `max-width` propio (O-1): la restricción de ancho es del
  contenedor (Sidebar); en jsdom no se computa → inspección (P1).
- RF-4 (contraste sobre `bg`) es restricción de uso: la verifica el reviewer en
  F3 (P1). `as` restringido a `span | dt` (O-2; descartado mantener `"p"` sin
  consumidor documentado).

## Estrategia de tests

`getByText` con el texto original (no transformado); `tagName` por `as` (con
`<dl>` de armazón); clases P2 para la elipsis; cierre `expectNoA11yViolations`.
P1: uppercase/elipsis/tamaño/`@media` por inspección del CSS. `npm test`.

Cobertura: T1→RF-1 · T2→RF-2 · T3→RF-3,RF-4,RF-5,RF-6.