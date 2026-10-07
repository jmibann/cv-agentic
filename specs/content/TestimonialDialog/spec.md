# TestimonialDialog
Estado: implementada

## Propósito

Muestra un testimonio completo en un modal. Usa `<dialog>` nativo (foco
atrapado, Esc, top layer y `::backdrop` sin librerías).

## Requisitos (EARS)

- RF-1: SI `testimonial` es `null`, ENTONCES EL SISTEMA **no renderiza nada** (montaje condicional, decisión 18=b: no hay `<dialog>` en el DOM — coincide con Test 1); SI recibe un valor no nulo, ENTONCES monta el `<dialog>` y lo abre con `dialog.showModal()` en un effect tras el mount.
- RF-2: EL SISTEMA cierra el diálogo con `dialog.close()` cuando el disparador es el botón Close o el backdrop; el cierre por **Esc es nativo** (el navegador no llama `close()` pero dispara el evento `close`); en todos los casos el evento `close` del `<dialog>` es el **único lugar que llama `onClose()`** (solo si el testimonial vigente no es `null`).
- RF-3: CUANDO el usuario cierra (botón Close, backdrop o Esc), ENTONCES EL SISTEMA invoca `onClose` exactamente una vez; SI el padre pone `testimonial` a `null`, ENTONCES cierra sin invocar `onClose`. Un click cuyo `target` es el dialog pero cae **dentro de la franja de `padding`** del dialog NO cierra (decisión 19): el cierre por click exige `target === dialog` **y** punto fuera del bounding rect del dialog (backdrop real).
- RF-4: CUANDO el diálogo está abierto, ENTONCES EL SISTEMA muestra autor, rol y texto completo (`testimonial.text`), con nombre accesible igual al autor (`aria-labelledby` al `h2`) y cierre con Esc. El foco inicial en el botón Close es **nativo de `showModal`**: sin autofocus propio; se verifica en QA F5 (jsdom no lo implementa).
- RF-5: EL SISTEMA aplica el backdrop con `::backdrop` y no imprime el diálogo. El bloqueo de scroll del fondo (`html:has(dialog[open]) { overflow: hidden; }`) **ya vive en `global.css` desde F1**: sin tarea en esta pieza, verificar que alcanza. El `@media print { display: none }` vive en el **módulo de la pieza** (G-D-1, decisión 19). Verificación de `::backdrop` y print: inspección del CSS.
- RF-6: EL SISTEMA renderiza dos columnas a 580px o más y una sola con la comilla oculta por debajo de 580px, con ancho y alto máximos sobre el viewport y sin medidas nuevas por breakpoint; el avatar sale de `HexAvatar` (decorativo). SI el contenido excede la altura máxima, `.layout` scrollea (`overflow-y: auto`, decisión 19); el dialog conserva sus máximos. Verificación del layout: inspección + QA F5.

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
| `testimonial` pasa de `null` a un valor | Monta el `<dialog>` (no existía) y lo abre con `dialog.showModal()` en effect de mount (RF-1) |
| Botón Close | `dialog.close()` — **no** llama `onClose` directamente |
| Click en el backdrop (`target === dialog` **y** punto fuera del bounding rect del dialog; el padding NO cierra, RF-3) | `dialog.close()` — **no** llama `onClose` directamente |
| Esc | cierre nativo del navegador; dispara el evento `close` |
| Evento `close` del `<dialog>` | **único lugar que llama `onClose()`**, y solo si el `testimonial` actual (leído de un ref con el último valor de la prop) no es `null` |
| `testimonial` pasa a `null` desde el padre | Cleanup del effect de montaje: `dialog.close()` si `dialog.open` y desmontaje; el `close` resultante **no** llama `onClose` (el ref ya es `null`) |
| Valor → valor distinto sin pasar por `null` | No puede ocurrir con el padre real (Carousel RF-6 lo prohíbe): la pieza no define transición directo; el contrato es del consumidor |

Resultado: cada cierre iniciado por el usuario llama `onClose` **exactamente
una vez**, y un cierre iniciado por el padre no lo llama. Aun así, el padre
debe implementar `onClose` de forma idempotente (p. ej. `setSelectedId(null)`).
El **retorno de foco** al botón que abrió el diálogo es nativo (`close()` antes
del desmontaje); se verifica en QA F5.

## Estilos y tokens

