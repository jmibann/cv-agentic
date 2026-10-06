# ControlsBar
Estado: aprobada

## Propósito

Barra chica **arriba de las cards, alineada a la derecha y fuera de ellas**,
con los controles de visualización: ThemeToggle y LanguageSwitcher. Ocupa la
parte inferior del espacio `--gutter-top` y se ve igual en todos los breakpoints.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza la barra con `justify-content: flex-end`, alto `--size-control` y los controles alineados a la derecha, **fuera de las cards**; la posición vertical dentro del espacio `--gutter-top` y el ancho del `<header>` (full-width) los define AppLayout (tabla → Posición vertical). Verificación: inspección del CSS de la pieza; layout de página en F4/F5.
- RF-2: EL SISTEMA expone un landmark `<header>` (banner) con un grupo nombrado dentro; la **unicidad de página** del banner es responsabilidad de AppLayout (ningún otro `<header>`) y la verifica el reviewer en F4/F5.
- RF-3: CUANDO cambia el idioma de la interfaz, ENTONCES EL SISTEMA actualiza los labels traducidos de ThemeToggle y LanguageSwitcher.
- RF-4: ControlsBar debe quedar entre lo primero del orden de tabulación, inmediatamente después del skip link: **restricción de uso a nivel de página** — el DOM order lo garantiza AppLayout (su spec); no es verificable en la unidad de ControlsBar (la pieza no conoce el skip link). La verifica el reviewer en F4.
- RF-5: EL SISTEMA no declara en su módulo ningún color de texto sobre `--color-bg` ni usa `--color-text-muted` (la pieza no renderiza texto propio; el texto que muestra viene de sus hijos, que traen sus tokens). Verificación: inspección del CSS.
- RF-6: EL SISTEMA se muestra igual en todos los breakpoints: solo el `gap` escala, con token y sin `@media` propios. Verificación: inspección del CSS. En **impresión** la ocultan los estilos compartidos (G-D: la pieza no declara `@media print`).

## Anatomía

```
                                              [☾]  [EN|ES]
┌──────────── cards ────────────────────────────────────────┐
```

```html
<header class="controlsBar">
  <div role="group" aria-label={t.controls.label}>
    <ThemeToggle darkModeLabel={t.controls.darkMode} lightModeLabel={t.controls.lightMode} />
    <LanguageSwitcher label={t.controls.language} />
  </div>
</header>
```

## API

```ts
export interface ControlsBarProps {
  /** Se une a la clase base del `<header>` raíz (G-B). */
  className?: string;
}
```

Consume `useLocale()` para pasar los labels traducidos a sus hijos
(`t.controls.label`, `t.controls.language`, y a ThemeToggle
`darkModeLabel={t.controls.darkMode}` + `lightModeLabel={t.controls.lightMode}`
— la clave `controls.lightMode` se agrega como tarea previa de F3, ver spec de
ThemeToggle).

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

- Landmark `<header>` a nivel de página (banner); la unicidad la garantiza AppLayout (RF-2).
- Grupo con nombre ("Display settings" / "Ajustes de visualización").
- Orden de tabulación: inmediatamente después del skip link — lo fija AppLayout (RF-4).
- Impresión: la barra la ocultan los estilos compartidos; ningún `@media print` propio (G-D).

## Tests esperados

- Renderiza un `banner` que contiene un `group` con nombre traducido.
- Contiene el ThemeToggle y el LanguageSwitcher (por rol y nombre).
- Al cambiar el idioma a `es`, los labels de los controles cambian al español.
- `expectNoA11yViolations` sin violaciones.

(Los tests envuelven con `ThemeProvider` **y** `LocaleProvider` — los hijos
consumen ambos contextos — y resetean `data-theme`, `lang` y `localStorage` en
`afterEach`, como en las specs hermanas.)

## No hacer

- No ubicarla dentro de las cards: va arriba, a la derecha y fuera de ellas.
- No usar `--color-text-muted` para texto: está sobre `--color-bg` (`docs/tokens/contrast.md`).
- No agregar otro landmark `<header>`: el banner es único en la página (AppLayout).
- No agregar `@media` propios: solo el `gap` escala, por `--controls-gap`; ni `@media print` (lo ocultan los estilos compartidos).
