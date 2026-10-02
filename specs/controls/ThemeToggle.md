# ThemeToggle

## Propósito

Alternar entre tema claro y oscuro. Vive en la ControlsBar.

## Anatomía

Un único `<button>` cuadrado de solo ícono: luna en claro (pasar a oscuro),
sol en oscuro (pasar a claro).

## API

```ts
export interface ThemeToggleProps {
  /** Label accesible fijo, ya traducido. Ej: "Dark mode" / "Modo oscuro". */
  label: string;
  className?: string;
}
```

Consume `useTheme()` (excepción documentada a "props en, eventos fuera").

## Estilos y tokens

| Propiedad | Valor |
|---|---|
| Tamaño | `--size-control` cuadrado (2.5rem) |
| Fondo | `--color-surface-raised` |
| Borde | `1px solid var(--color-border)` |
| Radio | `--radius-12` |
| Sombra | `--shadow-control` |
| Ícono | `Icon name="moon" \| "sun"`, `tone="current"`, tamaño `--size-icon` |
| Color | `--color-text`; hover → `--color-accent-text` |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |

## Estados

| Estado | Efecto |
|---|---|
| Claro (`aria-pressed="false"`) | ícono luna |
| Oscuro (`aria-pressed="true"`) | ícono sol |
| Hover | color `--color-accent-text` |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset);` |
| Active (press) | `transform: translateY(1px)` (`--duration-fast`) |

## Responsive

Tamaño fijo en todos los breakpoints (`--size-control`); sin `@media` propios.

## Accesibilidad

Patrón **toggle button**:

- `aria-label={label}` fijo (describe el modo, no la acción) + `aria-pressed={theme === "dark"}`.
- El ícono es decorativo.
- Opera con Enter/Espacio (nativo del `<button>`).

## Tests esperados

- `getByRole("button", { name: label })` con `aria-pressed="false"` en claro.
- Click → `aria-pressed="true"`, `document.documentElement.dataset.theme === "dark"`,
  `localStorage["cv:theme"] === "dark"`.
- Segundo click vuelve a claro.
- Muestra el ícono de luna en claro y el de sol en oscuro (verificar por el
  atributo/clase del svg de lucide, p. ej. `lucide-moon`).
- Teclado: foco con Tab y Espacio alterna.
- `expectNoA11yViolations` sin violaciones.

(Los tests envuelven con `ThemeProvider` y resetean `data-theme` y
`localStorage` en `afterEach`.)
