# Plan — LanguageSwitcher

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/LanguageSwitcher/LanguageSwitcher.tsx` | `div role="group">` con un `<button>` por `LOCALES`, estado activo y guard | RF-1…RF-5 |
| `src/components/LanguageSwitcher/LanguageSwitcher.module.css` | grupo segmentado, botón activo gradiente, hover, press + transición, focus | RF-6 |
| `src/components/LanguageSwitcher/LanguageSwitcher.test.tsx` | tests + cierre a11y | todas |
| `src/components/LanguageSwitcher/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno: mapa `LOCALES → botón`. Nombres fijos: `en` → texto "EN", label "English", `lang="en"`; `es` → "ES", "Español", `lang="es"` (constantes locales del `.tsx`; si el plan las saca a constante-objeto exportada junto al componente, aplicar #100 a `allowExportNames` — por defecto quedan **sin exportar**).

## Interfaz

`LanguageSwitcherProps { label: string; className?: string }`. Consume `useLocale()` (`{ locale, setLocale }`; excepción C2, misma que ThemeToggle). `className` al grupo raíz (G-B).

## Decisiones

- **Guard (decisión 2=a):** click en el activo → **no invoca `setLocale`** (comparación `next === locale`). Test dedicado con `setLocale` espiado.
- **Harness doble** (declarado para que el builder no lo invente): tests de orden/nombres/lang/activo con `LocaleProvider` real (semilla: `document.documentElement.lang = "es"` antes del render, como el anti-flash; reset en `afterEach`); tests de **call-count/guard** con `vi.mock("../providers/LocaleProvider")` exponiendo `useLocale` con `setLocale: vi.fn()` (mock de módulo, no re-export del hook; #96 no se toca).
- RF-2 (lang/storage) es del provider: la pieza lo verifica **solo en integración** (ya cubierto por `LocaleProvider.test.tsx`; acá basta `aria-pressed` + la llamada) — G-A.
- Sin divisor (decisión 3): la separación es `gap: 0.125rem`; *descartado:* borde entre segmentos (no hay propiedad que lo pinte en la spec).
- `aria-pressed` en botones normales (no radiogroup, RF-5/"No hacer").
- Transición press como ThemeToggle (G-E).

## Estrategia de tests

`getByRole("group", { name })`; `getAllByRole("button")` en orden + `textContent` (RF-1, decisión 3); `getByRole("button", { name: "English"|"Español" })` + `aria-pressed`; click otro → `aria-pressed` conmuta (real) / `setLocale` llamado con el locale (mock); click activo → `setLocale` **no llamado** (mock); atributo `lang` por botón; Tab recorre ambos (decisión 3); cierre `expectNoA11yViolations` con cada idioma activo.

Cobertura: T1→RF-1,RF-4 · T2→RF-2,RF-3,RF-5 · T3→RF-6 + cierre.
