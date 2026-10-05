# Plan — IconBox

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/IconBox/IconBox.tsx` | `<span>` raíz decorativo con `Icon tone="gradient"` centrado | RF-1, RF-2 |
| `src/components/IconBox/IconBox.module.css` | cuadrado `--size-icon-box`, `--color-surface-muted`, `--radius-12`, inline-flex centrado | RF-3 |
| `src/components/IconBox/IconBox.test.tsx` | tests + cierre a11y | todas |
| `src/components/IconBox/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`IconBoxProps { icon: IconName; className?: string }`. `className` unida al
`<span>` raíz (P3) — con la nota de que `--icon-size` puesta ahí **no** llega al
ícono (no hereda).

## Decisiones

- IconBox **no pasa `--icon-size`** al `Icon`: aplica el fallback del propio
  Icon (`var(--size-icon)`) (C-1). *Descartado:* fijar la variable en el
  `className` del IconBox (no hereda; sería un mecanismo roto).
- No monta defs del gradiente: la unicidad es de AppLayout (P4); el test monta
  `AccentGradientDefs` como armazón (patrón de Icon).
- Sin margen propio: el espaciado con el texto lo pone el consumidor (C-5).
- Depende de: `Icon` (ya construido en F2 antes que esta pieza).

## Estrategia de tests

Test: svg con `stroke="url(#accent-gradient)"` (con defs montadas), raíz con
`aria-hidden="true"`, unión de `className` (P2). P1: tamaño/radio/fondo sin
`@media`, sin `:hover`/`:focus`/transiciones y sin margen propio → inspección;
RF-5 (prohibición de uso en `Box inner`) la verifica el reviewer en F3. Cierre
`expectNoA11yViolations`. `npm test`.

Cobertura: T1→RF-1 · T2→RF-2 · T3→RF-3,RF-4,RF-5.