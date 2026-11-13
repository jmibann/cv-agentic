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
contenido validado contra `data/cv.schema.json` (Foundation arrancó con el
contenido de ejemplo; hoy porta el **CV real** y los ejemplos de `data/` quedan
como fixture de schema/tests — decisión #109). Sin esto no existe dónde escribir
un componente ni cómo testearlo.

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
- **RF-9:** CUANDO cambia el tema (`toggleTheme` o cambio del sistema sin
  preferencia guardada), ENTONCES EL SISTEMA aplica `data-theme` **sin
  transiciones de color**: agrega `data-theme-switching` a `<html>` antes de
  aplicarlo y lo quita después de dos frames; SI el componente se desmonta o el
  tema cambia de nuevo antes de la remoción, ENTONCES el atributo se limpia o la
  supresión se reinicia sin dejar estado huérfano.
- **RF-10:** EL SISTEMA expone en `tokens/tokens.css` la escala de motion
  aprobada (decisión #106): `--duration-fast: 0.15s`, `--duration-base: 0.2s`
  (antes 0.3s), `--duration-slow: 0.3s` (antes 0.6s, sin usos actuales),
  `--duration-exit: 0.22s`, `--duration-stagger: 0.03s`, `--ease-standard` y
  `--ease-emphasized` sin cambio, `--ease-enter: cubic-bezier(0.22, 1, 0.36, 1)`
  y `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` nuevos; SI
  `prefers-reduced-motion: reduce`, ENTONCES las cinco duraciones valen
  `0.01ms`.

*Notas de trazabilidad (Clarificación F1): el orden de resolución de tema e
idioma (`cv:theme` → sistema → `light`; `cv:locale` → navegador `es*` → `en`) y
el estado inicial de `LocaleProvider` tomado de `<html lang>` son contrato de
"Estados" (verificados por los tests de los providers y la QA visual, no por un
RF propio). La coincidencia exacta de `package.json` con la tabla de
`docs/README.md` es un chequeo de constitución (S1/S2/S5), no un RF testeable.*

## Anatomía

Estructura que crea F1 en la raíz (no es un componente visual):

```
package.json · package-lock.json · .nvmrc (26, #110) · .gitignore
index.html                  ← `<html lang="en">` + meta theme-color #eceef4
                              + script anti-flash inline en <head> (foundations/theming.md, tal cual)
                              + `<title>Juan Manuel Ibáñez · Frontend Engineer</title>` (nombre y cargo, no el del repo; #115)
                              + `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` (Cambio F5 2026-10-08, hallazgo D4: el navegador pedía /favicon.ico → 404)
                              + `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` (#115)
vite.config.ts              ← plugin react + resolve.alias @data/*
tsconfig.json               ← único; strict, noUnusedLocals, noUnusedParameters,
                              noUncheckedIndexedAccess, moduleResolution "bundler",
                              resolveJsonModule, paths @data/*, types ["vite/client","node"];
                              incluye src/, data/ y vite.config.ts; sin baseUrl
eslint.config.js            ← flat: typescript-eslint (strict), react-hooks,
                              react-refresh; --max-warnings 0; no-restricted-syntax
                              que prohíbe #[0-9a-fA-F]{3,8}\b|rgb(|hsl( en .tsx
public/images/              ← avatar.png (foto real del sitio), testimonials/{magrael,
                              jptigani,dharari}.jpg (fotos reales de los testimonios, #112) y
                              testimonials/{maria,john,lena}.svg (silueta neutra, sin texto
                              ni marcas, viewBox cuadrado). El sitio ya no muestra las
                              siluetas, pero **se conservan**:
                              los referencia el fixture `data/cv.example.{en,es}.json`.
                              No borrarlos. (El `avatar.svg` original quedó obsoleto en
                              `861fb9a` y se retiró en `63f6665` — #109)
public/favicon.svg          ← ícono tipo app (#115, reemplaza el hexágono liso de D4): cuadrado
                              redondeado (`rx` 14) relleno del azul de acento del kit — literal
                              `#304cfd`, el valor de `--color-accent` (tokens.css:97); un asset
                              público no es CSS de app —, con un hexágono pointy-top en trazo
                              blanco (form factor de HexAvatar) y el monograma "JM" adentro,
                              dibujado con paths (sin `<text>`: no depende de fuentes);
                              viewBox cuadrado 64×64
public/apple-touch-icon.png ← el mismo diseño a 180×180, cuadrado a sangre (iOS redondea las
                              esquinas), para "Agregar a pantalla de inicio" (#115)
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
                              ← contenido real en/es, ambos declarando
                              "$schema": "../../data/cv.schema.json" y pasando
                              `validateCv` (RF-7). `data/cv.example.{en,es}.json`
                              queda en `data/` como fixture de schema/tests: no se
                              copia al sitio ni se edita para que coincida con el
                              CV real (decisión #109; originalmente "se crean
                              COPIANDO data/cv.example…", foundation.md p.10)
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
- Supresión de transiciones al cambiar de tema (RF-9, Cambio motion #106):
  `:root[data-theme-switching] *` (+ `*::before`/`*::after`) con
  `transition: none` en `src/styles/global.css`, sin `!important`; especificidad
  **(0,2,0)**: gana a los selectores de módulo como `.social a` / `.contacts a`
  (0,1,1), que empatarían con `html[data-theme-switching] *` (0,1,1) y ganarían
  por orden de carga (global.css se importa antes que los componentes).
  Regla para los Cambios motion siguientes: ninguna `transition` en un selector
  de especificidad (0,2,0) o mayor (lo verifica el reviewer en cada Cambio).
  El anti-flash de `index.html` no se toca: la supresión rige solo los cambios
  interactivos.
- Imágenes en `public/images/`: son contenido, no estilos. `avatar.png` es la foto
  real del sitio; los `testimonials/*.svg` se conservan como fixture del ejemplo
  `data/cv.example.{en,es}.json` aunque el sitio no los muestre (`testimonials: []`).
  El contenido real sí trae `downloadCvUrl`: el PDF vive en `public/cv/…` y se sirve
  con `assetUrl` para respetar el `base` de despliegue (#107, decisión #109).
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
- Al cambiar el tema agrega `data-theme-switching` a `<html>` **antes** de
  aplicar el nuevo `data-theme` y lo remueve tras dos frames (mock
  `requestAnimationFrame`/timers); vale para `toggleTheme` y para el cambio del
  sistema (RF-9).
- Cleanup: al desmontar el provider no queda `data-theme-switching` en `<html>`;
  un cambio rápido vuelve a suprimir sin dejar estado huérfano (RF-9).
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
- **Ejemplos del kit** (`content.test.ts`, decisión #109): `validateCv` acepta
  `data/cv.example.en.json` y `data/cv.example.es.json` (siguen siendo schema-valid
  aunque el sitio ya no los use como contenido). **No** se pide que
  `cv.{en,es}.json` sean copia de los ejemplos: ese caso se eliminó con #108/#109.
- **Esquema al día** (`schema.test.ts`): las listas de `@data/constants` son
  iguales a los `enum` del esquema y `data/cv.types.generated.ts` está al día
  (regenerarlo en memoria y comparar).

**Motion tokens (`tokens/tokens.css`, inspección, RF-10):**
- Valores exactos de la escala aprobada: `--duration-fast: 0.15s`,
  `--duration-base: 0.2s`, `--duration-slow: 0.3s`, `--duration-exit: 0.22s`,
  `--duration-stagger: 0.03s`, `--ease-enter: cubic-bezier(0.22, 1, 0.36, 1)`,
  `--ease-exit: cubic-bezier(0.4, 0, 1, 1)`; `--ease-standard` y
  `--ease-emphasized` sin cambio.
- Con `prefers-reduced-motion: reduce`, las **cinco** duraciones (fast, base,
  slow, exit, stagger) valen `0.01ms`.

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
- No usar `!important` en la supresión de transiciones del cambio de tema
  (`data-theme-switching`), ni tocar el anti-flash de `index.html` para ella
  (la supresión es solo para cambios interactivos).
- No agregar `@keyframes`, librerías de animación ni transiciones que usen
  duraciones fuera de los tokens (RF-10; la escala vive en `tokens.css`).
