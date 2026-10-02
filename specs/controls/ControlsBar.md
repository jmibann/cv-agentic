# ControlsBar

## Propósito

Barra chica **arriba de las cards, alineada a la derecha y fuera de ellas**,
con los controles de visualización: ThemeToggle y LanguageSwitcher. Ocupa la
parte inferior del espacio `--gutter-top` y se ve igual en todos los breakpoints.

## Anatomía

```
                                              [☾]  [EN|ES]
┌──────────── cards ────────────────────────────────────────┐
```

```html
<header class="controlsBar">
  <div role="group" aria-label="Display settings">
    <ThemeToggle />
    <LanguageSwitcher />
  </div>
</header>
```

## API

```ts
export interface ControlsBarProps {
  className?: string;
}
```

Consume `useLocale()` para pasar los labels traducidos a sus hijos
(`t.controls.darkMode`, `t.controls.language`, `t.controls.label`).

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Layout | `display: flex; justify-content: flex-end; align-items: center; gap: var(--controls-gap);` (8px < 580 → 12px) |
| Alto | `var(--size-control)` |
| Capa | `position: relative; z-index: var(--z-controls);` |
| Posición vertical | La define AppLayout (ver `foundations/layout.md`) |

- Está sobre `--color-bg`: cualquier texto usa `--color-text` (nunca
  `--color-text-muted`; ver `docs/tokens/contrast.md`). Los controles llevan su
  propio fondo `surface-raised`, así que el contraste interno no depende del fondo.

## Estados

Sin estados propios: los de ThemeToggle y LanguageSwitcher.

## Responsive

Igual en todos los tamaños; solo el `gap` escala, por token (`--controls-gap`). Sin `@media` propios.

## Accesibilidad

- Landmark `<header>` a nivel de página (banner). Solo hay uno.
- Grupo con nombre ("Display settings" / "Ajustes de visualización").
- Orden de tabulación: es lo primero después del skip link.

## Tests esperados

- Renderiza un `banner` que contiene un `group` con nombre traducido.
- Contiene el ThemeToggle y el LanguageSwitcher (por rol y nombre).
- Al cambiar el idioma a `es`, los labels de los controles cambian al español.
- `expectNoA11yViolations` sin violaciones.
