# Plan — Box

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Box/Box.tsx` | contenedor con `variant`/`as`, API cerrada (sin `...rest`) | RF-1…RF-4 |
| `src/components/Box/Box.module.css` | `.outer`/`.inner` solo con tokens; `overflow: visible` en outer | RF-5, RF-6 |
| `src/components/Box/Box.test.tsx` | tests + cierre a11y | todas |
| `src/components/Box/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno: `const El = as ?? "div"` con clases elegidas por `variant`.

## Interfaz

`BoxProps` de la spec: `variant`, `as`, `children`, `id`, `aria-label`,
`aria-labelledby`, `className`. Nada más llega al DOM (RF-3/RF-4). `className`
se une a la clase de variante sobre el único elemento raíz (P3).

## Decisiones

- API cerrada sin pass-through de `role`/`tabIndex`/`...rest` (resolución A3 de
  la auditoría: el tabpanel **no** es un Box). *Descartado:* mantener
  pass-through genérico (muerto y peligroso para a11y).
- `outer` declara `overflow: visible` explícito (la CornerTab y el avatar del
  Sidebar dependen de esto); `inner` **no declara** `overflow` (resolución X-3,
  visible por defecto). *Descartado:* `hidden` en inner (recorta el radio
  tintado).
- RF-4 (no transmisión) no tiene unit test: el tipo cerrado de props lo
  garantiza en compilación y un consumo no tipado no existe en el proyecto
  (P1: inspección).
- Cero `@media`: todo el responsive sale de `--box-padding`,
  `--box-inner-padding` y `--radius-box-inner` (RF-5).

## Estrategia de tests

RTL con queries por rol (`complementary`/`region` vía `aria-label`) y
aserción de clase P2 (`styles["outer"]` etc.). P1: RF-4/RF-5/RF-6 por
inspección del CSS/DOM en la revisión. Cierre con `expectNoA11yViolations`
(outer y inner). `npm test`.

Cobertura: T1→RF-1,RF-3 · T2→RF-2 · T3→RF-3 · T4→RF-4,RF-5,RF-6.