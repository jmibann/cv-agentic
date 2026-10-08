# Foundation
Estado: implementada

Pieza de F1 (decisión #84): deja la app lista para que F2–F4 construyan
componentes con TDD. El alcance está derivado **solo** de
`.opencode/agents/foundation.md`, `foundations/*.md`, las dependencias
aprobadas de `docs/README.md` y `data/`.

## Propósito

Armar el proyecto único en la raíz (Vite + React + TS + ESLint + Vitest con
axe-core), con los tokens y la fuente autohosteada conectados, los providers de
tema e idioma, el script anti-flash, el i18n de interfaz y las fechas, y el
contenido inicial de ejemplo validado contra `data/cv.schema.json`. Sin esto no
existe dónde escribir un componente ni cómo testearlo.

## Requisitos (EARS)

- **RF-1:** CUANDO `index.html` carga, EL SISTEMA fija `data-theme` en `<html>`
  y el `content` de `<meta name="theme-color">` antes del primer frame, con
  valores que coinciden con `--palette-light-bg` / `--palette-dark-bg` de
  `tokens/tokens.css`.
- **RF-2:** CUANDO se llama `toggleTheme`, EL SISTEMA alterna `data-theme` en
  `<html>` y persiste `localStorage["cv:theme"]`.
- **RF-3:** MIENTRAS no exista preferencia guardada (`cv:theme`), EL SISTEMA
  sigue en vivo los cambios de `prefers-color-scheme` y aplica el nuevo
  `data-theme`.
- **RF-4:** EL SISTEMA mantiene `<meta name="theme-color">` sincronizado con el
  tema aplicado, tanto tras `toggleTheme` como tras un cambio del sistema sin
  preferencia guardada.
- **RF-5:** SI `localStorage` lanza (modo privado / storage bloqueado),
  ENTONCES EL SISTEMA no rompe: el estado cambia igual en memoria, todo dentro
  de `try/catch` (`D3`: solo `cv:theme` y `cv:locale`).
- **RF-6:** CUANDO se llama `setLocale(locale)`, EL SISTEMA fija `<html lang>`,
  persiste `localStorage["cv:locale"]` y expone `t` y `useCv()` del idioma
  activo.
- **RF-7:** EL SISTEMA expone como contenido solo datos que pasaron
  `validateCv` (`src/content/index.ts`): un JSON inválido rompe
  `prebuild`/`validate:content` y la cadena de imports de `content.test.ts`.
- **RF-8:** CUANDO se llama
  `formatPeriod({ start, end }, locale, presentLabel)`, EL SISTEMA produce
  `"2015 — Present"`, `"2015 — Actualidad"` (`end: null`) y
  `"Mar 2019 — Nov 2021"` / `"mar 2019 — nov 2021"` (`Intl` mes abreviado +
  año), con separador `" — "`.

*Notas de trazabilidad (Clarificación F1): el orden de resolución de tema e
idioma (`cv:theme` → sistema → `light`; `cv:locale` → navegador `es*` → `en`) y
el estado inicial de `LocaleProvider` tomado de `<html lang>` son contrato de
"Estados" (verificados por los tests de los providers y la QA visual, no por un
RF propio). La coincidencia exacta de `package.json` con la tabla de
`docs/README.md` es un chequeo de constitución (S1/S2/S5), no un RF testeable.*

## Anatomía

Estructura que crea F1 en la raíz (no es un componente visual):

```
package.json · package-lock.json · .nvmrc (24) · .gitignore
index.html                  ← `<html lang="en">` + meta theme-color #eceef4
                              + script anti-flash inline en <head> (foundations/theming.md, tal cual)
                              + `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` (Cambio F5 2026-10-08, hallazgo D4: el navegador pedía /favicon.ico → 404)
vite.config.ts              ← plugin react + resolve.alias @data/*
tsconfig.json               ← único; strict, noUnusedLocals, noUnusedParameters,
                              noUncheckedIndexedAccess, moduleResolution "bundler",
                              resolveJsonModule, paths @data/*, types ["vite/client","node"];
                              incluye src/, data/ y vite.config.ts; sin baseUrl
eslint.config.js            ← flat: typescript-eslint (strict), react-hooks,
                              react-refresh; --max-warnings 0; no-restricted-syntax
                              que prohíbe #[0-9a-fA-F]{3,8}\b|rgb(|hsl( en .tsx
public/images/              ← placeholders: avatar.svg y testimonials/{maria,john,lena}.svg
                              (silueta neutra, sin texto ni marcas, viewBox cuadrado)
public/favicon.svg          ← hexágono simple de marca (form factor de HexAvatar, pointy-top;
                              fill del azul de acento del kit — literal `#304cfd`, el valor de
                              `--color-accent` (tokens.css:97); un asset público no es CSS de app;
                              sobre transparente, viewBox cuadrado 64×64; Cambio F5 — D4)
