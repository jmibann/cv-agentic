# Button

## Propósito

Acción principal con el gradiente de acento. En este alcance se usa para
"Download CV" (link) y está disponible para otros usos.

## Anatomía

`<button>` o `<a>` (si recibe `href`) con: ícono opcional + label. Un
pseudo-elemento `::before` agrega un brillo difuso bajo el botón.

## API

```ts
import type { IconName } from "../Icon";

interface CommonProps {
  children: React.ReactNode;
  size?: "default" | "small";         // default "default"
  icon?: IconName;
  iconPosition?: "start" | "end";      // default "start"
  fullWidth?: boolean;                  // default false
  className?: string;
}

export type ButtonProps =
  | (CommonProps & { href?: undefined; type?: "button" | "submit"; onClick?: () => void; disabled?: boolean })
  | (CommonProps & { href: string; download?: boolean | string; target?: "_blank"; rel?: string });
```

- Con `href` → `<a>`; con `target="_blank"` agrega `rel="noopener noreferrer"` si no se pasó.
- Sin `href` → `<button type="button">` por defecto.

## Estilos y tokens

| Parte | default | small |
|---|---|---|
| Fondo | `--gradient-accent` | igual |
| Texto | `--color-on-accent`, `--font-weight-regular`, `--font-size-button` | `--font-size-small` |
| Padding | `var(--button-padding-block) var(--button-padding-inline)` (12/18px < 580 → 15/32px) | `0.625rem 1rem` (fijo) |
| Radio | `--radius-20` | igual |
| Sombra | `--shadow-accent` | igual |
| Brillo `::before` | `box-shadow: var(--shadow-accent-glow)`, alto 1rem, ancho 64%, centrado abajo, `z-index: var(--z-below)` (el botón crea su propio contexto de apilamiento con `position: relative; z-index: var(--z-base)` para que el brillo no quede detrás de la card) | sin brillo |
| Ícono | `gap: 0.375rem` entre ícono y texto | `gap: 0.5rem` |

- `display: inline-flex; align-items: center; justify-content: center;`
- `fullWidth` → `width: 100%`.
- Borde: ninguno. Cursor pointer.

## Estados

| Estado | Efecto |
|---|---|
| Hover | `opacity: 0.9` (contraste registrado en `docs/tokens/contrast.md`: ≥ 4.92:1); sombra y brillo → `none` (transición `--duration-base`) |
| Active | `transform: translateY(1px)` (`--duration-fast`) |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` + `--shadow-accent-focus` |
| Disabled (solo `<button>`) | `opacity: 0.5; cursor: not-allowed;` sin hover. Exento de contraste (WCAG 1.4.3, componente inactivo; ver `docs/tokens/contrast.md`) |

## Responsive

Resuelto por tokens (`--button-padding-*`, `--font-size-button`). El
componente no tiene `@media` propios.

## Accesibilidad

- El texto visible es el nombre accesible; el ícono es decorativo (`Icon` sin `label`).
- `download` en links de archivo; si abre en pestaña nueva, el label debería
  indicarlo (lo resuelve quien lo usa).

## Tests esperados

- Sin `href`: `getByRole("button", { name })`, `type="button"` por defecto.
- Con `href`: `getByRole("link", { name })` con ese `href`.
- `target="_blank"` agrega `rel="noopener noreferrer"`.
- `onClick` se llama al hacer click; no se llama si `disabled`.
- `icon` renderiza un svg `aria-hidden` y el nombre accesible sigue siendo solo el texto.
- `size="small"` y `fullWidth` aplican sus clases.
- `expectNoA11yViolations` sin violaciones (button y link).

## No hacer

- No usar `color: #fff`: siempre `--color-on-accent` (en oscuro el texto es oscuro).
- No `transition: all`.
