# Plan — TestimonialDialog

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/TestimonialDialog/TestimonialDialog.tsx` | montaje condicional del `<dialog>` + refs (`showModal`/`close`), ciclo `close`→`onClose` con guard de ref, backdrop/padding detection, contenido (h2 autor, rol, texto, HexAvatar, comilla) y botón Close | RF-1…RF-4 |
| `src/components/TestimonialDialog/TestimonialDialog.module.css` | dialog/backdrop/layout (grid, `overflow-y: auto`)/close/comilla/2 columnas ≥580/entrada `@starting-style`/`@media print` propio | RF-5, RF-6 |
| `src/components/TestimonialDialog/TestimonialDialog.test.tsx` | tests + cierre a11y | todas |
| `src/components/TestimonialDialog/index.ts` | re-export | — |

## Funciones puras y algoritmo

- Detección de backdrop real (decisión 19): `handleClick(e)`: cierra si `e.target === dialogEl` **y** el punto cae fuera de `dialogEl.getBoundingClientRect()` (click en ::backdrop); la franja de padding del dialog NO cierra. Lógica pequeña dentro del handler (evento con DOM: no extrae a pura; se cubre con tests de eventos sobre el mock).

## Interfaz

`TestimonialDialogProps { testimonial: Testimonial | null; onClose: () => void; closeLabel: string }` (spec → API; sin `className`). `useRef<HTMLDialogElement>`.

## Decisiones

- **Montaje condicional (18=b):** `testimonial === null` → `return null`; al montar con valor, effect llama `showModal()`; cleanup del effect llama `dialog.close()` si `dialog.open` (cierre iniciado por el padre) — el guard del handler `close` (ref con último valor) evita `onClose` en ese camino (ciclo completo en spec → tabla).
- **Sin doble llamada:** `onClose` solo desde el evento `close`; `idempotencia` pedida al padre (Carousel) se mantiene.
- Entrada sola, `@starting-style` (19): `transition: opacity, transform` en abierto con `@starting-style` de cierre→apertura; sin estado de salida. `prefers-reduced-motion` ya colapsa la duración por tokens (sin media propio; lo declara el plan como criterio — el `@starting-style` es la única técnica fijada).
- Foco inicial/retorno: nativo (`showModal`/`close`); sin autofocus, verificación F5 (RF-4).
- Scroll interno: `max-height` del dialog + `.layout { overflow-y: auto }` (19).
- Comilla del aside: `Icon quote tone="gradient" --icon-size: 2rem` (decisión 19: mismo contrato de la card, debajo del avatar en aside); Close `Icon name="x"` sin `--icon-size` (default).
- Print: `@media print { display: none }` en el módulo de la pieza (G-D-1).
- `closeLabel` como `aria-label` del botón (nombre del botón); el `<h2 id>` fija el nombre del dialog (`aria-labelledby`).
- No toca `src/test/setup.ts`: los tests **usan** el mock existente (`showModal`→`open`; `close`→ quita `open` + dispara evento `close`) y verifican que alcanza (19).

## Anexo — Cambio motion 4 (2026-11-13, #106/#116; puerta Spec+Plan+Tareas aprobada con ajuste de redacción del usuario)

- **Historia del cambio (no va en la spec → fila "Entrada", por decisión del
  usuario):** propuesta §4.4 e ítem 9 de la matriz §2.4 (#106): cambiar **solo
  el easing** de la entrada (`--ease-standard`→`--ease-enter`); se mantienen
  `--duration-base` 0.2 s y `@starting-style` como único mecanismo; sin salida.
  El hover del botón close conserva `--ease-standard` (ítem 10: "se conserva").
  C7 de la matriz de hallazgos. Menor heredado de §XXIV: el comentario
  "0.3s ease-in-out" (módulo, bloque Entrada) está rancio doblemente (la
  duración es 0.2 s desde T15 y el easing pasa a `enter`) — se reescribe acá.
- **Alcance:** `TestimonialDialog.module.css` únicamente (2 valores +
  comentario). Cero tsx, cero tests (régimen #101: jsdom no computa
  transiciones; verificación = inspección + QA en navegador), cero cambios en
  `@starting-style`, backdrop, print, close o layout.
- **T4:** `feat(TestimonialDialog): T4` — commit único, **verde-only declarado
  #101** (no hay rojo posible sin inventar alcance; el rojo artificial leyendo
  CSS como texto queda descartado — precedente T3/T5 de esta pieza y decisión
  #101). Hecho: `.dialog` sigue (0,1,0); entrada `--ease-enter`; close intacto;
  suite sin regresiones.
- **T5:** cierre — suite + `build` + QA del reviewer con app servida (#91):
  apertura ~200 ms con deceleración marcada (`cubic-bezier(0.22,1,0.36,1)`, sin
  rebote), **cierre sigue instantáneo (regresión clave)**, hover close sin
  cambios, backdrop/print sin regresión; spec → `implementada`; docs #86
  (§XXVII) y **propuesta `specs/motion/proposal.md` marcada 4/4 implementada**
  (cabecera + cualquier "en espera" restante); regla #116 elevada a permanente
  (viñeta en `foundations/motion.md` + regla corta en sitio a decidir:
  `docs/DESIGN.md` o `AGENTS.md` → Convenciones — ambos en manos del usuario).

Cobertura del anexo: T4→RF-5/RF-6 (fila Entrada; inspección) · T5→cierre + QA.

Harness con `HexAvatarDefs` + `AccentGradientDefs` (armazón). `renderWithDialog`: montar con `testimonial` o `null`; rerender para transiciones. Tests 1–8 de la spec; el 5 se desdobla en tres asserts: backdrop real (click en target=dialog con coords fuera del rect — `Object.defineProperty(el,"getBoundingClientRect")` o mock de rect), padding (coords dentro del rect → no cierra), contenido (no cierra). Evento `close` sintético (simula Esc) → `onClose` una vez; `null` desde el padre con abierto → cleanup cierra y **no** llama `onClose` (18=b). Cierre `expectNoA11yViolations` con dialog abierto. P1 (backdrop color, overflow, print, animación): inspección.

Cobertura: T1→RF-1,RF-4 (contenido/nombre),RF-2 (Close→close→onClose) · T2→RF-2,RF-3 (ciclo completo) · T3→RF-5,RF-6 + cierre.
