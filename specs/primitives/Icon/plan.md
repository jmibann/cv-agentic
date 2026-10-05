# Plan — Icon

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Icon/Icon.tsx` | `Icon` (render desde mapa explícito) + `AccentGradientDefs` + tipos `UiIconName`/`IconName` | RF-1…RF-4, RF-6, RF-7 |
| `src/components/Icon/Icon.module.css` | `.icon` (tamaño por `var(--icon-size, var(--size-icon))` + `flex-shrink`), `.toneAccent`, `.stopStart`/`.stopEnd`, `.defs` (0×0 + `position: absolute`) | RF-4, RF-6 |
| `src/components/Icon/Icon.test.tsx` | tests de RF + cierre `expectNoA11yViolations` | todas |
| `src/components/Icon/index.ts` | re-export `Icon`, `AccentGradientDefs`, tipos | — |

## Funciones puras y algoritmo

Sin lógica de fecha ni algoritmo: un dato constante `ICON_MAP: Record<IconName, LucideIcon>`
(24 claves: 12 `UiIconName` + 12 `ServiceIcon`) y render directo. La RF-5
("compilación falla") la sostiene el propio tipo: `Record` exige clave por cada
valor de la unión generada.

## Interfaz

`IconProps` y `AccentGradientDefs` según la "API" de la spec (contrato).
`className` se UNE a `.icon` sobre el `<svg>` raíz (criterio P3 de la fase);
ahí el padre fija `--icon-size`.

## Decisiones

- Tamaño sin prop `size`, solo CSS con cadena de fallback. *Descartado:* prop
  numérica a los atributos `width`/`height` (no aceptan `var()`; resolución B8
  de la auditoría).
- `AccentGradientDefs` se exporta desde el módulo de Icon (una sola dueña del
  id). *Descartado:* módulo `defs` aparte (fragmenta sin segundo consumidor).
- `tone` por clases del módulo; `gradient` por atributo `stroke`. *Descartado:*
  `style` inline (regla dura de CSS).
- RF-5 sin unit test: el pipeline `prebuild` (gen:types → tsc) ES el test.
  *Descartado:* test que lee el schema JSON (duplica el pipeline con otro lenguaje).

## Estrategia de tests

Vitest + RTL + user-event no hace falta (no interactivo). Queries por rol/nombre.
Criterios de fase: P2 (clases vía `import styles` + `toHaveClass`), P1 (RF-5 y
tokens CSS: inspección del reviewer), P4 (los tests que usan `tone="gradient"`
montan `AccentGradientDefs` como armazón; la unicidad es de AppLayout).
El archivo termina con `expectNoA11yViolations` (con y sin `label`). `npm test`.

Cobertura: T1→RF-1,RF-5 · T2→RF-2,RF-3,RF-7 · T3→RF-4 (defs) · T4→RF-4,RF-6 (tone) · T5→RF-6. (Swap T3/T4: el test de tone monta las defs, así que `AccentGradientDefs` va primero — orden de dependencia de la skill.)