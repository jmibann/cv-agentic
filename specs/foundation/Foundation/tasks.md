# Foundation — tasks

Orden de dependencia (ver plan.md): T1 → T2 → T2b → T3 → T3b → T4 → T5b → T5 →
T6 → T8 → T8b → T9 → T10 → T11. Una tarea por encargo; commits
`test(Foundation): Tn` → `feat(Foundation): Tn` (T2b y T3b son excepción: un solo
commit `test(Foundation): Tn` porque solo reparan texto —títulos o comentarios—
de sus archivos, sin implementación nueva; T5b es otra excepción: un solo commit
`fix(Foundation): T5b` porque solo cambia `eslint.config.js` y desbloquea el
`feat(Foundation): T5` —el `test(Foundation): T5` ya estaba commiteado en rojo—).
T2b, T3b y T4 se reordenaron al ejecutarse: T4 se implementó antes de registrar
T3b (deuda L1 detectada en su review).

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

- [x] **T3. Helper de accesibilidad `expectNoA11yViolations` sobre axe-core.** Tests esperados (Helper de accesibilidad) — 92e924e
  - Hecho cuando: `src/test/a11y.ts` expone
    `expectNoA11yViolations(container: Element): Promise<void>` con
    `axe.run` y las reglas `color-contrast` y `region` desactivadas, y el
    mensaje lista `id (impact): targets`; `src/test/a11y.test.ts` pasa: un
    `<img>` sin `alt` hace que rechace y un botón con texto no produce
    violaciones.

- [x] **T3b. Paso a español de los comentarios de `a11y.ts` y `a11y.test.ts` (deuda L1 de T3).** L1 (constitución), T3 (corrección de deuda) — 17b0409
  - Hecho cuando: un solo commit `test(Foundation): T3b` toca **solo**
    `src/test/a11y.ts` y `src/test/a11y.test.ts` y cambia **únicamente** el
    texto de sus comentarios a español (aserciones, títulos de `describe`/`it`,
    imports y lógica byte a byte intactos; como en T2b, el prefijo `test` es la
    excepción documentada porque no hay implementación nueva); `npm run lint`,
    `npm run typecheck` y `npm test` en verde (17 tests).

- [x] **T4. `index.html`: anti-flash tal cual theming.md, lang, theme-color.** RF-1 — 3a3d25a (+ test L1 fix c259db2)
  - Hecho cuando: `index.html` tiene `<html lang="en">`,
    `<meta name="theme-color" content="#eceef4">`, el script inline idéntico al
    de `foundations/theming.md` (tema → `theme-color` → idioma, todo en
    `try/catch`) ubicado antes de cualquier `<link>`/`<script src>` del bundle,
    `#root` y el `<script type="module" src="/src/main.tsx">`; y
    `src/test/anti-flash.test.ts` pasa leyendo ambos archivos: los dos
    literales del script igualan a `--palette-light-bg` y `--palette-dark-bg`
    de `tokens/tokens.css`.

- [x] **T5b. Excepción `allowExportNames` en `react-refresh` (Cambio aprobado por el usuario).** T5 (bloqueante de lint), plan §decisión 2 enmendada — 48bd323
  - Hecho cuando: `eslint.config.js` fija
    `react-refresh/only-export-components` con `{ allowConstantExport: true,
    allowExportNames: ["useTheme", "useLocale", "useCv"] }` (único cambio de
    config; `useLocale`/`useCv` se incluyen ahora para que T10 no repita el
    bloqueo); el error 110:17 de `ThemeProvider.tsx` desaparece; `npm run lint`
    solo puede quedar rojo por el test en rojo de T5 aún sin implementación, no
    por react-refresh; un solo commit `fix(Foundation): T5b ...` toca solo
    `eslint.config.js`.

- [x] **T5. `ThemeProvider` + `useTheme`.** RF-2, RF-3, RF-4, RF-5 — bcb4605
  - Hecho cuando: los 7 tests de `ThemeProvider.test.tsx` pasan: inicial desde
    `data-theme` (sin recalcular); `toggleTheme` alterna `data-theme` y
    persiste `cv:theme`; si `localStorage` lanza, el tema cambia igual en
    memoria; sin preferencia, un cambio de `prefers-color-scheme` (mock) aplica
    `data-theme`; con preferencia guardada, se ignora; `<meta theme-color>`
    toma el valor spíado de `--color-bg` tanto por toggle como por cambio de
    sistema (RF-4, con `vi.spyOn(window, "getComputedStyle")`); `useTheme` fuera
    del provider lanza error descriptivo.

