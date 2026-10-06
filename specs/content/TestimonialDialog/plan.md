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

## Estrategia de tests

Harness con `HexAvatarDefs` + `AccentGradientDefs` (armazón). `renderWithDialog`: montar con `testimonial` o `null`; rerender para transiciones. Tests 1–8 de la spec; el 5 se desdobla en tres asserts: backdrop real (click en target=dialog con coords fuera del rect — `Object.defineProperty(el,"getBoundingClientRect")` o mock de rect), padding (coords dentro del rect → no cierra), contenido (no cierra). Evento `close` sintético (simula Esc) → `onClose` una vez; `null` desde el padre con abierto → cleanup cierra y **no** llama `onClose` (18=b). Cierre `expectNoA11yViolations` con dialog abierto. P1 (backdrop color, overflow, print, animación): inspección.

Cobertura: T1→RF-1,RF-4 (contenido/nombre),RF-2 (Close→close→onClose) · T2→RF-2,RF-3 (ciclo completo) · T3→RF-5,RF-6 + cierre.