src/main.tsx                ← importa ../tokens/tokens.css (única importación, ruta
                              relativa), @fontsource/poppins/{300,400,500,600}.css,
                              src/styles/global.css; monta ThemeProvider > LocaleProvider > App
src/App.tsx                 ← provisorio: renderiza un texto de `t` y el nombre de
                              `useCv()` (lo reemplaza el integrator en F4)
src/styles/global.css       ← único CSS global: reset + base tipográfica
                              (foundations/typography.md §"Estilos base") +
                              html:has(dialog[open]) { overflow: hidden }
src/providers/ThemeProvider.tsx    ← spec foundations/theming.md
src/providers/LocaleProvider.tsx   ← spec foundations/i18n.md (useLocale + useCv)
src/i18n/ui.en.ts · ui.es.ts       ← todas las claves de foundations/i18n.md
src/i18n/format.ts · formatPeriod.ts
src/content/cv.en.json · cv.es.json · index.ts · content.test.ts · schema.test.ts
                              ← los dos JSON se crean COPIANDO data/cv.example.{en,es}.json
                              y declaran "$schema": "../../data/cv.schema.json" (contrato
                              revisable al cerrar la pieza; foundation.md p.10)
src/test/setup.ts           ← jest-dom/vitest, afterEach(cleanup) explícito, mocks
                              (matchMedia, ResizeObserver, scrollTo, showModal/close
                              si jsdom no los trae), afterEach que limpia
                              localStorage, data-theme, lang y location.hash
src/test/a11y.ts            ← expectNoA11yViolations sobre axe-core
                              (desactiva color-contrast y region; ver foundation.md 5b)
data/cv.types.generated.ts       ← gen:types   ┐ GENERADOS — no editar,
data/validate-cv.generated.{js,d.ts} ← build:validator ┘ commiteados, encabezado "GENERADO"
```

## API

```ts
// ThemeProvider (foundations/theming.md)
type Theme = "light" | "dark";
interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;  // guarda cv:theme; sin RF propio (Clarificación #2, opción A)
  toggleTheme: () => void;           // RF-2: alterna data-theme + persiste; desde ahí deja de seguir al sistema
}
// export: ThemeProvider, useTheme() → ThemeContextValue (error descriptivo fuera del provider)

// LocaleProvider (foundations/i18n.md)
type Locale = "en" | "es";
interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;  // RF-6
  t: UiStrings;
}
// export: LocaleProvider, useLocale() → LocaleContextValue, useCv() → CvData
// (ambos con error descriptivo fuera del provider)
// El efecto único del ThemeProvider aplica data-theme y theme-color (getComputedStyle
// de --color-bg) — contrato de theming.md, verificado por los tests de meta (RF-4).

// src/i18n/ui.en.ts → export const uiEn (fuente de claves, `as const`)
// src/i18n/ui.es.ts → export const uiEs: satisfies UiStrings (UiStrings = DeepStringify<typeof uiEn>)

// src/i18n/format.ts
export function format(template: string, values: Record<string, string | number>): string;
// reemplaza {clave}; placeholder ausente queda literal

// src/i18n/formatPeriod.ts
export function formatPeriod(
  period: { start: string; end: string | null },
  locale: Locale,
  presentLabel: string,
): string;

// Cambio F3 (Clarificación 12=a; lo consume Timeline con <time> por extremo):
// mismo formateo de extremo que la actual `formatEndpoint` privada; `formatPeriod`
// NO cambia de firma ni comportamiento.
export function formatPeriodEndpoint(value: string, locale: Locale): string;

// src/content/index.ts
export const cvByLocale: Record<Locale, CvData>;  // load() lanza si validateCv falla

// src/test/a11y.ts
export function expectNoA11yViolations(container: Element): Promise<void>;