- [x] **T6. Claves de interfaz en/es + `format()`.** RF-6 (parcial: `t`), Tests esperados (`format`) — 15a9592
  - Hecho cuando: `ui.en.ts` exporta `uiEn as const` con **todas** las claves de
    `foundations/i18n.md` y el tipo `UiStrings` (`DeepStringify`); `ui.es.ts`
    exporta `uiEs satisfies UiStrings` (una clave de más o de menos rompe
    `npm run typecheck`, que está en verde); `format.ts` exporta `format` pura y
    su test pasa: un placeholder, varios, y placeholder ausente queda literal.

- [x] **T7. `formatPeriod`.** RF-8 — 884bb2f
  - Hecho cuando: `formatPeriod({ start, end }, locale, presentLabel)` vive en
    `src/i18n/formatPeriod.ts` (pura, sin React/DOM) y pasan sus tests:
    `"2015"`+`null` → `"2015 — Present"`/`"2015 — Actualidad"`;
    `"2019-03"`+`"2021-11"` → `"Mar 2019 — Nov 2021"`/`"mar 2019 — nov 2021"`;
    separador `" — "` en todos los casos; `Intl` con el `locale` recibido.

- [x] **T8. Scripts de datos operativos: tipos y validador generados + `schema.test.ts`.** RF-7 (parcial: generados al día), Tests esperados (Esquema al día) — 14aec22 (+ enmienda `gen:types` opción A, aprobada por el usuario)
  - Nota para el cierre de pieza: `07eead6` corrigió el mecanismo del test propio en su ventana rojo con etiqueta `fix` y mensaje en español (debía ser `test(Foundation): T8 …` en inglés; precedententes `bac24cb`/`c259db2`). Contenido legítimo, aserciones intactas; registrar la regla en `docs/memory.md`/`docs/diagnostics.md` al cerrar F1. Además: `data/validate-cv.generated.js` importa `ajv/dist/runtime/ucs2length.js` (inherente al standalone; anotado por el reviewer).
  - Hecho cuando: `npm run gen:types` y `npm run build:validator` corren desde
    `package.json` y commitean `data/cv.types.generated.ts` y
    `data/validate-cv.generated.{js,d.ts}` (este último declara
    `validateCv(data: unknown): data is CvData` y `validateCv.errors`) con
    encabezado "GENERADO — no editar"; reejecutarlos no genera `git diff`;
    `validate:content` funciona con el validador; los 2 tests de
    `src/content/schema.test.ts` pasan: las listas de `@data/constants` igualan
    los `enum` del esquema y los tipos generados están al día (regenerar en
    memoria y comparar).

- [x] **T8b. Renombre L2 del título de `describe` en `schema.test.ts` (deuda detectada en la revisión completa de pieza).** L2 (constitución), revisión completa F1 — ae59762
  - Hecho cuando: un solo commit `test(Foundation): T8b` toca **solo**
    `src/content/schema.test.ts` y cambia **únicamente** el título
    `describe("Esquema al día (RF-7)")` (~línea 87) a inglés (aserciones,
    `it` e imports intactos); `npm run lint`, `npm run typecheck` y `npm test`
    en verde.

