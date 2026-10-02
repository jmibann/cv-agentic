# LanguageSwitcher

## Propósito

Elegir el idioma del sitio (EN / ES). Vive en la ControlsBar, junto al ThemeToggle.

## Anatomía

```
┌────┬────┐
│ EN │ ES │   control segmentado: grupo con dos botones
└────┴────┘
```

## API

```ts
export interface LanguageSwitcherProps {
  /** Label del grupo, ya traducido. Ej: "Language" / "Idioma". */
  label: string;
  className?: string;
}
```

Consume `useLocale()`. Los idiomas salen de `LOCALES` de `@data/constants`, en ese
orden (`en`, `es`).

Nombres fijos (no se traducen):

| locale | Texto visible | aria-label | lang |
|---|---|---|---|
| en | EN | English | en |
| es | ES | Español | es |

## Estilos y tokens

| Parte | Valor |
|---|---|
| Grupo | `display: inline-flex; height: var(--size-control); padding: 0.1875rem; gap: 0.125rem;` fondo `--color-surface-raised`, borde `1px solid var(--color-border)`, radio `--radius-12`, sombra `--shadow-control` |
| Botón | `min-width: 2.25rem; padding-inline: var(--space-2);` radio `--radius-8`, `--font-size-small`, `--font-weight-medium`, color `--color-text` |
| Botón hover | color `--color-accent-text` |
| Botón activo (`aria-pressed="true"`) | fondo `--gradient-accent`, color `--color-on-accent` |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |

## Estados

| Estado | Efecto |
|---|---|
| Opción inactiva | color `--color-text`, sin fondo |
| Opción inactiva hover | color `--color-accent-text` |
| Opción activa (`aria-pressed="true"`) | fondo `--gradient-accent`, color `--color-on-accent`; sin cambio en hover |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active (press) | `transform: translateY(1px)` (`--duration-fast`) |

## Responsive

Tamaño fijo en todos los breakpoints (`--size-control`); sin `@media` propios.

## Accesibilidad

- Contenedor `role="group"` con `aria-label={label}`.
- Cada opción es `<button type="button">` con `aria-pressed`, `aria-label`
  ("English" / "Español") y `lang` propio, para que el lector lo pronuncie bien.
- Hacer click en el idioma activo no hace nada (sigue presionado).
- Tab recorre ambos botones (no es un radiogroup: dos botones simples son más
  predecibles con dos opciones).

## Tests esperados

- `getByRole("group", { name: label })` con dos botones.
- Botones con nombre "English" y "Español"; el del idioma activo tiene `aria-pressed="true"`.
- Click en el otro → cambia `aria-pressed`, `document.documentElement.lang`,
  y `localStorage["cv:locale"]`.
- Click en el activo no llama a `setLocale` de nuevo (o no cambia nada observable).
- Cada botón tiene su atributo `lang`.
- `expectNoA11yViolations` sin violaciones.
