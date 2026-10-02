# Movimiento

El movimiento es sutil y funcional: transiciones de color y opacidad en
hover/foco, y una animación de entrada en el dialog. No hay animaciones de
scroll, parallax, preloader ni autoplay.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 0.15s | Micro-feedback (press de botón) |
| `--duration-base` | 0.3s | Hover, foco, cambio de tab, color de tema |
| `--duration-slow` | 0.6s | Reservado (no usar sin justificar en la spec) |
| `--ease-standard` | ease-in-out | Default |
| `--ease-emphasized` | cubic-bezier(0.455, 0.03, 0.515, 0.955) | Ancho del bullet activo del carrusel |

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
| Cambio de tema | Ninguna transición global (evita que todo "parpadee") | — |

## Reglas

- Transicionar **propiedades concretas**, nunca `transition: all`.
- No animar `height`, `width` de layout ni `top/left` (salvo el bullet, que es chico
  y aislado). Preferir `transform` y `opacity`.
- **`prefers-reduced-motion: reduce`**: `tokens.css` lleva las duraciones a
  0.01ms. Además, cualquier `scroll-behavior: smooth` debe ir dentro de
  `@media (prefers-reduced-motion: no-preference)`.
- El cambio de tema no anima: al alternar, los colores cambian en el mismo frame.
