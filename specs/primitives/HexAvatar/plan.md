# Plan — HexAvatar

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/HexAvatar/HexAvatar.tsx` | estructura `wrap > border > img` + `HexAvatarDefs` (export del módulo) | RF-1…RF-3 |
| `src/components/HexAvatar/HexAvatar.module.css` | clip-paths `url(#hex-avatar-outer/inner)`, offsets, `--color-track`, `filter: drop-shadow` del wrap | RF-1, RF-4, RF-5 |
| `src/components/HexAvatar/HexAvatar.test.tsx` | tests + cierre a11y | todas |
| `src/components/HexAvatar/index.ts` | re-export `HexAvatar`, `HexAvatarDefs` | — |

## Funciones puras y algoritmo

Ninguno. El path SVG **no se deriva en runtime**: sale de las coordenadas fijas
de la spec ("Forma") y queda escrito en `HexAvatarDefs` con comentario.

## Interfaz

`HexAvatarProps { src: string; alt?: string; className?: string }` +
`HexAvatarDefs(): JSX` (según spec; `className` se une al `wrap`, P3).

## Decisiones

- Geometría **fijada en la spec** (vértices px + normalizados, radios 6/2 px;
  resolución H-1=A): el builder transcribe, no inventa. *Descartado:* criterio
  ±1px a ojo en QA (divergiría entre card y dialog).
- `hex-avatar-inner` por inset geométrico real de 4 px, no escalado (RF-4
  original pasó a prosa de "Forma"; RF renumeradas).
- Sin `-webkit-clip-path` por ahora; Safari se chequea en F5 (resolución H-8).
- Sin estado de error: `--color-track` del `<img>` como placeholder natural
  (H-4). *Descartado:* `onError` con fallback (nada que testear en jsdom y sin
  requisito).
- El montaje único de `HexAvatarDefs` es responsabilidad de AppLayout (P4).

## Estrategia de tests

Tests: ids de los dos `clipPath` con `clipPathUnits="objectBoundingBox"` (defs);
estructura y clases de contorno/imagen (P2; el `url(#…)` por inspección del
módulo); `alt` ""/nombre vía `getByRole("img")`; `className` unida al wrap. P1:
`drop-shadow` sin `box-shadow`, tamaño fijo sin `@media`, cero interactividad →
inspección + axe. Cierre `expectNoA11yViolations`. `npm test`.

Cobertura: T1→RF-3 · T2→RF-1 · T3→RF-2 · T4→RF-4,RF-5.