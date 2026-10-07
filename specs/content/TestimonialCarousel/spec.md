# TestimonialCarousel
Estado: aprobada

## Propósito

Carrusel horizontal de testimonios con scroll-snap nativo, bullets de
paginación y un único `TestimonialDialog` para ver el texto completo. Sin
librerías (reemplaza Swiper) y **sin autoplay**.

## Requisitos (EARS)

- RF-1: CUANDO `testimonials` contiene elementos, ENTONCES EL SISTEMA renderiza **la única `<section>` de la región** (decisión 20: el carrusel es dueño de la section; AboutPage **no** lo envuelve en otra) con `aria-roledescription="carousel"`, nombrada por `labelledBy` (si se pasa) o `aria-label=labels.carousel`, con un slide por testimonio; SI `testimonials` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA desplaza el track con `overflow-x` y `scroll-snap-type` nativos (sin librerías), y no implementa autoplay, loop ni flechas prev/next. **Tampoco navegación por flechas de teclado** (decisión 21): Tab entre botones + scroll nativo/swipe.
- RF-3: EL SISTEMA renderiza un bullet por cada posición alcanzable (`getScrollStops`), no uno por testimonio, recalculándolos al montar **y cada vez que cambia el tamaño del track (instancia un `ResizeObserver` sobre el track que re-mide los stops; cableado real, no solo teórico)**; SI hay un stop o menos, ENTONCES no renderiza bullets. El recálculo por resize **no tiene test unitario** (mock global `ResizeObserver` es no-op; decisión 21: la decisión elimina el test, no el comportamiento — su validación es QA F5). El bullet activo inicial, una vez calculados los stops (mount, `scrollLeft = 0`), es el del stop de `getActiveStop` → el primero.
- RF-4: CUANDO el usuario pulsa un bullet, ENTONCES EL SISTEMA llama `track.scrollTo` con el `left` de ese stop, usando `behavior: "smooth"` solo si `prefers-reduced-motion` es `no-preference` (lectura por `window.matchMedia` en el click; no requiere reaccionar en vivo). Verificación: test de `scrollTo` con `behavior` según el mock de `matchMedia` (setup F1: `matches` configurable).
- RF-5: EL SISTEMA marca `aria-current="true"` en el bullet activo según `getActiveStop(stops, scrollLeft)`, recalculado en el evento `scroll` con un cálculo por frame. **Sin región `aria-live`** (decisión 21): el cambio de slide no se anuncia; no hay autoplay.
- RF-6: EL SISTEMA mantiene un único `TestimonialDialog`: `onOpen(id)` de la card fija el estado seleccionado y `onClose` lo limpia (con `testimonial` derivado del `selectedId`; nunca valor→valor sin `null` intermedio, ver ciclo en `TestimonialDialog.md`).
- RF-7: EL SISTEMA reserva el espacio del avatar con `padding-block: var(--testimonial-headroom) 2rem` en el track (único lugar que lo hace: arriba, protrusión + sombra; abajo, `2rem` fijo fijado textualmente por la tabla — mismo criterio de medidas fijas de `breakpoints.md` — para no recortar la sombra de hover) y oculta la scrollbar.
- RF-8: EL SISTEMA imprime los testimonios apilados con el texto completo y la paginación oculta, y escala el responsive solo con columnas y tokens (sin medidas literales en `@media`; `2rem` de RF-7 fuera de `@media`).

## Anatomía

```html
<section aria-roledescription="carousel" aria-label="Testimonials">
  <div class="track">                                  <!-- overflow-x: auto + scroll-snap -->
    <div role="group" aria-roledescription="slide" aria-label="1 of 3" class="slide">
      <TestimonialCard … />
    </div>
    …
  </div>
  <div class="pagination">                          <!-- bullets -->
    <button aria-label="Go to slide 1" aria-current="true"></button>
    <button aria-label="Go to slide 2"></button>
    …
  </div>
  <TestimonialDialog testimonial={selected} onClose={…} closeLabel={labels.close} />
</section>
```

La `<section>` del carrusel **es** la región nombrada (decisión 20): AboutPage
renderiza el `SectionTitle` y el carrusel hermanos en el tabpanel, sin envolver
en otra `<section>`; cuando hay h2 visible encima se pasa `labelledBy` con el id
del h2 (en lugar de `aria-label`).

**Cambio de accesibilidad (decisión del usuario 2026-10-07, opción A):** el track
y los slides son `<div>`, no `<ul>/<li>`. `li[role="group"]` viola
`aria-allowed-role` de axe (el rol `group` no está permitido en `li`) y arrastra
la regla `list`; el patrón APG de carrusel usa contenedores `<div role="group">`.
El Test 12 (`expectNoA11yViolations` sobre el track completo **cerrado**) es
inviable con `ul/li`, así que la spec adopta divs para keep axe intacto (sin
desactivar reglas). Consecuencia en tests de T2/T3 aprobados: sus aserciones
estructurales `tagName "UL"/"LI"` se actualizan a `div`+`role="group"` **como
parte de este mismo Cambio** (decisión explícita del usuario; no es debilitar —
el contrato observable, "un `group` por testimonio con nombre n of N", no cambia).

