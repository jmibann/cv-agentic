# Plan — CornerTab

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/CornerTab/CornerTab.tsx` | `<div>` raíz con `children`; clases por `size` y `placement` | RF-1…RF-3, RF-6 |
| `src/components/CornerTab/CornerTab.module.css` | base absolute/z-raised, fondo `surface-raised`, bordes obligatorios, radio asimétrico; variantes `sm/md`; `@media (min-width: 992px)` solo para `.float` | RF-1…RF-5 |
| `src/components/CornerTab/CornerTab.test.tsx` | tests + cierre a11y | todas |
| `src/components/CornerTab/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno: mapa `placement`/`size` → clases.

## Interfaz

`CornerTabProps { children; size?: "sm" | "md"; placement?: "overlay" | "float"; className? }`.
`className` unida al raíz (P3).

## Decisiones

- RF-1 rige **solo en overlay**; `.float` fija `position: relative` +
  `z-index: var(--z-raised)` (resolución R-2). El `h1` posicionado del panel
  fluye al lado y su caja tapaba la mitad inferior del tab con `auto`; el
  apilamiento es necesario para que el tab reciba los clicks. *Descartado:*
  `pointer-events: none` en el `h1` (rompe la selección de texto) y dejar
  `auto` (el `h1` sigue interceptando).
- Impresión: **ningún `@media print` propio** — la oculta el estilo compartido
  de `layout.md`/`global.css` (resolución R-1). *Descartado:* que el módulo se
  oculte a sí mismo (viola la regla de CSS global y duplica la fuente).
- Único `@media` permitido: `(min-width: 992px)` de float, solo con
  tokens/`calc()` de tokens (regla de `breakpoints.md`).
- Borde obligatorio siempre (RF-5, 1.14:1 en oscuro); hover/foco NO viven acá:
  son del contenido (NavTabs/botón).
- `size="sm"` usa los literales fijos 2.75rem/1.25rem permitidos por
  `breakpoints.md` (no escalan).

## Estrategia de tests

Clases P2 por `size`/`placement`; raíz sin `role` ni ningún `aria-*` (test de
atributos); children visibles. P1: posicionamiento, z-index, float ≥ 992, borde
y no-print → inspección del CSS + QA cuando la usen NavTabs/Sidebar (F3).
Cierre `expectNoA11yViolations`. `npm test`.

Cobertura: T1→RF-1,RF-6 · T2→RF-2 · T3→RF-3 · T4→RF-4,RF-5,RF-6 ·
T6→RF-3 (Cambio 2026-11-10: `.float` por encima del `h1` posicionado).