# Plan — TestimonialCarousel

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/TestimonialCarousel/getScrollStops.ts` | puras `getScrollStops(slideOffsets, maxScroll)` (clamp + dedup 1px + orden) y `getActiveStop(stops, scrollLeft)` (más cercano; empate → menor) | RF-3, RF-5 |
| `src/components/TestimonialCarousel/getScrollStops.test.ts` | 4 casos de la spec (funciones puras) | RF-3, RF-5 |
| `src/components/TestimonialCarousel/TestimonialCarousel.tsx` | `<section aria-roledescription="carousel">` única (RF-1/decisión 20), track grid+snap con slides `role="group"` "n of N", bullets por stops (`goToSlide` interpolado con regla stop→n), `selectedId` + `TestimonialDialog` único, `format` de i18n | RF-1,RF-2,RF-3,RF-4,RF-5,RF-6,RF-8 |
| `src/components/TestimonialCarousel/TestimonialCarousel.module.css` | track (`grid-auto-flow/columns`, `--layout-gap`, `overflow-x`, `scroll-snap`, `overscroll-behavior-x`, `padding-block: var(--testimonial-headroom) 2rem`, scrollbar oculta), slide (snap-align, width ≥ md por `/2`), paginación, bullet (`--size-bullet`, activo `--size-bullet-active` + `--gradient-accent`, hover muted, focus ring, `::after` táctil 24×24), `@media print` apilado + paginación oculta | RF-2,RF-7,RF-8 |
| `src/components/TestimonialCarousel/TestimonialCarousel.test.tsx` | tests + cierre a11y | todas |
| `src/components/TestimonialCarousel/index.ts` | re-export (`TestimonialCarousel`, tipos; `getScrollStops`/`getActiveStop` quedan en archivo propio, sin re-export necesario) | — |

## Funciones puras y algoritmo

- `getScrollStops`: `slideOffsets.map(o => Math.min(o, maxScroll))` → dedup con tolerancia 1px (mantiene menor) → asc. Casos de la spec fijados.
- `getActiveStop`: argmin por distancia a `scrollLeft`; empate → índice menor (caso 4).
- Nombre del bullet (decisión 21): `bulletNumber(stop) = testimonios.findIndex(t => t.offsetLeft >= stop - 1) + 1` (1-based; implementado donde se leen offsets en el componente — no es pura pura por el DOM; se documenta en el `.tsx`).

## Interfaz

`TestimonialCarouselProps { testimonials; labels: TestimonialCarouselLabels; labelledBy?; className? }` (spec → API; `className` a la `<section>` raíz, G-B). Interpolación con `format` de `src/i18n/format.ts` (slide `current` 1-based/`total = length`; `goToSlide {n}` por la regla de arriba; `readMore {author}` por card, ya pasado a la card como `openLabel`).

## Decisiones

- **State interno:** `selectedId: string | null` (RF-6); `onOpen(id)` lo fija, `onClose` → null; el `testimonial` del dialog se deriva (`find`). Sin valor→valor (RF-6 + ciclo del dialog).
- **Stops en layout:** medición `offsetLeft` de slides y `scrollWidth/clientWidth` del track en effect tras mount (rAF o post-render; sin ResizeObserver test unitario → QA F5, decisión 21). En jsdom se fijan con `Object.defineProperty` en los tests; el mock de `scrollTo` local (`vi.fn`) basta.
- **`behavior` (RF-4):** `window.matchMedia("(prefers-reduced-motion: no-preference)").matches ? "smooth" : "auto"` leído en el click (sin estado vivo; mock de setup da `matches=false` → "auto"; el caso smooth con stub local del test).
- **rAF por frame** en el handler `scroll` (RF-5): cancelar con `cancelAnimationFrame`/flag en cleanup.
- **Sin flechas de teclado, sin aria-live** (decisión 21): se documenta en el componente con comentario que cite la spec.
- Slides `<li role="group">` dentro de `<ul class="track">` (anatomía); `list-style: none` en el módulo.
- Print: el apilado vive en el `@media print` **propio del carrusel** (RF-8; la regla la fija su spec: track block, slide `break-inside`, margen, paginación oculta) — coherente con G-D: es el contrato declarado de esta pieza.

## Estrategia de tests

Funciones puras: 4 casos exactos (tests 1–4). Componente: fixture 3 testimonios (ids `t-a`/`t-b`/`t-c`); mock layout (offsets [0,300,600], scrollWidth 900, clientWidth 600 → 2 stops; y variante 1/vista). `scrollTo` mockeado sobre el track (`Object.defineProperty(el,"scrollTo")`). Tests 5–12 de la spec, con `aria-current` inicial en el bullet del stop 0, `user-event` en bullets, `fireEvent.scroll` para el activo, y test 10: click "Read full testimonial from …" → dialog con autor; cerrar → desaparece (usa `TestimonialDialog` real con el mock F1 de dialog; armazón `HexAvatarDefs`+`AccentGradientDefs`). Cierre `expectNoA11yViolations` (cerrado y dialog abierto). P1: snap/columns/print/bullet táctil → inspección + QA F5.

Cobertura: T1→(puras) · T2→RF-1,RF-6 · T3→RF-3,RF-5 · T4→RF-4 · T5→RF-2,RF-7,RF-8 + cierre.
