# TestimonialCarousel
Estado: aprobada

## Propósito

Carrusel horizontal de testimonios con scroll-snap nativo, bullets de
paginación y un único `TestimonialDialog` para ver el texto completo. Sin
librerías (reemplaza Swiper) y **sin autoplay**.

## Requisitos (EARS)

- RF-1: CUANDO `testimonials` contiene elementos, ENTONCES EL SISTEMA renderiza una sección nombrada con un slide por testimonio; SI `testimonials` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA desplaza el track con `overflow-x` y `scroll-snap-type` nativos (sin librerías), y no implementa autoplay, loop ni flechas prev/next.
- RF-3: EL SISTEMA renderiza un bullet por cada posición alcanzable (`getScrollStops`), no uno por testimonio, recalculándolos al montar y al cambiar el tamaño del track; SI hay un stop o menos, ENTONCES no renderiza bullets.
- RF-4: CUANDO el usuario pulsa un bullet, ENTONCES EL SISTEMA llama `track.scrollTo` con el `left` de ese stop, usando `behavior: "smooth"` solo si `prefers-reduced-motion` es `no-preference`.
- RF-5: EL SISTEMA marca `aria-current="true"` en el bullet activo según `getActiveStop(stops, scrollLeft)`, recalculado en el evento `scroll` con un cálculo por frame.
- RF-6: EL SISTEMA mantiene un único `TestimonialDialog`: `onOpen(id)` de la card fija el estado seleccionado y `onClose` lo limpia.
- RF-7: EL SISTEMA reserva el espacio del avatar con `padding-block: var(--testimonial-headroom)` en el track (único lugar que lo hace) y oculta la scrollbar.
- RF-8: EL SISTEMA imprime los testimonios apilados con el texto completo y la paginación oculta, y escala el responsive solo con columnas y tokens (sin medidas literales en `@media`).

## Anatomía

```html
<section aria-roledescription="carousel" aria-label="Testimonials">
  <ul class="track">                                 <!-- overflow-x: auto + scroll-snap -->
    <li role="group" aria-roledescription="slide" aria-label="1 of 3" class="slide">
      <TestimonialCard … />
    </li>
    …
  </ul>
  <div class="pagination">                          <!-- bullets -->
    <button aria-label="Go to slide 1" aria-current="true"></button>
    <button aria-label="Go to slide 2"></button>
    …
  </div>
  <TestimonialDialog testimonial={selected} onClose={…} closeLabel="Close" />
</section>
```

Cuando la sección tiene un h2 visible encima (AboutPage), se usa
`aria-labelledby` con el id del h2 en lugar de `aria-label`.

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
- **Bullet activo** = `getActiveStop(stops, track.scrollLeft)`, recalculado en
  el evento `scroll` del track (limitado a un cálculo por frame con
  `requestAnimationFrame`). Lleva `aria-current="true"`.
- **Nombre del bullet**: `goToSlide` con `n` = número del primer testimonio
  visible en esa posición (1-based).
- **Con 1 stop o menos**: no se renderizan bullets (cubre 1 testimonio, y 2
  testimonios con 2 por vista). Con **0 testimonios**: no renderiza nada.

### Dialog

Estado `selectedId`; `onOpen(id)` de la card lo fija; `onClose` del dialog lo
limpia (ver la máquina de estados en `TestimonialDialog.md`).

## Estilos y tokens

| Parte | Valor |
|---|---|
| Track | `display: grid; grid-auto-flow: column; grid-auto-columns: 100%; gap: var(--layout-gap); overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; padding-block: var(--testimonial-headroom) 2rem; list-style: none; margin: 0; scrollbar-width: none;` (≥ md: 2 columnas visibles) |
| Headroom del track | **Único lugar** que reserva espacio para el avatar de TestimonialCard: `padding-top: var(--testimonial-headroom)` (protrusión del avatar + 0.5rem de sombra; 32px < 580 → 38px). `padding-bottom: 2rem` (fijo) para que no se recorte la sombra de hover de la card. Motivo: `overflow-x: auto` también recorta el eje vertical. La card no lleva `margin-top` |
| Scrollbar | Oculta (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`): la navegación visible son los bullets |
| Paginación | `display: flex; justify-content: center; gap: 0.625rem; margin-top: var(--space-4);` |
| Bullet | `width/height: var(--size-bullet); border-radius: var(--radius-round); background: var(--color-track); border: 0;` + área táctil de 24×24px con padding transparente o pseudo-elemento |
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
- Sin autoplay → no hace falta botón de pausa.
- El foco por teclado recorre los botones de las cards (uno por slide) y luego
  los bullets; al enfocar una card fuera de vista, el navegador la desplaza.
- Los bullets son `<button type="button">` con nombre ("Go to slide n").

## Tests esperados

jsdom no tiene layout ni `ResizeObserver`, y no implementa `scrollTo`:
mockearlos (en `src/test/setup.ts` o en el test) y fijar `offsetLeft`,
`scrollWidth`, `clientWidth` y `scrollLeft` con `Object.defineProperty`.

Funciones puras:

1. `getScrollStops([0, 300, 600], 300)` → `[0, 300]` (2 por vista).
2. `getScrollStops([0, 300, 600], 600)` → `[0, 300, 600]` (1 por vista).
3. `getScrollStops([0, 300], 0)` → `[0]`.
4. `getActiveStop([0, 300], 140)` → `0`; con `160` → `1`; con `150` → `0` (empate → el menor).

Componente:

5. Sección con nombre (por `aria-label` o `aria-labelledby`).
6. Un `group` por testimonio con `aria-roledescription="slide"` y nombre "n of N".
7. Con layout mockeado de 3 testimonios y 2 por vista: 2 bullets; el primero con `aria-current="true"`.
8. Click en el bullet 2 → `track.scrollTo` con el `left` del stop 2.
9. Evento `scroll` con `scrollLeft` en el stop 2 → el bullet 2 pasa a `aria-current="true"` y el 1 no.
10. Click en "Read full testimonial from X" → se abre el dialog con el nombre de X; cerrar → desaparece.
11. 1 stop (p. ej. 1 testimonio) → sin bullets; 0 testimonios → no renderiza nada.
12. `expectNoA11yViolations` sin violaciones (cerrado y con el dialog abierto).

## No hacer

- No instalar Swiper, Embla ni similares.
- No agregar autoplay ni loop infinito.
- No agregar flechas prev/next (el diseño usa bullets; si se quisieran, es un cambio de spec).
