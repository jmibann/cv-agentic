# Plan — ControlsBar

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/ControlsBar/ControlsBar.tsx` | `<header class="controlsBar">` > `div role="group">` con `ThemeToggle` + `LanguageSwitcher`; consume `useLocale().t.controls` | RF-1…RF-3 |
| `src/components/ControlsBar/ControlsBar.module.css` | flex right-aligned, alto `--size-control`, `z-index: var(--z-controls)`, `gap: var(--controls-gap)` | RF-1, RF-6 |
| `src/components/ControlsBar/ControlsBar.test.tsx` | tests + cierre a11y | todas |
| `src/components/ControlsBar/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`ControlsBarProps { className?: string }` (al `<header>` raíz, G-B). No recibe hijos: compone los dos controles él mismo (spec → Anatomía).

## Decisiones

- Pasa a sus hijos los labels de `t.controls` (`label`, `language`, y en ThemeToggle `darkModeLabel=t.controls.darkMode` + `lightModeLabel=t.controls.lightMode` — depende de **Foundation T12**).
- RF-4 y la unicidad del banner quedan como invariantes de **AppLayout/F4** (decisión 4): en esta pieza no hay tarea ni test; el plan lo declara y el reviewer lo verifica en F4/F5.
- RF-5: el módulo **no declara texto** (la pieza no pinta texto propio; sus hijos traen el suyo) — verificación por inspección.
- `useLocale()` en la barra: excepción C2 análoga a los controles (no hay RF 6 propio en la spec; la API lo documenta) — si el reviewer lo pide, se formaliza con una RF en la próxima revisión de spec, no se agrega alcance nuevo ahora.
- Impresión: ningún `@media print` propio (G-D-1); lo ocultan los estilos compartidos (F4).

## Estrategia de tests

Harness: `ThemeProvider` + `LocaleProvider` reales (los hijos consumen ambos), reset de `data-theme`/`lang`/storage en `afterEach`. Tests: `banner` contiene `group` con nombre (en) y los dos controles por rol+nombre; click en "Español" → `group` pasa a "Ajustes de visualización" y el toggle a labels en español (RF-3); `expectNoA11yViolations`. RF-1/RF-6/RF-5 por inspección del CSS (#101).

Cobertura: T1→RF-2,RF-3 · T2→RF-1,RF-5,RF-6 + cierre. (RF-4: AppLayout, sin tarea acá.)
