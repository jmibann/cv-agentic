# LanguageSwitcher
Estado: aprobada

## Propósito

Elegir el idioma del sitio (EN / ES). Vive en la ControlsBar, junto al ThemeToggle.

## Requisitos (EARS)

- RF-1: EL SISTEMA muestra una opción por cada valor de `LOCALES` de `@data/constants`, en ese orden, con texto visible fijo (`EN` / `ES`). Verificación: test de `getAllByRole("button")` en orden y con el `textContent` esperado.
- RF-2: CUANDO el usuario elige un idioma, ENTONCES EL SISTEMA invoca `setLocale()` del contexto; el cambio de `document.documentElement.lang` y la persistencia en `localStorage["cv:locale"]` con `try/catch` son responsabilidad del `LocaleProvider` (G-A: el componente no toca storage ni DOM global). Verificación: integración componente+provider (los tests envuelven `LocaleProvider`) + `aria-pressed` propio.
- RF-3: CUANDO el usuario activa el idioma que ya está activo, ENTONCES EL SISTEMA **no invoca `setLocale()`** (guard en el componente; decisión 2=a). Verificación: test con `setLocale` espiado.
- RF-4: EL SISTEMA expone el contenedor como `role="group"` con `aria-label` traducido y cada opción como `<button type="button">` con su `aria-label` y su atributo `lang`.
- RF-5: EL SISTEMA expone ambos botones como tab stops consecutivos (Tab los recorre); no implementa el patrón radiogroup. Verificación: test de foco con Tab + inspección (sin roles de radiogroup).
- RF-6: EL SISTEMA mantiene el tamaño fijo con `--size-control` y no declara `@media` propios. (Verificación: inspección del CSS.)

## Anatomía

```
┌────┬────┐
│ EN │ ES │   control segmentado: grupo con dos botones, SIN divisor:
└────┴────┘   la separación es solo el `gap: 0.125rem` sobre el fondo del grupo
```

## API

```ts
export interface LanguageSwitcherProps {
  /** Label del grupo, ya traducido. Ej: "Language" / "Idioma". */
  label: string;
  /** Se une a la clase base del `role="group"` raíz (G-B). */
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
| Active (press) | `transform: translateY(1px)` con `transition: transform var(--duration-fast) var(--ease-standard)` (G-E; DESIGN prohíbe `transition: all`) |

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
- Orden y texto visible: `getAllByRole("button")` → `["EN", "ES"]` (textContent, orden de `LOCALES`).
- Botones con nombre "English" y "Español"; el del idioma activo tiene `aria-pressed="true"`.
- Click en el otro → cambia `aria-pressed`, `document.documentElement.lang`,
  y `localStorage["cv:locale"]` (integración con el provider).
- Click en el activo: `setLocale` **no** vuelve a invocarse (guard RF-3, spy).
- Tab recorre ambos botones en orden (RF-5).
- Cada botón tiene su atributo `lang`.
- `expectNoA11yViolations` sin violaciones.

(Los tests envuelven con `LocaleProvider` — seed del idioma inicial vía
`document.documentElement.lang` antes del render, como hace el anti-flash — y
reseteaan `lang` y `localStorage` en `afterEach`.)

## No hacer

- No implementar el patrón radiogroup (flechas, un solo tab stop): son dos botones que se recorren con Tab.
- No traducir los nombres de los idiomas (`EN`/`ES`, "English"/"Español"): son fijos.
- No hardcodear la lista de idiomas: sale de `LOCALES` de `@data/constants`, en ese orden.
- No invocar `setLocale()` cuando el idioma elegido ya está activo (RF-3).
- No leer ni escribir `localStorage` ni tocar `document.documentElement.lang` desde el componente: eso es del `LocaleProvider` (G-A); su `try/catch` y la clave `cv:locale` aplican ahí.
