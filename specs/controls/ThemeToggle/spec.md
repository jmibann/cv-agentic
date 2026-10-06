# ThemeToggle
Estado: aprobada

## Propósito

Alternar entre tema claro y oscuro. Vive en la ControlsBar.

## Requisitos (EARS)

- RF-1: CUANDO el usuario activa el botón, ENTONCES EL SISTEMA invoca `toggleTheme()` del contexto; el alternado del tema, la aplicación de `data-theme` y la persistencia en `localStorage["cv:theme"]` con `try/catch` son responsabilidad del `ThemeProvider` (G-A: el componente no toca storage ni DOM global). Verificación: integración componente+provider (los tests de la pieza envuelven `ThemeProvider`).
- RF-2: EL SISTEMA refleja el tema actual en `aria-pressed` del botón (`false` en claro, `true` en oscuro); el reflejo en `data-theme` del `<html>` lo aporta el provider (ya verificado en `ThemeProvider.test.tsx`; se comprueba aquí solo de forma indirecta por integración).
- RF-3: EL SISTEMA muestra la luna en tema claro y el sol en oscuro, con `aria-label` traducido que **nombra el modo al que se va** (decisión 1=a): en claro → `darkModeLabel` ("Dark mode"), en oscuro → `lightModeLabel` ("Light mode"); el label nombra un modo, nunca una acción ("Activar/Desactivar").
- RF-4: EL SISTEMA opera con Enter y Espacio (nativo del `<button>`) y aplica el anillo de foco estándar en `focus-visible`. (Verificación: test de teclado + inspección del CSS.)
- RF-5: EL SISTEMA mantiene el tamaño fijo con `--size-control` y no declara `@media` propios. (Verificación: inspección del CSS.)
- RF-6: EL SISTEMA consume `useTheme()` directamente (excepción documentada a la regla "props en, eventos fuera").

## Anatomía

Un único `<button>` cuadrado de solo ícono: luna en claro (pasar a oscuro),
sol en oscuro (pasar a claro).

## API

```ts
export interface ThemeToggleProps {
  /** aria-label en tema claro: nombra el modo al que se va. Ej: "Dark mode" / "Modo oscuro". */
  darkModeLabel: string;
  /** aria-label en tema oscuro: nombra el modo al que se va. Ej: "Light mode" / "Modo claro". */
  lightModeLabel: string;
  /** Se une a la clase base del `<button>` raíz (G-B). */
  className?: string;
}
```

Consume `useTheme()` (excepción documentada a "props en, eventos fuera"). El label activo es `theme === "light" ? darkModeLabel : lightModeLabel`.
Requiere la clave i18n nueva `controls.lightMode` ("Light mode" / "Modo claro") en `src/i18n/ui.{en,es}.ts`
(decisión del usuario 1=a; la agrega una tarea previa de F3 delegada a `foundation`, dueña de i18n/providers post-F1; `ControlsBar` pasa ambos labels).

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
| Active (press) | `transform: translateY(1px)` con `transition: transform var(--duration-fast) var(--ease-standard)` (G-E; DESIGN prohíbe `transition: all`) |

## Responsive

Tamaño fijo en todos los breakpoints (`--size-control`); sin `@media` propios.

## Accesibilidad

Patrón **toggle button**:

- `aria-label` que nombra el modo al que se va (RF-3) + `aria-pressed={theme === "dark"}`.
- El ícono es decorativo.
- Opera con Enter/Espacio (nativo del `<button>`).

## Tests esperados

- `getByRole("button", { name: darkModeLabel })` con `aria-pressed="false"` en claro.
- Click → `aria-pressed="true"`, **`aria-label` pasa a `lightModeLabel`**, `document.documentElement.dataset.theme === "dark"`,
  `localStorage["cv:theme"] === "dark"` (integración con el provider).
- Segundo click vuelve a claro: `aria-pressed="false"`, label otra vez `darkModeLabel`.
- Muestra el ícono de luna en claro y el de sol en oscuro (verificar por el
  atributo/clase del svg de lucide, p. ej. `lucide-moon`; criterio del contrato de `Icon`, que propaga esas clases).
- Teclado: foco con Tab y Espacio alterna.
- `expectNoA11yViolations` sin violaciones.

(Los tests envuelven con `ThemeProvider` y resetean `data-theme` y
`localStorage` en `afterEach`.)

## No hacer

- No mostrar una acción en el `aria-label` ("Activar/Desactivar…"): nombra el **modo** al que se va (RF-3). El estado lo da `aria-pressed`.
- No hardcodear los labels: llegan traducidos por las props.
- No leer ni escribir `localStorage` ni tocar `data-theme` desde el componente: la persistencia es del `ThemeProvider` (G-A); el `try/catch` y la clave `cv:theme` aplican ahí.
- No cambiar el tamaño por breakpoint ni agregar `@media` propios (`--size-control`).
