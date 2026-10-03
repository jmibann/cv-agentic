# Foundation — tasks

Orden de dependencia (ver plan.md): T1 → T2 → T2b → T3 → T4 → T5 → T6 → T7 →
T8 → T9 → T10 → T11. Una tarea por encargo; commits `test(Foundation): Tn` →
`feat(Foundation): Tn` (T2b es excepción: un solo commit `test(Foundation): T2b`
porque solo renombra títulos de su propio archivo, sin implementación nueva).

- [x] **T1. Andamiaje del proyecto único: configs, dependencias exactas, alias.** RF-1 (contrato API: scripts y deps), API/Anatomía (alias `@data` en Vitest) — 529199f
  - Hecho cuando: `package.json` tiene `"private": true`, `"type": "module"`,
    `"engines.node": "^22.12.0 || >=24"` y solo las deps/rangos de
    `docs/README.md` (TypeScript `~6.0`) con los 9 scripts; `.nvmrc` dice `24`;
    `npm install` genera y se commitea `package-lock.json`; `tsconfig.json`
    único (strict + `noUnusedLocals`/`noUnusedParameters`/
    `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`,
    `resolveJsonModule`, `paths` sin `baseUrl`, `types: ["vite/client","node"]`,
    incluye `src/`, `data/`, `vite.config.ts`); `vite.config.ts` con plugin
    react, `resolve.alias` y bloque `test` (jsdom, `globals: false`,
    setup T2 tolerado inexistente aún); `eslint.config.js` flat con
    typescript-eslint strict, react-hooks, react-refresh, `no-restricted-syntax`
    para `#[0-9a-fA-F]{3,8}\b|rgb(|hsl(` en `.tsx` e `ignores` de generados y
    `dist/`; el test `src/tooling.smoke.test.ts` (importa `LOCALES` desde
    `@data/constants`) pasa con `npm test`, y `npm run lint` y
    `npm run typecheck` corren en verde.

- [x] **T2. Setup de Vitest: jest-dom, cleanup explícito, mocks y limpieza global.** Tests esperados (Tooling: cleanup entre tests) — e8a51fa (+ fix 2fb4833)
  - Hecho cuando: `src/test/setup.ts` (referenciado por la config) importa
    `@testing-library/jest-dom/vitest`, registra `afterEach(cleanup)` de RTL y
    mocks de `matchMedia` (con `addEventListener`), `ResizeObserver`,
    `Element.prototype.scrollTo` y `HTMLDialogElement.prototype.showModal/close`
    si jsdom no los trae, más un `afterEach` que limpia `localStorage`,
    `data-theme`, `lang` y `location.hash`; los 3 tests de
    `src/test/setup.test.ts` pasan (el DOM no acumula un botón repetido;
    `matchMedia` responde; `localStorage` llega vacío al test siguiente) y el
    smoke de T1 sigue en verde.

- [x] **T2b. Renombre L2 de los títulos de test del smoke de T1.** L2 (constitución), T1 (corrección de deuda) — 4a20573
  - Hecho cuando: `git show -p` del commit `test(Foundation): T2b` toca **solo**
    `src/tooling.smoke.test.ts` y cambia **únicamente** los títulos de
    `describe`/`it` a inglés (aserciones e imports intactos); `npm run lint`,
    `npm run typecheck` y `npm test` en verde.

- [ ] **T3. Helper de accesibilidad `expectNoA11yViolations` sobre axe-core.** Tests esperados (Helper de accesibilidad)
  - Hecho cuando: `src/test/a11y.ts` expone
    `expectNoA11yViolations(container: Element): Promise<void>` con
    `axe.run` y las reglas `color-contrast` y `region` desactivadas, y el
    mensaje lista `id (impact): targets`; `src/test/a11y.test.ts` pasa: un
    `<img>` sin `alt` hace que rechace y un botón con texto no produce
    violaciones.

- [ ] **T4. `index.html`: anti-flash tal cual theming.md, lang, theme-color.** RF-1
  - Hecho cuando: `index.html` tiene `<html lang="en">`,
    `<meta name="theme-color" content="#eceef4">`, el script inline idéntico al
    de `foundations/theming.md` (tema → `theme-color` → idioma, todo en
    `try/catch`) ubicado antes de cualquier `<link>`/`<script src>` del bundle,
    `#root` y el `<script type="module" src="/src/main.tsx">`; y
    `src/test/anti-flash.test.ts` pasa leyendo ambos archivos: los dos
    literales del script igualan a `--palette-light-bg` y `--palette-dark-bg`
    de `tokens/tokens.css`.

