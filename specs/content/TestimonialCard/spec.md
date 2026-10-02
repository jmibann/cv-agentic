# TestimonialCard
Estado: aprobada

## Propósito

Tarjeta de testimonio en el carrusel: avatar hexagonal que sobresale arriba,
nombre, rol, extracto del texto y un ícono de comilla. Toda la tarjeta es
clickeable y abre el texto completo en `TestimonialDialog`.

## Requisitos (EARS)

- RF-1: CUANDO el usuario activa el botón estirado (click, Enter o Espacio), ENTONCES EL SISTEMA invoca `onOpen(testimonial.id)`; EL SISTEMA mantiene ese botón como único elemento enfocable de la tarjeta, con `aria-label` igual a `openLabel`, y el `<article>` no es clickeable.
- RF-2: EL SISTEMA recorta el extracto a 4 líneas en pantalla y en `@media print` muestra el texto completo, oculta el botón estirado y quita la sombra.
- RF-3: EL SISTEMA reserva el espacio del avatar que sobresale mediante `--testimonial-headroom` en el contenedor que aloja la tarjeta.
- RF-4: EL SISTEMA usa `HexAvatar` con `alt=""` y trata la comilla como decorativa; no reimplementa el hexágono ni muestra fecha.
- RF-5: EL SISTEMA aplica en hover la sombra `--shadow-control` y en el foco visible el anillo de foco estándar sobre el `::after` del botón.
- RF-6: EL SISTEMA no declara `@media` propios: padding, subida del avatar y posición de la comilla escalan con tokens `--testimonial-*`.

## Anatomía

```
   ⬡⬡⬡
  ⬡ av ⬡  María González              ❝   ← comilla con gradiente (arriba-derecha)
   ⬡⬡⬡   Product Manager, Acme Corp
  Alex consistently delivered high-quality work and made
  complex features feel simple for our users…             ← recortado a 4 líneas
```

```html
<article class="card" aria-labelledby="testimonial-t-maria-name">
  <div class="header">                                                 <!-- grilla auto | 1fr -->
    <HexAvatar src={testimonial.avatar.src} className="avatar" />     <!-- alt="" por defecto -->
    <div class="identity">
      <h3 id="testimonial-t-maria-name" class="name">María González</h3>
      <p class="role">Product Manager, Acme Corp</p>
    </div>
  </div>
  <p class="excerpt">Alex consistently…</p>
  <Icon name="quote" tone="gradient" className="quote" />
  <button type="button" class="stretched" aria-label="Read full testimonial from María González"></button>
</article>
```

El `<button>` cubre toda la tarjeta con `::after` (patrón *stretched link*):
un `<button>` no puede contener headings, así que el heading queda fuera y el
botón se estira por encima.

## API

```ts
import type { Testimonial } from "@data/cv.types.generated";

export interface TestimonialCardProps {
  testimonial: Testimonial;
  /** "Read full testimonial from {author}", ya interpolado. */
  openLabel: string;
  onOpen: (id: string) => void;
  className?: string;
}
```

## Estilos y tokens

| Parte | Valor |
|---|---|
| Card | `position: relative; display: flex; flex-direction: column; background: var(--color-surface-muted); border-radius: var(--radius-16); padding: var(--testimonial-padding); height: 100%;` (16px < 580 → 30/30/24px). **Sin `margin-top`** |
| Avatar | `HexAvatar` con `margin-top: calc(var(--testimonial-avatar-offset) * -1);` (sube 40px < 580 → 60px) |
| Encabezado | `display: grid; grid-template-columns: auto 1fr; column-gap: 0.9375rem; align-items: end; margin-bottom: 0.75rem;` (avatar en la columna 1, nombre y rol en la 2; sin márgenes negativos) |
| Nombre | h3: `--font-size-h3`; `margin: 0;` |
| Rol | `color: var(--color-text-muted); margin: 0;` |
| Extracto | `display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; margin: 0;` |
| Comilla | `Icon name="quote" tone="gradient" className={styles.quote}` con `.quote { --icon-size: 2rem; … }` (en la clase del propio ícono); `position: absolute; top: var(--testimonial-quote-inset-block); right: var(--testimonial-quote-inset-inline);` |
| Botón estirado | `position: static; background: none; border: 0;` `::after { content: ""; position: absolute; inset: 0; border-radius: inherit; }`; `cursor: pointer` |

### Espacio para el avatar (headroom)

El avatar sobresale por encima del borde superior de la card
`--testimonial-avatar-offset − --testimonial-padding-top` (30px ≥ 580,
24px < 580). La card **no reserva ese espacio**: lo reserva el contenedor que
la aloja, usando el token `--testimonial-headroom` (= esa protrusión + 0.5rem
para la sombra). En el carrusel es el `padding-top` del track (ver
`TestimonialCarousel.md`). Si la card se usa fuera del carrusel, el padre
debe aplicar ese mismo token.

La forma hexagonal la resuelve la primitiva `HexAvatar`
(`specs/primitives/HexAvatar.md`): no se reimplementa acá.

## Estados

| Estado | Efecto |
|---|---|
| Hover (sobre la card) | `box-shadow: var(--shadow-control)` con transición de `box-shadow` `--duration-base` |
| Focus-visible (botón) | en el `::after` del botón: `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active | sin efecto propio |

## Responsive

Sin `@media` propios: padding, subida del avatar y posición de la comilla
escalan por tokens (`--testimonial-*`).

## Impresión

En `@media print` (lo usa el carrusel al imprimir los testimonios apilados):
el extracto muestra el **texto completo** (`display: block; -webkit-line-clamp: unset; overflow: visible;`),
el botón estirado se oculta (`display: none`) y la card no lleva sombra.

## Accesibilidad

- `<article>` nombrado por el h3.
- Avatar con `alt=""`: el nombre está al lado, anunciarlo dos veces es ruido.
- El botón tiene nombre explícito (`openLabel`) y es lo único enfocable de la tarjeta.
- La comilla es decorativa.

## Tests esperados

1. `getByRole("article", { name: author })` con heading nivel 3.
2. Muestra rol y texto.
3. `getByRole("button", { name: openLabel })`; click → `onOpen(testimonial.id)`.
4. Enter y Espacio sobre el botón llaman `onOpen`.
5. La imagen del avatar tiene `alt=""` (decorativa) y se renderiza con `HexAvatar` (el test monta `HexAvatarDefs` y `AccentGradientDefs`).
6. `expectNoA11yViolations` sin violaciones.

## No hacer

- No envolver la tarjeta completa en `<button>` ni poner `onClick` en el `<article>`.
- No mostrar fecha (decisión: los testimonios no llevan fecha).
- No reimplementar el hexágono: usar `HexAvatar`.
