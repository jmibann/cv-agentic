# ControlsBar
Estado: aprobada

## Propósito

Barra chica **arriba de las cards, alineada a la derecha y fuera de ellas**,
con los controles de visualización: ThemeToggle y LanguageSwitcher. Ocupa la
parte inferior del espacio `--gutter-top` y se ve igual en todos los breakpoints.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza la barra fuera de las cards, alineada a la derecha, ocupando la parte inferior del espacio `--gutter-top`.
- RF-2: EL SISTEMA expone un landmark `<header>` (banner) único de página con un grupo nombrado dentro.
- RF-3: CUANDO cambia el idioma de la interfaz, ENTONCES EL SISTEMA actualiza los labels traducidos de ThemeToggle y LanguageSwitcher.
- RF-4: EL SISTEMA coloca ControlsBar entre los primeros elementos del orden de tabulación, inmediatamente después del skip link.
- RF-5: EL SISTEMA mantiene el contraste del texto sobre `--color-bg` usando `--color-text` y nunca `--color-text-muted`.
- RF-6: EL SISTEMA se muestra igual en todos los breakpoints: solo el `gap` escala, con token y sin `@media` propios.

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

## No hacer

- No ubicarla dentro de las cards: va arriba, a la derecha y fuera de ellas.
- No usar `--color-text-muted` para texto: está sobre `--color-bg` (`docs/tokens/contrast.md`).
- No agregar otro landmark `<header>`: el banner es único en la página.
- No agregar `@media` propios: solo el `gap` escala, por `--controls-gap`.