## API

```ts
import type { Testimonial } from "@data/cv.types.generated";

export interface TestimonialCarouselLabels {
  carousel: string;        // "Testimonials"
  slide: string;           // "{current} of {total}"
  goToSlide: string;       // "Go to slide {n}"
  readMore: string;        // "Read full testimonial from {author}"
  close: string;           // "Close"
}

export interface TestimonialCarouselProps {
  testimonials: readonly Testimonial[];
  labels: TestimonialCarouselLabels;
  labelledBy?: string;
  /** Se une a la clase base de la `<section>` raíz (G-B). */
  className?: string;
}
```

Interpola con la función `format` de i18n.

## Comportamiento

- **Slides por vista**: 1 (< md), 2 (≥ md). Lo resuelve CSS:
  `grid-auto-columns: 100%` → `calc((100% - var(--layout-gap)) / 2)`.
- **Scroll**: `overflow-x: auto; scroll-snap-type: x mandatory;` cada slide
  `scroll-snap-align: start`. Swipe/trackpad nativos.

### Bullets: uno por posición de scroll alcanzable

Con 2 slides por vista, no todos los testimonios pueden quedar primeros (el
último nunca llega al borde izquierdo). Por eso los bullets **no** son uno
por testimonio, sino uno por **posición a la que el track realmente puede
desplazarse** (`stop`).

Dos funciones puras en el módulo del componente, testeadas aparte:

```ts
/** Posiciones alcanzables: offset de cada slide limitado al scroll máximo, sin duplicados (tolerancia 1px), ordenadas. */
export function getScrollStops(slideOffsets: readonly number[], maxScroll: number): number[];
/** Índice del stop más cercano a scrollLeft (empate → el menor). */
export function getActiveStop(stops: readonly number[], scrollLeft: number): number;
```

- `slideOffsets` = `offsetLeft` de cada slide relativo al track;
  `maxScroll` = `track.scrollWidth - track.clientWidth`.
- Ejemplo: 3 testimonios, 2 por vista → 2 stops (posición 0 y el final).
  1 por vista → 3 stops. 2 testimonios con 2 por vista → 1 stop.
- Los stops se recalculan al montar y cuando cambia el tamaño del track
  (`ResizeObserver`).
- **Click en un bullet** → `track.scrollTo({ left: stop, behavior })`, con
  `behavior: "smooth"` solo si `prefers-reduced-motion: no-preference`.
- **Bullet activo** = `getActiveStop(stops, track.scrollLeft)`, recalculado en el
  evento `scroll` del track (limitado a un cálculo por frame con
  `requestAnimationFrame`). Lleva `aria-current="true"`.
- **Nombre del bullet**: `goToSlide` con `n` = número (1-based) del **primer
  testimonio cuyo `offsetLeft ≥ stop − 1px`** (regla fija de la decisión 21 para
  stops recortados a `maxScroll`; en el stop 0 es el testimonio 1).
- **Nombre del slide** (`slideLabel`): `current` = índice 1-based del testimonio
  en el array; `total` = `testimonials.length` (no de stops).
- **Con 1 stop o menos**: no se renderizan bullets (cubre 1 testimonio, y 2
  testimonios con 2 por vista). Con **0 testimonios**: no renderiza nada.

### Dialog

Estado `selectedId`; `onOpen(id)` de la card lo fija; `onClose` del dialog lo
limpia (ver la máquina de estados en `TestimonialDialog.md`).

## Estilos y tokens

