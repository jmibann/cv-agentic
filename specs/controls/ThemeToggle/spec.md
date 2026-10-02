# ThemeToggle
Estado: aprobada

## Propósito

Alternar entre tema claro y oscuro. Vive en la ControlsBar.

## Requisitos (EARS)

- RF-1: CUANDO el usuario activa el botón, ENTONCES EL SISTEMA alterna el tema entre claro y oscuro y lo persiste en `localStorage["cv:theme"]` dentro de `try/catch`.
- RF-2: EL SISTEMA refleja el tema actual en `data-theme` del `<html>` y en `aria-pressed` del botón (`false` en claro y `true` en oscuro).
- RF-3: EL SISTEMA muestra la luna en tema claro y el sol en oscuro, con un `aria-label` traducido y fijo que describe el modo, no la acción.
- RF-4: EL SISTEMA opera con Enter y Espacio (nativo del `<button>`) y aplica el anillo de foco estándar en `focus-visible`.
- RF-5: EL SISTEMA mantiene el tamaño fijo con `--size-control` y no declara `@media` propios.
- RF-6: EL SISTEMA consume `useTheme()` directamente (excepción documentada a la regla "props en, eventos fuera").

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

## No hacer

- No cambiar el `aria-label` según el tema: es fijo y describe el modo; el estado lo da `aria-pressed`.
- No hardcodear el label: llega traducido por la prop `label`.
- No leer ni escribir `localStorage` fuera de `try/catch`, ni con otra clave que `cv:theme`.
- No cambiar el tamaño por breakpoint ni agregar `@media` propios (`--size-control`).