// tipos de datos: import type { CvData, Locale, … } from "@data/cv.types.generated";
// el alias @data/* debe resolver también en Vitest (foundation.md p.3; lo ejercita schema.test.ts)
```

Scripts (`package.json`): `dev` (Vite), `lint` (ESLint `--max-warnings 0`),
`typecheck` (`tsc --noEmit`), `test` (Vitest run), `gen:types`
(json-schema-to-typescript), `build:validator` (ajv standalone; el `.d.ts`
declara `validateCv(data: unknown): data is CvData` y `validateCv.errors`),
`validate:content`, `prebuild` = `gen:types && build:validator &&
validate:content`, `build` = `prebuild` + `tsc --noEmit && vite build`.
Dependencias: la tabla de `docs/README.md` sin cambios (TypeScript `~6.0`,
`engines.node` `"^22.12.0 || >=24"`, `"private": true`, `"type": "module"`).
La coincidencia exacta `package.json` ↔ tabla es un chequeo de constitución
(S1/S2/S5) que el reviewer verifica por inspección al cerrar la pieza.
No se usa `npm create vite` ni generadores sobre la raíz: los archivos base se
crean a mano.

## Estilos y tokens

- `tokens/tokens.css` se importa **una sola vez** en `src/main.tsx` por ruta
  relativa; **no se copia a `src/`**.
- `src/styles/global.css` usa solo tokens (`--font-*`, `--color-*`,
  `--line-height-*`); la base tipográfica replica `foundations/typography.md`
  §"Estilos base" (cuerpo peso 300).
- Fuente: `@fontsource/poppins` pesos 300/400/500/600, self-hosted (D1: sin
  Google Fonts en runtime).
- `index.html`: los únicos literales de color permitidos son los dos valores
  iniciales de `theme-color` (`#eceef4` / `#151517`), excepción de la regla
  dura 1 de `docs/DESIGN.md`, verificada por test contra `--palette-light-bg` /
  `--palette-dark-bg` (decisión #60).
- Placeholders en `public/images/`: son contenido de ejemplo, no estilos. Los
  ejemplos no traen `downloadCvUrl`, así que no se crea ningún PDF.
- Sin `@media` nuevos en F1: los breakpoints viven en `tokens.css`
  (`docs/tokens/breakpoints.md`).

## Estados

- **Tema inicial:** guardado (`cv:theme`) → sistema (`prefers-color-scheme`) →
  `light`. Sin preferencia guardada el sitio sigue al sistema en vivo; elegida
  una vez, queda fija hasta que el usuario vuelva a elegir.
- **Idioma inicial:** `cv:locale` → navegador (`/^es\b/i`) → `en`.
- **Storage que lanza:** el `try/catch` del anti-flash aplica `light`/`en`; los
  providers cambian de estado en memoria sin persistir.
- **Contenido inválido:** `load()` lanza con los errores del validador;
  `validate:content`, `build` y los tests se rompen (no hay fallback silencioso).
- **Providers sin wrapper:** `useTheme`/`useLocale`/`useCv` fuera de su provider
  lanzan error descriptivo.
- **Primer frame:** tema e idioma ya aplicados antes del bundle (sin flash).

## Responsive

Sin `@media` propios: F1 no crea UI y los breakpoints viven en `tokens.css`
(del kit), junto con el `@media print` y el de `prefers-reduced-motion`.
`src/styles/global.css` no agrega ninguno; todo escala por tokens
(mobile-first, regla dura 4 de `docs/DESIGN.md`).

## Accesibilidad

- `<html lang>` correcto desde el primer frame (Estados "Idioma inicial"; default `en` en el HTML).
- `<meta name="theme-color">` sincronizado con el tema (RF-1/RF-4).
- `src/test/a11y.ts` habilita `expectNoA11yViolations` para todas las piezas
  futuras (T4); cubre roles, nombres, ARIA y estructura (axe en jsdom no
  calcula contraste: eso lo fixan `docs/tokens/contrast.md` y la QA visual).
- El `App.tsx` provisorio debe pasar el helper de axe sin violaciones.
- Sin dependencias de terceros en runtime (D1/D2): fuente, íconos y todo el
  CSS van en el bundle.

## Tests esperados

Fuente: `foundations/theming.md`, `foundations/i18n.md`,
`.opencode/agents/foundation.md` y `docs/README.md`.

**Anti-flash (`index.html`):**
- Los dos valores de `theme-color` del script coinciden con
  `--palette-light-bg` y `--palette-dark-bg` de `tokens/tokens.css` (el test
  lee ambos archivos).

**Helper de accesibilidad (`src/test/a11y.ts`):**
- Un `<img>` sin `alt` produce una violación (el helper falla).
- Un botón con texto no produce violaciones (el helper pasa).

**ThemeProvider:**
- Toma el tema inicial de `data-theme` (no recalcula).
- `toggleTheme` alterna `data-theme` y persiste en `localStorage`.
- Si `localStorage` lanza, no rompe (el tema cambia igual en memoria).
- Sin preferencia guardada reacciona al cambio de `prefers-color-scheme`
  (mock de `matchMedia`); con preferencia guardada, lo ignora.
- `<meta name="theme-color">` se actualiza tanto con `toggleTheme` como con un
  cambio de `prefers-color-scheme` sin preferencia guardada.
- `useTheme` fuera del provider lanza un error descriptivo.

**LocaleProvider / contenido / i18n:**
- `LocaleProvider` toma el idioma inicial de `<html lang>`; `setLocale` cambia
  `lang`, persiste y cambia `t`; storage que lanza no rompe.
- `useCv()` devuelve el contenido del idioma activo; `useLocale`/`useCv` fuera
  del provider lanzan error descriptivo.
- `format`: reemplazo de uno o varios `{placeholders}`; placeholder ausente
  queda literal.
- `formatPeriod`: años sueltos, año-mes en ambos extremos, `end: null`, ambos
  idiomas (casos de RF-8).
- `formatPeriodEndpoint` (Cambio F3): `"2015"` → `"2015"`; `"2019-03"` →
  `"Mar 2019"` (en) / `"mar 2019"` (es); coincide con cada extremo del
  resultado de `formatPeriod` sobre los mismos datos.
- **Paridad de contenido** (`content.test.ts`): `cv.en.json` y `cv.es.json` con
  los mismos ids en cada colección, en el mismo orden, y los campos no
  traducibles (lista canónica de `foundations/i18n.md`) idénticos.
- **Orden de fechas** (`content.test.ts`): `start` ≤ `end` normalizando `"YYYY"`
  (`-01` en start, `-12` en end); casos: `2017-06`→`2017` válido,
  `2018`→`2017` inválido, `2017-06`→`2017-05` inválido.
- **Contenido inválido** (`content.test.ts`): el validador rechaza mes `99`,
  red desconocida y campo extra (casos en memoria).
- **Esquema al día** (`schema.test.ts`): las listas de `@data/constants` son
  iguales a los `enum` del esquema y `data/cv.types.generated.ts` está al día
  (regenerarlo en memoria y comparar).

**Tooling (smoke, tareas primeras):**
- Test smoke del proyecto (por ejemplo el render del `App` provisorio con el
  helper de axe) que corre bajo Vitest con jsdom, `globals: false` y cleanup
  entre tests (el DOM no se acumula: dos tests que crean el mismo role/nombre
  pasan ambos).
- `npm run lint`, `npm run typecheck` y `npm test` corren en verde sobre el
  andamiaje desde la tarea que crea esos scripts (DoD por tarea, decisión #80);
  `typecheck` cubre `src/`, `data/` y `vite.config.ts`. La regla ESLint
  anti-colores en `.tsx` queda en la config (Anatomía) y la verifica el
  reviewer con grep, sin test propio.

**Al cerrar la pieza (no por tarea, decisión #80):** `npm run build` en verde.
**Verificación visual (la hace el reviewer con la app servida por el usuario,
decisión #91):** texto provisorio con Poppins sobre `--color-bg`; con
`localStorage["cv:theme"]="dark"` + reload, tema oscuro **sin parpadeo**.

## No hacer

- No construir componentes visuales (son de F2/F3) ni el layout final
  (F4); el `App.tsx` es provisorio.
- No tocar el kit (`README.md`, `AGENTS.md`, `docs/`, `tokens/`, `foundations/`,
  `specs/`, `data/` salvo `*.generated.*` por scripts, `.opencode/`).
- No usar `npm create vite` ni ningún generador sobre la raíz (hay kit).
- No agregar dependencias fuera de la tabla aprobada (S1) ni `eslint-plugin-jsx-a11y`
  ni `vitest-axe` (descartadas).
- No marcar tareas en `tasks.md` ni escribir en `specs/`.
- No commitear `chore:` sueltos: todo cae dentro de una Tn con su test previo.
- No editar los `*.generated.*` a mano ni dejar de commitear `package-lock.json`
  y los generados.
- No usar `ajv` en el bundle del navegador (solo en build-time, modo standalone).
- No poner colores literales fuera de `tokens.css` (regla dura 1), salvo los dos
  valores de `theme-color` del anti-flash fijados por test.
- No correr `npm run dev` (decisión #91) ni `build` por tarea.
- No usar `baseUrl` (deprecado), `any`, `@ts-ignore`, `eslint-disable` ni
  `React.FC`; no copiar tokens a `src/`; no subir el peso del cuerpo de 300.
