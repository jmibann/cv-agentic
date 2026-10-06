# Plan — ThemeToggle

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/ThemeToggle/ThemeToggle.tsx` | `<button>` único; consume `useTheme()`; label por tema; `aria-pressed` | RF-1…RF-4, RF-6 |
| `src/components/ThemeToggle/ThemeToggle.module.css` | tamaño/fondo/borde/radio/sombra/color, hover, focus-visible, press + transición | RF-4, RF-5 |
| `src/components/ThemeToggle/ThemeToggle.test.tsx` | tests + cierre a11y | todas |
| `src/components/ThemeToggle/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno. El label activo es una rama trivial: `theme === "light" ? darkModeLabel : lightModeLabel`.

## Interfaz

`ThemeToggleProps { darkModeLabel: string; lightModeLabel: string; className?: string }`
(spec → API, decisión 1=a). Consume `useTheme()` (`{ theme, toggleTheme }`; excepción C2 documentada, RF-6).

## Decisiones

- El click llama **`toggleTheme()`** del contexto: ni `localStorage` ni `data-theme` tocan al componente (G-A). *Descartado:* duplicar la persistencia acá.
- Depende del **Cambio T12 de Foundation** (`controls.lightMode` en `ui.{en,es}.ts`): sin esa clave, `t.controls.lightMode` no compila. T12 es tarea previa de la fase, delegada a `foundation`.
- El ícono es decorativo: `<Icon name={theme === "light" ? "moon" : "sun"} />` (`tone="current"` default; ninguno de los dos lleva `label`).
- `className` unida al `<button>` raíz (G-B, patrón #99 de aserción).
- Transición de press: `transition: transform var(--duration-fast) var(--ease-standard)` (G-E; `transition: all` prohibido).
- Arreglo anti-`react-refresh` no esperado: el `.tsx` solo exporta `ThemeToggle` + `ThemeToggleProps` (nada spiable; #96/#100 no aplican).

## Estrategia de tests

Harness: `ThemeProvider` real + reset de `data-theme` y `localStorage["cv:theme"]` en `afterEach` (spec → nota de Tests; el provider ya expone la semilla por `data-theme`, como sus propios tests de F1). Queries por rol `button` + nombre. RF-1/2 se verifican **en integración** (tras click cambian `aria-pressed`, label y `dataset.theme`/storage — los comprueba el assertion de provider+componente, sin duplicar lo que ya cubre `ThemeProvider.test.tsx`). Ícono por clase `lucide-moon`/`lucide-sun` propagada por Icon (criterio de la spec). Teclado: Tab + Espacio. Cierre `expectNoA11yViolations` en las dos ramas de tema.

Cobertura: T1→RF-1,RF-2,RF-3,RF-6 · T2→RF-4 · T3→RF-4(anillo por inspección),RF-5 + cierre.