- [x] **T9. Contenido inicial validado: `cv.{en,es}.json` + `index.ts` + `content.test.ts`.** RF-7 — 59efc8d (+ reparo L2 c42e33d)
  - Nota para el cierre de pieza: `59efc8d` incluyó la corrección del **productor** del generado (`build-validator.ts`: shim de interop CJS/ESM `{ default: raw.default ?? raw }` + regeneración por script de `validate-cv.generated.js`) porque T9 es el primer consumidor runtime bajo Vitest; dictamen del reviewer: corrección legítima, determinismo y `.d.ts` intactos. Rastro pedido por el reviewer: registrarla en memoria/diagnostics al cerrar F1 (junto con la deuda `07eead6` de T8).
  - **Nota de Cambio (#109, 2026-11-11):** el criterio "son copia de
    `data/cv.example.{en,es}.json`" quedó reemplazado por **contenido real en/es
    validado**. Es el Cambio de contenido **#108** (aprobado por el usuario antes de
    ejecutarse), aplicado en `63f6665` (contenido + assets) y `befb0db` (tests: fuera
    el caso de copia fiel, agregada la validación de ambos ejemplos). El resto del
    "Hecho cuando" sigue vigente y la pieza sigue `implementada`.
  - Hecho cuando: `cv.en.json`/`cv.es.json` traen el contenido en/es y declaran
    `"$schema": "../../data/cv.schema.json"` (al fechar la tarea eran copia de
    `data/cv.example.{en,es}.json`; ver nota #109);
    `src/content/index.ts` expone `cvByLocale: Record<Locale, CvData>` tras
    `load()` que lanza con `validateCv.errors` si el JSON es inválido; pasan
    los tests: paridad de ids/orden por colección y campos no traducibles
    idénticos (lista canónica), `start` ≤ `end` con los 3 casos (`2017-06`→
    `2017` válido, `2018`→`2017` inválido, `2017-06`→`2017-05` inválido) y
    rechazos en memoria (mes `99`, red desconocida, campo extra);
    `npm run validate:content` en verde.

- [x] **T10. `LocaleProvider` + `useLocale` + `useCv`.** RF-5, RF-6 — faae4c2
  - Hecho cuando: los 5 tests de `LocaleProvider.test.tsx` pasan: inicial desde
    `<html lang>`; `setLocale` cambia `lang`, persiste `cv:locale` y conmuta `t`
    y `useCv()` al idioma activo; si `localStorage` lanza, no rompe (cambia en
    memoria); `useLocale`/`useCv` fuera del provider lanzan error descriptivo.

- [x] **T11. Estilos base, `main.tsx`, `App.tsx` provisorio ensamblados + placeholders `public/images/`.** Estados (primer frame, Poppins), Accesibilidad (App pasa axe), Tests esperados (smoke App + axe), Anatomía ~69 y Estilos ~171 (placeholders) — 79b7133
  - Registro: los placeholders `public/images/{avatar.svg,testimonials/{maria,john,lena}.svg}` los exige la spec (Anatomía/Estilos) y ningún plan/tarea previa los asignaba; se agregan acá sin alcance nuevo (silueta neutra, sin texto/marcas, `viewBox` cuadrado; `foundation.md` ítem 1).
  - Hecho cuando: `src/styles/global.css` trae el reset + la base tipográfica de
    `foundations/typography.md` §"Estilos base" (solo tokens) +
    `html:has(dialog[open]) { overflow: hidden }`; `src/main.tsx` importa
    `../tokens/tokens.css` (única importación por ruta relativa),
    `@fontsource/poppins/{300,400,500,600}.css` y `global.css`, y monta
    `ThemeProvider > LocaleProvider > App`; `src/App.tsx` renderiza un texto de
    `t` y el nombre de `useCv()`; `App.test.tsx` pasa (muestra ambos y cierra
    con `expectNoA11yViolations`); `npm run lint && npm run typecheck &&
    npm test` en verde sobre toda la pieza.
  - Deudas para el registro de cierre F1 (reviewer de T11 + revisión completa):
    ① `StrictMode` omitido por ausencia de mandato (decisión a registrar; hoy
    solo comentado en `src/main.tsx`); ② `value` de contexto sin `useMemo` en
    ambos providers (coherente con T5 aprobado; registro); ③ typos
    "recalculera" en `ThemeProvider.test.tsx:47` y `LocaleProvider.test.tsx:51`
    (comentarios, no títulos); ④ `data/validate-cv.generated.js` importa
    `ajv/dist/runtime/ucs2length.js` al bundle (runtime-helper de ajv
    standalone; decide el usuario en la puerta F1).

- [x] **T12. Cambio F3 (previo a ControlsBar/T1 y Timeline/T2): `formatPeriodEndpoint` exportado + `controls.lightMode`.** RF-8 (+ Tests esperados de la spec actualizada) — Cambio aprobado en la Clarificación F3 (decisiones 1=a y 12=a, puerta de Plan F3) — 29b063f  - Hecho cuando: `src/i18n/formatPeriod.ts` exporta
    `formatPeriodEndpoint(value, locale): string` (la actual `formatEndpoint`
    privada, ahora exportada; `formatPeriod` queda con la misma firma y
    comportamiento, sus tests F1 pasan sin tocar); pasan los nuevos tests de
    la función (año suelto tal cual; `"YYYY-MM"` → `"Mar 2019"` en / `"mar 2019"`
    es); `ui.en.ts` y `ui.es.ts` agregan `controls.lightMode`
    ("Light mode" / "Modo claro") manteniendo `satisfies UiStrings` en verde;
    `foundations/i18n.md` (tabla de claves y "Fechas y períodos") ya documenta
    ambos (editado por el orchestrator en esta misma decisión); lint +
    typecheck + test verdes. No toca nada más de F1.

- [x] **T13. Favicon SVG (Cambio F5 2026-10-08, hallazgo D4 de `docs/qa-report.md`).** spec → Anatomía (`index.html` + `public/favicon.svg`) — b93c510 (APROBADA incl. corrección intra-tarea T13b `06bf088`→`b93c510`, régimen normal post-enmienda de spec `69f6cfd`. Link colocado DESPUÉS del anti-flash por el contrato T4 (mínima resolución, tasks lo habilita). Menores: typo "geomtria" cuerpo `34e0d87`; el `it` no asserta vértices del polygon (verificado por lectura); pendiente F5 vivo: consola sin 404)
  - Hecho cuando: `index.html` incluye `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` en el `<head>` (junto al theme-color, antes del script anti-flash donde corresponda); `public/favicon.svg` existe: hexágono de 64×64 viewBox, fill `#304cfd` (el literal del asset, igual que `--color-accent`; SVG público no es CSS de app), sin texto; `src/test/anti-flash.test.ts` (o el test que lee `index.html`) agrega la aserción del link + existencia del archivo (con `fs` como hace con tokens.css); consola sin 404 en la re-pasada F5; lint/typecheck/test/build verdes.
  - Corrección intra-tarea (decisión del orchestrator post-entrega, registrada): el fill original `#ffb729` provenía de un error del propio brief (el literal de `--color-accent` del kit es `#304cfd`, tokens.css:97); se enmienda spec/tasks (esta línea) y se alinean asset + test en commits nuevos `test(Foundation): T13b` + `fix(Foundation): T13` (régimen normal, no `--amend`).

- [x] **T14. Favicon tipo app, apple-touch-icon y título con nombre (#115).** spec → Anatomía (`index.html`, `public/favicon.svg`, `public/apple-touch-icon.png`) — 9ebcca4 (tests `3b4db39` + corrección `516621a` T14b: Vite reescribía el `new URL` literal del PNG; aserciones intactas. Gates 448/40 + build verdes; navegador: título OK, ambos íconos 200, consola limpia). Post-deploy: SVG mal formado (`--` en el comentario XML) → T14c `afbc660` (test XML bien formado) + `fix` `05e2cb6`; 449/40 verdes
  - Hecho cuando: `index.html` lleva `<title>Juan Manuel Ibáñez · Frontend Engineer</title>` y `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` (después del anti-flash, contrato T4); `public/favicon.svg` es un cuadrado redondeado (`<rect … rx="14"`) con fill `#304cfd`, hexágono en trazo blanco y monograma "JM" en paths (sin `<text>`); `public/apple-touch-icon.png` existe y es PNG 180×180; `src/test/anti-flash.test.ts` agrega un `it` con esas aserciones (rojo en `test(Foundation): T14`); lint/typecheck/test/build verdes.

## Cambio motion (#106) — RF-9/RF-10 (puerta de Plan+Tareas aprobada 2026-11-12 con ajustes)

- [x] **T15. Escala de motion en `tokens/tokens.css`.** RF-10 — **kit: lo ejecuta y commitea el usuario** (precedente `--z-skip` `b2563f0`); solo-inspección (#101, rojo no exigible) — c2befd1 (usuario); el contrato queda cubierto por el test de T17 `122a996` (APROBADO), que fija los valores de esta tarea
  - Hecho cuando: `--duration-fast: 0.15s` (sin cambio), `--duration-base: 0.2s`
    (antes 0.3s), `--duration-slow: 0.3s` (antes 0.6s), `--duration-exit: 0.22s`
    y `--duration-stagger: 0.03s` nuevos; `--ease-enter: cubic-bezier(0.22, 1,
    0.36, 1)` y `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` nuevos;
    `--ease-standard`/`--ease-emphasized` intactos; el bloque
    `prefers-reduced-motion: reduce` de `tokens.css` colapsa a `0.01ms` las
    **cinco** duraciones (fast, base, slow, exit, stagger); `lint`/`typecheck`/
    `test` en verde tras el commit del usuario.
- [x] **T16. `data-theme-switching` en `ThemeProvider` + regla global.** RF-9 — delegable a `foundation` sin esperar T15 — 6dda460 (test) + c0bc995 (feat); reviewer APROBADO (454/40; menor registrada: comentario "nada que huérfano" roto en `ThemeProvider.test.tsx:399` + typo "huelfano" cuerpo `6dda460`, deuda de forma para el próximo toque del archivo)
  - Hecho cuando: `test(Foundation): T16` (rojo) agrega a `ThemeProvider.test.tsx`
    los casos con rAF/timers falsos: (a) al cambiar el tema por `toggleTheme`
    el atributo está en `<html>` **antes** de aplicar el nuevo `data-theme` y
    se quita tras dos frames; (b) igual por cambio del sistema sin preferencia
    guardada; (c) desmontar el provider lo limpia; (d) un segundo cambio rápido
    reinicia la supresión sin dejar atributo huérfano; (e) el montaje inicial
    **no** lo aplica (ref de primer montaje). `feat(Foundation): T16`:
    `data-theme-switching` + `data-theme` + meta `theme-color` aplicados en el
    **mismo** `useLayoutEffect` (decisión 1 del plan); remoción tras doble
    `requestAnimationFrame`; cleanup incondicional con `cancelAnimationFrame`;
    en `src/styles/global.css` la regla `:root[data-theme-switching] *` +
    `*::before`/`*::after` con `transition: none`, sin `!important`
    (especificidad (0,2,0), ajuste 1 de la puerta); los tests F1 preexistentes
    de `ThemeProvider` siguen verdes; lint/typecheck/test verdes; `feat` no
    toca tests; no se toca `index.html` ni `tokens/tokens.css`.
- [x] **T17. Test de contrato de los tokens de motion (lectura `fs`).** RF-10 — requiere T15 aplicado; delegable a `foundation`; commit único `test(Foundation): T17` (#101: aserta el documento aprobado, verde al escribirse) — 122a996 (T15 del usuario `c2befd1`); reviewer APROBADO (456/40; mutaciones en memoria: cambia/borra/zona → rompe; menores de forma: `declaredValue` toma la primera declaración vs última de cascada y sensible a comentario inline antes del `;` — deuda si el test se vuelve a tocar)
  - Hecho cuando: un test en `src/` (extensión de `src/test/anti-flash.test.ts`
    o nuevo archivo en la carpeta de tests) lee `tokens/tokens.css` con `fs` y
    aserta los valores exactos de T15: las cinco duraciones (`0.15/0.2/0.3/
    0.22/0.03s`), `--ease-enter` y `--ease-exit` con sus `cubic-bezier`, y que
    el bloque `prefers-reduced-motion: reduce` fija `0.01ms` en las cinco;
    el test **no** escribe `tokens.css` (fuera del permiso `edit`); el commit
    toca solo archivos de test; lint/typecheck/test verdes.
- [x] **T18. Cierre del Cambio: docs de kit + QA + build.** — `foundations/motion.md` lo ejecuta y commitea el usuario; la QA la hace el `reviewer` con la app servida por el usuario (#91) — doc del kit `e3c511d` (usuario); reviewer **APROBADO** 2026-11-13 (QA visual en vivo ~200 ms por transición, sin jank; cambio de tema con 0 eventos de color y sin atributo huérfano; regla (0,2,0): 0 violaciones en 12 selectores; lint/typecheck/test 456/40 + build verdes). Menores registrados para los Cambios 2–4: delays de stagger deben derivar de `calc(n × --duration-stagger)` (revisa el reviewer del Cambio 3); `transition: color` inerte en `Sidebar.module.css:386` → Cambio 3; comentario rancio "0.3s" en `TestimonialDialog.module.css:79` → Cambio 4. Con la aprobación del usuario, `spec.md` → `Estado: implementada` y documentos de estado actualizados (#86, §XXIV).
  - Hecho cuando: `foundations/motion.md` documenta la escala nueva, el cambio
    de tema sin transiciones (`data-theme-switching`), reduced motion con
    delays anulados, y la regla para los Cambios motion 2–4: **ninguna
    `transition` en un selector de especificidad (0,2,0) o mayor** (la verifica
    el reviewer en cada Cambio); QA visual en navegador de las transiciones
    existentes con `--duration-base` a 0.2s (tabs, chevron, Button hover/press,
    bullet del carrusel, dialog; §2.3 de la propuesta) sin jank; `npm run build`
    verde; con la aprobación del usuario, `spec.md` vuelve a
    `Estado: implementada` y se actualizan los documentos de estado (#86).

## Cambio #117 — Metadatos SEO y para compartir (spec reaprobada en `472bc1d`; puerta de Plan+Tareas aprobada 2026-11-14)

- [ ] **T19. Metadatos en `index.html` + `public/og-image.png`.** RF-11, RF-12, RF-13, RF-14
  - Hecho cuando: `test(Foundation): T19` (rojo) toca **solo**
    `src/test/anti-flash.test.ts` y **solo agrega**, sin modificar los tests
    de T4/T13/T14/T14b/T17: (a) las nueve etiquetas nuevas de la tabla
    "Metadatos de compartir" de la spec con sus valores literales exactos;
    (b) conteo: exactamente 5 `meta[property^="og:"]` y 1
    `meta[name^="twitter:"]` en `index.html`; (c) `og:title` igual al texto
    del `<title>`; (d) el `<link rel="canonical">` y el bloque
    `<script type="application/ld+json">` aparecen después del índice del
    script anti-flash; (e) JSON-LD **parseado** (`JSON.parse` + `toEqual`
    contra el objeto esperado de seis claves exactas; el formato del bloque
    no es contrato): `name`/`jobTitle`/`sameAs` (en orden) coinciden con
    `profile.name`, `profile.headline` y `social[].url` de
    `src/content/cv.en.json` leído con `fs`, y `url` del JSON-LD ≡ `href`
    del canonical ≡ `og:url` (además del literal); (f) `public/og-image.png`
    es PNG real 1200×630 (firma + IHDR, como el apple-touch de T14, **con la
    ruta en una variable** — lección T14b). **Régimen #101 declarado (como
    en T17):** la aserción (f) nace en verde porque el PNG ya existe sin
    commitear; el commit sigue rojo por (a)–(e). `feat(Foundation): T19`:
    `index.html` con los `<meta>` (description, og×5, twitter) después del
    `<title>` y antes del anti-flash, y canonical + JSON-LD después del
    apple-touch-icon, antes de `</head>`; **textos literales exactos de la
    tabla de la spec, sin ninguna otra etiqueta** (condición 1 de #117); el
    anti-flash y su test "verbatim" intactos; `public/og-image.png` entra
    **intacto** al commit con `git add` explícito de la ruta (no se
    regenera); el `feat` no toca tests; `npm run lint`, `npm run typecheck`
    y `npm test` en verde tras el `feat`.
  - Cierre de pieza (no es trabajo del builder): revisión completa del
    reviewer + `npm run build` (#80) + QA sobre `dist/index.html` (etiquetas
    intactas: Vite no reescribió los literales) y `dist/og-image.png`
    presente; docs #86 + BACKLOG ("Metadatos y Open Graph" resuelto; "SEO
    por idioma" queda abierto) + hashes de #117, a cargo del orchestrator;
    con la aprobación del usuario, `spec.md` vuelve a `Estado: implementada`.
