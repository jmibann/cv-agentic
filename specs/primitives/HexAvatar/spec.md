# HexAvatar
Estado: aprobada

## Propósito

Avatar con forma de **hexágono vertical de esquinas redondeadas**, con un
contorno del color de la superficie y sombra. Es la **única** implementación
de esa forma: la usan `TestimonialCard` y `TestimonialDialog`.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe `src`, ENTONCES EL SISTEMA renderiza un `<img>` recortado al hexágono interior.
- RF-2: MIENTRAS no se pase `alt`, EL SISTEMA trata la imagen como decorativa (`alt=""`); SI se pasa `alt`, ENTONCES ese texto queda como nombre accesible.
- RF-3: EL SISTEMA aplica dos `clipPath` distintos (`hex-avatar-outer` 80×88 y `hex-avatar-inner` 72×80) definidos en `HexAvatarDefs` y montados una sola vez en la app.
- RF-4: SI se usara un único `clipPath` escalado para ambas cajas, ENTONCES el borde no quedaría uniforme; por eso cada path se dibuja para su caja.
- RF-5: EL SISTEMA aplica la sombra con `filter: drop-shadow` en el contenedor raíz, nunca con `box-shadow`.
- RF-6: EL SISTEMA mantiene el tamaño fijo en todos los breakpoints y no expone estados interactivos.

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

- Hexágono **vertical** (punta arriba y abajo), proporción 80 × 88, esquinas
  redondeadas de ≈ 6px.
- El agente dibuja **su propio path** (no se copia el `clip-path` del tema de
  referencia) y lo documenta en un comentario del CSS.
- **Dos `clipPath`** (`clipPathUnits="objectBoundingBox"`, coordenadas 0–1)
  en un componente `HexAvatarDefs` exportado desde este módulo y montado
  **una vez** en AppLayout junto a `AccentGradientDefs`:
  - `hex-avatar-outer`: el hexágono para el contorno (80 × 88).
  - `hex-avatar-inner`: el mismo hexágono **dibujado para 72 × 80** (inset
    exacto de 4px por lado), para la imagen.
  Con un único `clipPath` escalado, el borde no queda uniforme (la
  proporción del contorno y la de la imagen difieren). Cada path se escribe
  para su caja; el agente documenta ambos en un comentario.
- El `<svg>` de `HexAvatarDefs` es invisible por tamaño
  (`width="0" height="0"`, `position: absolute`), **nunca con
  `display: none`**. Los tests de componentes que usan HexAvatar montan
  también `HexAvatarDefs`.
- **Safari:** `clip-path: url(#…)` sobre elementos HTML se verifica en la QA
  visual (si falla, fallback: `-webkit-clip-path` o pasar a SVG por avatar,
  decisión del usuario).
- La sombra va en el wrap con `filter: drop-shadow` porque `box-shadow` no
  respeta el recorte.

## Estados

No es interactivo.

## Responsive

Tamaño fijo en todos los breakpoints (el posicionamiento lo decide quien lo usa).

## Accesibilidad

- `alt` por defecto vacío: decorativa. Si algún uso futuro la muestra sin el
  nombre al lado, debe pasar un `alt` descriptivo.

## Tests esperados

1. Renderiza un `img` con el `src` recibido.
2. Sin `alt` → `alt=""` (la imagen no aparece en `getByRole("img")`).
3. Con `alt="Foto de X"` → `getByRole("img", { name: "Foto de X" })`.
4. Concatena `className` en el elemento raíz.
5. Contorno e imagen referencian `hex-avatar-outer` e `hex-avatar-inner` (clase CSS; verificar en el módulo, jsdom no aplica `clip-path`).
6. `HexAvatarDefs` renderiza dos `clipPath` con esos ids.
7. `expectNoA11yViolations` sin violaciones.

## No hacer

- No reimplementar el hexágono en TestimonialCard ni TestimonialDialog.
- No usar `box-shadow` para la sombra.