- [ ] **T5. `ThemeProvider` + `useTheme`.** RF-2, RF-3, RF-4, RF-5
  - Hecho cuando: los 7 tests de `ThemeProvider.test.tsx` pasan: inicial desde
    `data-theme` (sin recalcular); `toggleTheme` alterna `data-theme` y
    persiste `cv:theme`; si `localStorage` lanza, el tema cambia igual en
    memoria; sin preferencia, un cambio de `prefers-color-scheme` (mock) aplica
    `data-theme`; con preferencia guardada, se ignora; `<meta theme-color>`
    toma el valor spíado de `--color-bg` tanto por toggle como por cambio de
    sistema (RF-4, con `vi.spyOn(window, "getComputedStyle")`); `useTheme` fuera
    del provider lanza error descriptivo.

- [ ] **T6. Claves de interfaz en/es + `format()`.** RF-6 (parcial: `t`), Tests esperados (`format`)
  - Hecho cuando: `ui.en.ts` exporta `uiEn as const` con **todas** las claves de
    `foundations/i18n.md` y el tipo `UiStrings` (`DeepStringify`); `ui.es.ts`
    exporta `uiEs satisfies UiStrings` (una clave de más o de menos rompe
    `npm run typecheck`, que está en verde); `format.ts` exporta `format` pura y
    su test pasa: un placeholder, varios, y placeholder ausente queda literal.

- [ ] **T7. `formatPeriod`.** RF-8
  - Hecho cuando: `formatPeriod({ start, end }, locale, presentLabel)` vive en
    `src/i18n/formatPeriod.ts` (pura, sin React/DOM) y pasan sus tests:
    `"2015"`+`null` → `"2015 — Present"`/`"2015 — Actualidad"`;
    `"2019-03"`+`"2021-11"` → `"Mar 2019 — Nov 2021"`/`"mar 2019 — nov 2021"`;
    separador `" — "` en todos los casos; `Intl` con el `locale` recibido.

- [ ] **T8. Scripts de datos operativos: tipos y validador generados + `schema.test.ts`.** RF-7 (parcial: generados al día), Tests esperados (Esquema al día)
  - Hecho cuando: `npm run gen:types` y `npm run build:validator` corren desde
    `package.json` y commitean `data/cv.types.generated.ts` y
    `data/validate-cv.generated.{js,d.ts}` (este último declara
    `validateCv(data: unknown): data is CvData` y `validateCv.errors`) con
    encabezado "GENERADO — no editar"; reejecutarlos no genera `git diff`;
    `validate:content` funciona con el validador; los 2 tests de
    `src/content/schema.test.ts` pasan: las listas de `@data/constants` igualan
    los `enum` del esquema y los tipos generados están al día (regenerar en
    memoria y comparar).

- [ ] **T9. Contenido inicial validado: `cv.{en,es}.json` + `index.ts` + `content.test.ts`.** RF-7
  - Hecho cuando: `cv.en.json`/`cv.es.json` son copia de
    `data/cv.example.{en,es}.json` con `"$schema": "../../data/cv.schema.json"`;
    `src/content/index.ts` expone `cvByLocale: Record<Locale, CvData>` tras
    `load()` que lanza con `validateCv.errors` si el JSON es inválido; pasan
    los tests: paridad de ids/orden por colección y campos no traducibles
    idénticos (lista canónica), `start` ≤ `end` con los 3 casos (`2017-06`→
    `2017` válido, `2018`→`2017` inválido, `2017-06`→`2017-05` inválido) y
    rechazos en memoria (mes `99`, red desconocida, campo extra);
    `npm run validate:content` en verde.

- [ ] **T10. `LocaleProvider` + `useLocale` + `useCv`.** RF-5, RF-6
  - Hecho cuando: los 5 tests de `LocaleProvider.test.tsx` pasan: inicial desde
    `<html lang>`; `setLocale` cambia `lang`, persiste `cv:locale` y conmuta `t`
    y `useCv()` al idioma activo; si `localStorage` lanza, no rompe (cambia en
    memoria); `useLocale`/`useCv` fuera del provider lanzan error descriptivo.

- [ ] **T11. Estilos base, `main.tsx` y `App.tsx` provisorio ensamblados.** Estados (primer frame, Poppins), Accesibilidad (App pasa axe), Tests esperados (smoke App + axe)
  - Hecho cuando: `src/styles/global.css` trae el reset + la base tipográfica de
    `foundations/typography.md` §"Estilos base" (solo tokens) +
    `html:has(dialog[open]) { overflow: hidden }`; `src/main.tsx` importa
    `../tokens/tokens.css` (única importación por ruta relativa),
    `@fontsource/poppins/{300,400,500,600}.css` y `global.css`, y monta
    `ThemeProvider > LocaleProvider > App`; `src/App.tsx` renderiza un texto de
    `t` y el nombre de `useCv()`; `App.test.tsx` pasa (muestra ambos y cierra
    con `expectNoA11yViolations`); `npm run lint && npm run typecheck &&
    npm test` en verde sobre toda la pieza.
