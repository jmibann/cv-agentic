# Movimiento

El movimiento es sutil y funcional: transiciones de color y opacidad en
hover/foco, y una animación de entrada en el dialog. No hay animaciones de
scroll, parallax, preloader ni autoplay.

## Tokens

Escala aprobada (#106; aplicada en `c2befd1`, contrato fijado por el test de
Foundation T17).

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 0.15s | Micro-feedback (press de botón) |
| `--duration-base` | 0.2s | Microinteracciones: hover, foco, cambio de tab, chevron, dialog, bullet (antes 0.3s) |
| `--duration-slow` | 0.3s | Entrada de contenido/layout (antes 0.6s; sin usos actuales) |
| `--duration-exit` | 0.22s | Salida de contenido/layout (~73 % de slow) |
| `--duration-stagger` | 0.03s | Paso de stagger entre ítems (máx. 4 pasos; lo consume el Cambio 3) |
| `--ease-standard` | ease-in-out | Default (hover/foco reversibles) |
| `--ease-emphasized` | cubic-bezier(0.455, 0.03, 0.515, 0.955) | Ancho del bullet activo del carrusel |
| `--ease-enter` | cubic-bezier(0.22, 1, 0.36, 1) | Entradas (tabs del Cambio 2, dialog) |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Salidas |

## Catálogo

| Qué | Propiedades | Duración |
|---|---|---|
| Hover/foco de links, tabs, redes sociales | `color`, `opacity`, `text-decoration-color` (subrayado de tabs) | base |
| Hover de Button | `opacity` (→ 0.9), `box-shadow` (→ none) | base |
| Press de Button / controles | `transform: translateY(1px)` | fast |
| Hover de TestimonialCard | `box-shadow` (→ `--shadow-control`) | base |
| Chevron de "Show Contacts" (Sidebar) | `transform: rotate(180deg)` al expandir | base |
| Bullet activo del carrusel | `width` 10px → 20px (el fondo cambia sin transición: un gradiente no se anima) | base + emphasized |
| Abrir TestimonialDialog | `opacity` 0 → 1, `transform: scale(0.96)` → 1 | base |
| Expandir contactos del Sidebar (< xl) | Sin animación de altura; aparece/desaparece | — |
| Cambio de tema | Ninguna transición: `data-theme-switching` en `<html>` durante el cambio (ver Reglas) | — |

## Reglas

- Transicionar **propiedades concretas**, nunca `transition: all`.
- **Regla permanente (#116):** ninguna `transition` que **produzca animación**
  en un selector de especificidad (0,2,0) o mayor; `transition: none` está
  **excluido** — es la supresión misma, no una animación. Con esto la
  supresión del cambio de tema (`:root[data-theme-switching] *`, (0,2,0))
  gana **sin `!important`** hoy y siempre. La verifica el reviewer en cada
  entrega/Cambio.
- No animar `height`, `width` de layout ni `top/left` (salvo el bullet, que es chico
  y aislado). Preferir `transform` y `opacity`. **Única excepción a la altura
  (#106/C3, vigente desde el Cambio 3 del Sidebar):** `grid-template-rows:
  0fr ↔ 1fr` con wrapper `min-height: 0; overflow: hidden` — sin `height: auto`
  ni medición JS.
- **Cambio de tema sin transiciones (RF-9, T16):** `ThemeProvider` aplica
  `data-theme-switching` + `data-theme` + meta `theme-color` en un único
  `useLayoutEffect`; el atributo va a `<html>` **antes** del nuevo tema y se
  quita tras dos `requestAnimationFrame` (cleanup en desmontaje y re-cambio;
  el montaje inicial no lo aplica). En `global.css`,
  `:root[data-theme-switching] *` + `::before`/`::after` fijan
  `transition: none` sin `!important` (especificidad (0,2,0)).
- **`prefers-reduced-motion: reduce`**: `tokens.css` lleva las **cinco**
  duraciones a 0.01ms; como los delays de stagger se derivan de
  `--duration-stagger`, quedan anulados también (sin fundidos ni escalonados).
  Cualquier `scroll-behavior: smooth` debe ir dentro de
  `@media (prefers-reduced-motion: no-preference)`.
- El cambio de tema no anima: al alternar, los colores cambian en el mismo frame.