| Parte | Valor |
|---|---|
| Dialog | `background: var(--color-surface); color: var(--color-text); border: 0; border-radius: var(--radius-20); padding: var(--box-padding); width: min(40rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); box-shadow: var(--shadow-dialog);` |
| Backdrop | `::backdrop { background: var(--color-overlay); }` |
| Entrada | `opacity` 0→1 y `transform: scale(0.96)`→1 en `--duration-base var(--ease-standard)` **solo de entrada** (decisión 19: sin animación de salida), con `@starting-style` como único mecanismo; la reducción queda en los tokens de duración (sin `@media (prefers-reduced-motion)` propio) |
| Layout | Grid `auto 1fr`, `gap: var(--space-6)`; `overflow-y: auto` (scroll interno si el texto excede la altura máxima — RF-6/decisión 19) |
| Rol | `color: var(--color-text-muted); margin: 0;` (decisión del usuario 2026-10-07: completa la fila que faltaba para el `<p class="role">` de la Anatomía, misma convención que el rol de TestimonialCard; par 5.02/6.01 sobre `surface` registrado en `docs/tokens/contrast.md`) |
| Close | `position: absolute; top: var(--space-4); right: var(--space-4);` botón `--size-control` cuadrado, radio `--radius-12`, fondo `--color-surface-muted`, color `--color-text`; ícono `Icon name="x"` con tamaño default (`--size-icon`, sin `--icon-size` propio) |
| Comilla | `Icon name="quote" tone="gradient"` con `.quote { --icon-size: 2rem; }` (misma convención que TestimonialCard), en la columna aside **debajo del avatar** (anatomía); oculta < 580px (RF-6) |
| Avatar | `HexAvatar` (misma primitiva que TestimonialCard; no se reimplementa) |
| Scroll del fondo | `html:has(dialog[open]) { overflow: hidden; }` **ya existe en `global.css` (F1)**: sin tarea propia, verificar que alcanza |
| Impresión | `@media print { display: none }` en el **módulo de la pieza** (G-D-1) |

## Estados

| Estado | Efecto |
|---|---|
| Cerrado | **no montado**: no hay `<dialog>` en el DOM (RF-1, decisión 18=b) |
| Abierto | modal en top layer con backdrop |
| Close hover | color `--color-accent-text`; transición de `color` `--duration-base var(--ease-standard)` (G-E) |
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

jsdom no implementa `showModal`/`close` completos: el mock mínimo **ya está
provisto por F1** en `src/test/setup.ts` (`showModal` → atributo `open`; `close`
→ quita `open` + dispara el evento `close`, también sobre dialog cerrado — el
guard `dialog.open` del ciclo lo hace compatible). Los tests **verifican que
el mock alcanza**; ninguna tarea de la pieza toca `src/test/` (post-F1). Los
renders con `HexAvatar`/comilla gradient montan `HexAvatarDefs` y
`AccentGradientDefs` como armazón (contratos de HexAvatar → Forma e Icon).

1. Con `testimonial = null` no hay dialog en el DOM (`queryByRole("dialog")` es null; RF-1 montaje condicional).
2. Con un testimonio: `getByRole("dialog", { name: author })`, muestra rol y texto completo (`testimonial.text`).
3. Click en Close → `onClose` **exactamente una vez**.
4. Evento `close` del dialog (simula Esc) → `onClose` exactamente una vez.
5. Click en el backdrop (`target = dialog` + coordenada fuera del bounding rect) → `onClose` una vez; click dentro del contenido **y click en la franja de padding** (target = dialog, dentro del rect) no cierran (RF-3).
6. El padre pasa `testimonial` a `null` con el dialog abierto → se cierra y `onClose` **no** se llama.
7. `closeLabel` es el nombre del botón de cerrar.
8. `expectNoA11yViolations` sin violaciones con el dialog abierto (armazón defs montado).

## No hacer

- No llamar `onClose` desde el botón Close ni desde el backdrop: solo lo llama el evento `close` del `<dialog>`.
- No reemplazar el `<dialog>` nativo por un modal hecho con `div` ni por una librería: foco atrapado, Esc y top layer son nativos.
- No reimplementar el avatar: se usa `HexAvatar`.
- No imprimir el diálogo: `display: none` en `@media print` del **módulo de la pieza** (G-D-1; no va en global).
- No agregar medidas por breakpoint: ancho y alto máximos van por `min()`/`calc()` sobre el viewport.
- No tocar `src/test/setup.ts` (el mock de dialog ya existe; post-F1 nadie escribe ahí).
