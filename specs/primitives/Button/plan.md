# Plan — Button

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/Button/Button.tsx` | `<button>` o `<a>` (unión discriminada por `href`), `Icon` interno + `::before` de brillo (por clase) | RF-1…RF-4, RF-7…RF-9 |
| `src/components/Button/Button.module.css` | fondo/tipografía/sombra/glow por tokens; clases `size`, `fullWidth`; pseudo-estados focus/disabled | RF-5, RF-6 |
| `src/components/Button/Button.test.tsx` | tests + user-event + cierre a11y | todas |
| `src/components/Button/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno con lógica: elección de elemento por presencia de `href` y composición
de clases. El `rel` default es una expresión trivial (`rel ?? (target ? "noopener noreferrer" : undefined)`).

## Interfaz

`ButtonProps` de la spec (unión discriminada `href`/sin `href`). `className` se
une a la clase base del raíz (P3). El ícono usa `Icon` **sin** `label`
(decorativo).

## Decisiones

- **Unión discriminada por `href`** en el tipo (API de la spec): *descartado:*
  interfaz única con todo opcional (permitiría `disabled` en `<a>`, inviable).
- Padding `size="small"` con **tokens nuevos fijos** `--button-small-padding-block/inline`
  (resolución T-2=A de la Clarificación). *Descartado:* literal en el módulo
  (viola RF-6). **Dependencia:** las 2 líneas en `tokens/tokens.css` las aporta
  el usuario (fuera del permiso de edición de los agentes); T5/T6 no arrancan
  sin ellas.
- Brillo `::before` anclado con `bottom: 0` (T-3) y `content: none` en small
  (T-4). *Descartado:* offset ad-hoc sin fijar (divergencia de builders).
- `iconPosition="end"` se resuelve con **orden en el DOM** del svg y el label
  (RF-7 testeable), no con `order: -1` de CSS. *Descartado:* reordenar por CSS
  (inobservable en jsdom y frágil con el nombre accesible).
- RF-5 (focus-visible/disabled) no es testeable en jsdom: inspección + axe (P1).

## Estrategia de tests

RTL + `@testing-library/user-event` (clicks). Roles `button`/`link` con nombre;
orden de nodos para `iconPosition`; atributos `type`/`rel`/`download`. P2 para
clases de `size`/`fullWidth`; P1 para RF-5/RF-6 y el padding de tokens (el
reviewer chequea además que los tokens existan en `tokens.css`). Cierre:
`expectNoA11yViolations` en `<button>` y en `<a>`. `npm test`.

Cobertura: T1→RF-1 · T2→RF-3 · T3→RF-2,RF-8,RF-9 · T4→RF-4,RF-7 · T5→RF-6 · T6→RF-5,RF-6.