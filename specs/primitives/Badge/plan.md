# Plan — Badge

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Badge/Badge.tsx` | raíz `span`/`li` con `children: string` | RF-1…RF-3 |
| `src/components/Badge/Badge.module.css` | `surface-muted`, `--radius-8`, padding, `--font-size-badge`, `nowrap`, `inline-flex` | RF-4, RF-5 |
| `src/components/Badge/Badge.test.tsx` | tests + cierre a11y | todas |
| `src/components/Badge/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`BadgeProps { children: string; as?: "span" | "li"; className?: string }`
(spec; G-5: el tipo `string` fuerza "solo texto"). `className` se une a la
clase base del raíz (P3).

## Decisiones

- `children: string` en el tipo. *Descartado:* `ReactNode` con convención
  (el tipo debe hacer cumplir la regla; test de nombre accesible con `getByText`
  sobre string).
- Un solo componente para badge y chip (resolución C7/#31), sin variantes de
  color.
- RF-6 (no dentro de `Box inner`) no es verificable en el primitivo: la hace
  cumplir el reviewer en F3/F4 (P1).

## Estrategia de tests

`getByText` del string; estructura por `tagName` + clases (P2); a11y final con
el badge dentro de `<ul>` (caso `li`) y suelto (caso `span`). P1: RF-4/RF-5 por
inspección del CSS (no `@media`, sin `:hover`/`:focus`). `npm test`.

Cobertura: T1→RF-1,RF-2 · T2→RF-3 · T3→RF-4,RF-5,RF-6.