| Parte | Valor |
|---|---|
| Track | `position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 100%; gap: var(--layout-gap); overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; padding-block: var(--testimonial-headroom) 2rem; margin: 0; scrollbar-width: none;` (≥ md: 2 columnas visibles). `position: relative` es **necesidad mecánica** del contrato "`slideOffsets` relativo al track": hace del track el `offsetParent` de las slides para que `offsetLeft` midan bien (criterio HexAvatar T2 / dialog-flex; no es un valor de diseño, va con comentario). Ya no hay `list-style` (el track es `div`, Cambio de accesibilidad) |
| Slide | `div class="slide"` (hijo directo del track): `scroll-snap-align: start;` (Comportamiento → Scroll) + `min-width: 0` (mecánico: un item de grid sin él se hincha a `min-content` y rompe columna/medición; con comentario) |
| Headroom del track | **Único lugar** que reserva espacio para el avatar de TestimonialCard: `padding-top: var(--testimonial-headroom)` (protrusión del avatar + 0.5rem de sombra; 32px < 580 → 38px). `padding-bottom: 2rem` (fijo) para que no se recorte la sombra de hover de la card. Motivo: `overflow-x: auto` también recorta el eje vertical. La card no lleva `margin-top` |
| Scrollbar | Oculta (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`): la navegación visible son los bullets |
| Paginación | `display: flex; justify-content: center; gap: 0.625rem; margin-top: var(--space-4);` |
| Bullet | `width/height: var(--size-bullet); border-radius: var(--radius-round); background: var(--color-track); border: 0;` + área táctil 24×24px lograda con **pseudo-elemento transparente** (`::after` con inset negativo), no con padding: conserva el `gap: 0.625rem` visual de la paginación (elección fijada en la pasada de Clarificación sobre el "o" de la regla; rechazable en la puerta de Plan) |
| Bullet activo | `width: var(--size-bullet-active); background: var(--gradient-accent);` transición de `width` `--duration-base` `--ease-emphasized` (el fondo cambia sin transición: un gradiente no se puede animar) |

El activo se distingue por **tamaño** (10 → 20px) además del color, porque
`--color-track` es decorativo (regla 3 de `docs/tokens/contrast.md`).

## Estados

| Estado | Efecto |
|---|---|
| Bullet hover | `background: var(--color-text-muted)` (solo inactivos) |
| Bullet focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Bullet activo | ver tabla de estilos |
| Dialog abierto | ver `TestimonialDialog.md` |

## Responsive

- < md: 1 testimonio por vista; ≥ md: 2 (cambio de columnas, sin medidas nuevas).
- El headroom escala por token (`--testimonial-headroom`).
- La cantidad de bullets cambia sola con el ancho (se recalculan los stops).

## Impresión

Los testimonios se imprimen **todos, apilados, con el texto completo**:

- Track: `display: block; overflow: visible; padding: var(--testimonial-headroom) 0 0;`
  cada slide `break-inside: avoid;` y, desde el segundo,
  `margin-top: var(--testimonial-headroom)` (espacio para el avatar).
- Paginación: `display: none`. El dialog no se imprime.
- TestimonialCard, en su propio `@media print`, quita el recorte del extracto
  (texto completo), oculta el botón estirado y la sombra (ver su spec).

## Accesibilidad

- Patrón *carousel* de WAI-ARIA: `aria-roledescription="carousel"` en la sección
  nombrada; cada slide `role="group"` + `aria-roledescription="slide"` + `aria-label` "n of N".
- Sin autoplay → no hace falta botón de pausa. Sin región `aria-live`: el cambio
  de slide no se anuncia (RF-5, decisión 21).
- Sin navegación por flechas de teclado (RF-2, decisión 21): Tab entre controles + scroll nativo.
- El foco por teclado recorre los botones de las cards (uno por slide) y luego
  los bullets; al enfocar una card fuera de vista, el navegador la desplaza.
- Los bullets son `<button type="button">` con nombre ("Go to slide n", regla de
  mapeo stop→n en Comportamiento).

## Tests esperados

jsdom no tiene layout ni `ResizeObserver`, y no implementa `scrollTo`:
mockearlos (en `src/test/setup.ts` o en el test) y fijar `offsetLeft`,
`scrollWidth`, `clientWidth` y `scrollLeft` con `Object.defineProperty`.
El recálculo de stops **por resize no se testea** (mock global no-op): QA F5
(decisión 21). El `behavior` de `scrollTo` se fija con el mock de `matchMedia`
(del `src/test/`, configurable; setup F1).

Funciones puras:

1. `getScrollStops([0, 300, 600], 300)` → `[0, 300]` (2 por vista).
2. `getScrollStops([0, 300, 600], 600)` → `[0, 300, 600]` (1 por vista).
3. `getScrollStops([0, 300], 0)` → `[0]`.
4. `getActiveStop([0, 300], 140)` → `0`; con `160` → `1`; con `150` → `0` (empate → el menor).

Componente:

5. Sección con nombre (por `aria-label` o `aria-labelledby`).
6. Un `group` por testimonio con `aria-roledescription="slide"` y nombre "n of N" (1-based, `total = testimonials.length`).
7. Con layout mockeado de 3 testimonios y 2 por vista: 2 bullets; el primero con `aria-current="true"`; nombres según la regla stop→n (Go to slide 1 / Go to slide 2).
8. Click en el bullet 2 → `track.scrollTo` con el `left` del stop 2 y `behavior` según `matchMedia.matches` (smooth / auto).
9. Evento `scroll` con `scrollLeft` en el stop 2 → el bullet 2 pasa a `aria-current="true"` y el 1 no.
10. Click en "Read full testimonial from X" → se abre el dialog con el nombre de X; cerrar → desaparece.
11. 1 stop (p. ej. 1 testimonio) → sin bullets; 0 testimonios → no renderiza nada.
12. `expectNoA11yViolations` sin violaciones (cerrado y con el dialog abierto).

## No hacer

- No instalar Swiper, Embla ni similares.
- No agregar autoplay ni loop infinito.
- No agregar flechas prev/next (el diseño usa bullets; si se quisieran, es un cambio de spec).
