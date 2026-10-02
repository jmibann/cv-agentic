# TestimonialDialog
Estado: aprobada

## Propósito

Muestra un testimonio completo en un modal. Usa `<dialog>` nativo (foco
atrapado, Esc, top layer y `::backdrop` sin librerías).

## Requisitos (EARS)

- RF-1: SI `testimonial` es `null`, ENTONCES no hay diálogo abierto; SI la prop pasa de `null` a un valor, ENTONCES EL SISTEMA lo abre con `dialog.showModal()`.
- RF-2: EL SISTEMA cierra el diálogo únicamente con `dialog.close()`, y el evento `close` es el único lugar que llama `onClose()` (solo si el testimonial vigente no es `null`).
- RF-3: CUANDO el usuario cierra (botón Close, backdrop o Esc), ENTONCES EL SISTEMA invoca `onClose` exactamente una vez; SI el padre pone `testimonial` a `null`, ENTONCES cierra sin invocar `onClose`.
- RF-4: CUANDO el diálogo está abierto, ENTONCES EL SISTEMA muestra autor, rol y texto completo, con nombre accesible igual al autor (`aria-labelledby` al `h2`), foco inicial en el botón Close y cierre con Esc.
- RF-5: EL SISTEMA aplica el backdrop, bloquea el scroll del fondo con `html:has(dialog[open]) { overflow: hidden; }` y no imprime el diálogo en `@media print`.
- RF-6: EL SISTEMA renderiza dos columnas a 580px o más y una sola con la comilla oculta por debajo de 580px, con ancho y alto máximos sobre el viewport y sin medidas nuevas por breakpoint; el avatar sale de `HexAvatar` (decorativo).

## Anatomía

```
┌────────────────────────────────────────────────── [×] ┐
│  ⬡ av ⬡   María González                              │   ← h2
│    ❝      Product Manager, Acme Corp                  │
│           Alex consistently delivered high-quality…   │   ← texto completo
└───────────────────────────────────────────────────────┘
```

```html
<dialog aria-labelledby="testimonial-dialog-title" class="dialog">
  <button type="button" class="close" aria-label="Close"><Icon name="x" /></button>
  <div class="layout">
    <div class="aside">  avatar hexagonal + comilla (comilla oculta < 580) </div>
    <div class="body">
      <h2 id="testimonial-dialog-title">María González</h2>
      <p class="role">Product Manager, Acme Corp</p>
      <p>texto completo</p>
    </div>
  </div>
</dialog>
```

## API

```ts
import type { Testimonial } from "@data/cv.types.generated";

export interface TestimonialDialogProps {
  /** null = cerrado. */
  testimonial: Testimonial | null;
  onClose: () => void;
  closeLabel: string;  // "Close" / "Cerrar"
}
```

### Ciclo de apertura y cierre (única fuente de verdad)

| Disparador | Qué hace el componente |
|---|---|
| `testimonial` pasa de `null` a un valor | `dialog.showModal()` (si no estaba abierto) |
| Botón Close | `dialog.close()` — **no** llama `onClose` directamente |
| Click en el backdrop (`event.target === dialog`) | `dialog.close()` — **no** llama `onClose` directamente |
| Esc | cierre nativo del navegador |
| Evento `close` del `<dialog>` | **único lugar que llama `onClose()`**, y solo si el `testimonial` actual (leído de un ref con el último valor de la prop) no es `null` |
| `testimonial` pasa a `null` desde el padre | `dialog.close()` si `dialog.open`; el evento `close` resultante **no** llama `onClose` (el testimonial ya es `null`) |

Resultado: cada cierre iniciado por el usuario llama `onClose` **exactamente
una vez**, y un cierre iniciado por el padre no lo llama. Aun así, el padre
debe implementar `onClose` de forma idempotente (p. ej. `setSelectedId(null)`).

## Estilos y tokens

| Parte | Valor |
|---|---|
| Dialog | `background: var(--color-surface); color: var(--color-text); border: 0; border-radius: var(--radius-20); padding: var(--box-padding); width: min(40rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); box-shadow: var(--shadow-dialog);` |
| Backdrop | `::backdrop { background: var(--color-overlay); }` |
| Entrada | `opacity` 0→1 y `transform: scale(0.96)`→1 en `--duration-base` (con `@starting-style` o clase al abrir); reducido con `prefers-reduced-motion` |
| Close | `position: absolute; top: var(--space-4); right: var(--space-4);` botón `--size-control` cuadrado, radio `--radius-12`, fondo `--color-surface-muted`, color `--color-text`; ícono `Icon name="x"` |
| Layout | Grid `auto 1fr`, `gap: var(--space-6)` |
| Avatar | `HexAvatar` (misma primitiva que TestimonialCard; no se reimplementa) |
| Scroll del fondo | `html:has(dialog[open]) { overflow: hidden; }` en `global.css` (excepción nombrada en la regla dura 3 de `docs/DESIGN.md`) |

## Estados

| Estado | Efecto |
|---|---|
| Cerrado | no renderiza contenido visible (`<dialog>` sin `open`) |
| Abierto | modal en top layer con backdrop |
| Close hover | color `--color-accent-text` |
| Close focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |

## Responsive

- ≥ 580px: grid de dos columnas (avatar + comilla | texto).
- < 580px: una columna y la comilla oculta (solo cambio de layout/visibilidad).
- Ancho y alto máximos por `min()`/`calc()` sobre el viewport; sin medidas nuevas por breakpoint.

## Impresión

El dialog no se imprime (`display: none` en `@media print`).

## Accesibilidad

- `<dialog>` modal con `aria-labelledby` al h2 (nombre del autor).
- Al abrir, el foco va al primer elemento enfocable (el botón Close, nativo de `showModal`).
- Al cerrar, el foco vuelve al botón que lo abrió (nativo); verificar en QA.
- Esc cierra (nativo).
- Avatar `alt=""`; comilla decorativa.

## Tests esperados

jsdom no implementa `showModal`/`close` de forma completa: `src/test/setup.ts`
debe definir un mock mínimo (`showModal` → `open = true`; `close` → `open = false` + dispara el evento `close`), o usar una
versión de jsdom que lo soporte. Documentarlo en el setup.

1. Con `testimonial = null` no hay dialog abierto (`queryByRole("dialog")` es null).
2. Con un testimonio: `getByRole("dialog", { name: author })`, muestra rol y texto completo.
3. Click en Close → `onClose` **exactamente una vez**.
4. Evento `close` del dialog (simula Esc) → `onClose` exactamente una vez.
5. Click en el backdrop (evento con `target` = dialog) → `onClose` una vez; click en el contenido no cierra.
6. El padre pasa `testimonial` a `null` con el dialog abierto → se cierra y `onClose` **no** se llama.
7. `closeLabel` es el nombre del botón de cerrar.
8. `expectNoA11yViolations` sin violaciones con el dialog abierto.

## No hacer

- No llamar `onClose` desde el botón Close ni desde el backdrop: solo lo llama el evento `close` del `<dialog>`.
- No reemplazar el `<dialog>` nativo por un modal hecho con `div` ni por una librería: foco atrapado, Esc y top layer son nativos.
- No reimplementar el avatar: se usa `HexAvatar`.
- No imprimir el diálogo (`display: none` en `@media print`).
- No agregar medidas por breakpoint: ancho y alto máximos van por `min()`/`calc()` sobre el viewport.
