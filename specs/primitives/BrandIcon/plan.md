# Plan — BrandIcon

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/BrandIcon/BrandIcon.tsx` | componente `<svg>` desde `paths.ts` + `BRAND_NAMES` | RF-1…RF-3, RF-5 |
| `src/components/BrandIcon/paths.ts` | dato por red: `{ viewBox: string; d: string \| string[] }` (imports nombrados de `simple-icons`; constantes oficiales donde haga falta) | RF-1, RF-4 |
| `src/components/BrandIcon/BrandIcon.module.css` | tamaño `var(--icon-size, var(--size-social-icon))` | RF-5, RF-6 |
| `src/components/BrandIcon/BrandIcon.test.tsx` | tests parametrizados por red + cierre a11y | todas |
| `src/components/BrandIcon/index.ts` | re-export `BrandIcon`, `BRAND_NAMES`, tipos | — |

## Funciones puras y algoritmo

Ninguno: lookup directo `network → paths.ts`. Sin lógica de fecha.

## Interfaz

`BrandIconProps { network: SocialNetwork; className?: string }` y
`BRAND_NAMES: Record<SocialNetwork, string>` según la spec. `className` se une
a la clase base del `<svg>` (P3).

## Decisiones

- Estructura `paths.ts` con `viewBox` por entrada y `d` simple o array
  (resolución B-1): el SVG oficial que no sea 24×24 conserva su viewBox sin
  deformarse. *Descartado:* forzar normalización a 24×24 (deforma el logo o
  recorta; viola "respetar guías de marca").
- `BRAND_NAMES` literales definidos en el componente, no derivados de
  `si.title` (B-3): el fallback (LinkedIn) no tiene `si.title` y el nombre
  visible lo elige el diseño.
- Coberturas RF-4: verificar al construir T1 contra `SOCIAL_NETWORKS`
  (`@data/constants`). Caso conocido: **LinkedIn no está en simple-icons
  16.33** → `paths.ts` nace con el SVG oficial + comentario de origen; el
  builder lo **reporta** y el orchestrator lo registra en `docs/BACKLOG.md`
  (los subagentes no escriben en `docs/`). *Descartado:* ícono genérico
  sustituto (No hacer de la spec).
- Tamaño solo por CSS con fallback a `--size-social-icon` (mismo mecanismo que
  Icon; los atributos SVG no aceptan `var()`).

## Estrategia de tests

Test parametrizado sobre **todos** los valores de `SOCIAL_NETWORKS` (RF-1).
Queries por atributos del svg + `expectNoA11yViolations` al cierre. P1: RF-4
(chequeo de coberturas, inspección del reviewer sobre `paths.ts`), RF-5/RF-6
por inspección del CSS. P2/P3 como en Icon. `npm test`.

Cobertura: T1→RF-1(paths) · T2→RF-1(render) · T3→RF-2,RF-3 · T4→RF-5,RF-6.