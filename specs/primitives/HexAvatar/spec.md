# HexAvatar
Estado: implementada

## Propósito

Avatar con forma de **hexágono vertical de esquinas redondeadas**, con un
contorno del color de la superficie y sombra. Es la **única** implementación
de esa forma: la usan `TestimonialCard` y `TestimonialDialog`.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe `src`, ENTONCES EL SISTEMA renderiza un `<img>` recortado al hexágono interior.
- RF-2: MIENTRAS no se pase `alt`, EL SISTEMA trata la imagen como decorativa (`alt=""`); SI se pasa `alt`, ENTONCES ese texto queda como nombre accesible.
- RF-3: EL SISTEMA aplica dos `clipPath` distintos (`hex-avatar-outer` y `hex-avatar-inner`, geometría en "Forma") definidos en `HexAvatarDefs`, exportado por este módulo; el montaje único en la app lo garantiza AppLayout (RF-6 de su spec).
- RF-4: EL SISTEMA aplica la sombra con `filter: drop-shadow` en el contenedor raíz, nunca con `box-shadow` (inspección del CSS: jsdom no computa `filter`).
- RF-5: EL SISTEMA mantiene el tamaño fijo en todos los breakpoints y no expone estados interactivos (inspección + axe).

## Anatomía

```html
<span class="wrap">                 <!-- drop-shadow (respeta el recorte) -->
  <span class="border">             <!-- hexágono exterior, color de contorno -->
    <img class="image" src alt="" /> <!-- hexágono interior, recorta la foto -->
  </span>
</span>
```

## API

```ts
export interface HexAvatarProps {
  src: string;
  /** Default "". En card y dialog el nombre está al lado: la imagen es decorativa. */
  alt?: string;
  /** Se une a la clase base del `wrap` (elemento raíz). */
  className?: string;
}
```

## Estilos y tokens

| Parte | Valor |
|---|---|
| Wrap | `display: inline-block; width: fit-content; filter: var(--filter-avatar-drop);` |
| Contorno | `width: var(--size-testimonial-avatar-w); height: var(--size-testimonial-avatar-h); background: var(--color-surface);` recortado con `clip-path: url(#hex-avatar-outer)` |
| Imagen | `position: relative; top: 0.25rem; left: 0.25rem; width: calc(var(--size-testimonial-avatar-w) - 0.5rem); height: calc(var(--size-testimonial-avatar-h) - 0.5rem); object-fit: cover; background: var(--color-track);` recortada con `clip-path: url(#hex-avatar-inner)` |

### Forma

- Hexágono **vertical** (punta arriba y abajo) en caja de 80 × 88, con esquinas redondeadas.
- **Geometría fija (no queda a criterio del builder)**; coordenadas normalizadas para `clipPathUnits="objectBoundingBox"`:

| clipPath | Caja | Vértices (px) | Normalizado (x, y) |
|---|---|---|---|
| `hex-avatar-outer` | 80 × 88 | (40,0) (80,22) (80,66) (40,88) (0,66) (0,22) | (0.5,0) (1,0.25) (1,0.75) (0.5,1) (0,0.75) (0,0.25) |
| `hex-avatar-inner` | 72 × 80 (caja propia) | (36,0.57) (72,20.37) (72,59.63) (36,79.43) (0,59.63) (0,20.37) | (0.5,0.0071) (1,0.2546) (1,0.7454) (0.5,0.9929) (0,0.7454) (0,0.2546) |

- `hex-avatar-inner` es el **inset geométrico real de 4 px** del outer (cada lado
  paralelo desplazado 4 px hacia adentro; vértices = intersecciones), **no un
  escalado**: con un único `clipPath` escalado el borde no quedaría uniforme (las
  proporciones 80:88 y 72:80 difieren). El anillo del contorno es de 4 px en los
  tramos rectos.
- Radios de esquina: outer 6 px (normalizado rx ≈ 0.075 / ry ≈ 0.068);
  inner 2 px (rx ≈ 0.028 / ry = 0.025) — el radio del path interno es el
  resultante del inset, no un valor libre.
- El agente escribe el `d` final de ambos paths según estos datos y lo documenta
  en un comentario (no copia el `clip-path` del tema de referencia).
- Ambos `clipPath` viven en `HexAvatarDefs`, exportado desde este módulo; su
  montaje junto a `AccentGradientDefs` en AppLayout y la unicidad del montaje son
  responsabilidad de AppLayout (RF-6 de su spec).
- El `<svg>` de `HexAvatarDefs` es invisible por tamaño
  (`width="0" height="0"`, `position: absolute`), **nunca con
  `display: none`**. Los tests de componentes que usan HexAvatar montan
  también `HexAvatarDefs`.
- **Safari:** **no** se agrega `-webkit-clip-path` por ahora. La QA visual de F5
  verifica `clip-path: url(#…)` sobre HTML en Safari; si falla, el usuario decide
  el fallback (prefijo o SVG por avatar).
- La sombra va en el wrap con `filter: drop-shadow` porque `box-shadow` no
  respeta el recorte.

## Estados

No es interactivo. Sin estado de error definido: si la imagen falla o es
transparente queda visible el fondo `--color-track` del `<img>` como placeholder
(no hay `onError`; no testeable en jsdom).

## Responsive

Tamaño fijo en todos los breakpoints (el posicionamiento lo decide quien lo usa).

## Accesibilidad

- `alt` por defecto vacío: decorativa. Si algún uso futuro la muestra sin el
  nombre al lado, debe pasar un `alt` descriptivo.

## Tests esperados

1. Renderiza un `img` con el `src` recibido.
2. Sin `alt` → `alt=""` (la imagen no aparece en `getByRole("img")`).
3. Con `alt="Foto de X"` → `getByRole("img", { name: "Foto de X" })`.
4. Concatena `className` en el `wrap` raíz (RF implícita en la API; aserción con el criterio de CSS Modules de la fase).
5. Contorno e imagen llevan sus clases del módulo (aserción de clase). Que cada una referencie `url(#hex-avatar-outer)` / `url(#hex-avatar-inner)` se verifica por **inspección del `.module.css`** (jsdom no aplica `clip-path`).
6. `HexAvatarDefs` renderiza dos `clipPath` con ids `hex-avatar-outer` e `hex-avatar-inner`.
7. `expectNoA11yViolations` sin violaciones.

## No hacer

- No reimplementar el hexágono en TestimonialCard ni TestimonialDialog.
- No usar `box-shadow` para la sombra.
