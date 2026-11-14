# Foundation — plan

Plan de la pieza `foundation/Foundation` (F1). Contrato:
[spec.md](spec.md) (`Estado: aprobada`). Ejecuta el agente `foundation`, una
tarea por encargo ([tasks.md](tasks.md)).

## Archivos y responsabilidades (agrupados por tarea)

| Tarea | Archivos que crea | Responsabilidad |
|---|---|---|
| T1 | `package.json` · `package-lock.json` · `.nvmrc` · `.gitignore` · `tsconfig.json` · `vite.config.ts` · `eslint.config.js` · `src/tooling.smoke.test.ts` | Andamiaje del proyecto único: deps **exactas** de `docs/README.md`, scripts, alias `@data/*` (tsconfig `paths` + `resolve.alias` + Vitest), TS `strict` con flags y `types` explícitos, ESLint flat con `no-restricted-syntax` anti-colores en `.tsx`, Vitest jsdom `globals: false` |
| T2 | `src/test/setup.ts` · `src/test/setup.test.ts` | jest-dom/vitest, `afterEach(cleanup)` explícito, mocks (`matchMedia`, `ResizeObserver`, `scrollTo`, `showModal/close` si faltan), limpieza de `localStorage`/`data-theme`/`lang`/`hash` |
| T3 | `src/test/a11y.ts` · `src/test/a11y.test.ts` | `expectNoA11yViolations` sobre `axe-core` (off: `color-contrast`, `region`), tal cual spec §API / `foundation.md` 5b |
| T4 | `index.html` · `src/test/anti-flash.test.ts` | `<html lang="en">`, `meta theme-color`, script anti-flash **tal cual** `foundations/theming.md`, `#root` + `<script type="module" src="/src/main.tsx">` |
| T5 | `src/providers/ThemeProvider.tsx` · `ThemeProvider.test.tsx` | `ThemeProvider` + `useTheme`: inicial de `data-theme`, efecto único aplica `data-theme` + `theme-color`, `toggleTheme`/`setTheme` con persistencia try/catch, listener de `matchMedia` sin preferencia (RF-2…RF-5) |
| T6 | `src/i18n/ui.en.ts` · `src/i18n/ui.es.ts` · `src/i18n/format.ts` · `format.test.ts` | Claves canónicas de `foundations/i18n.md` (`uiEn as const`, `UiStrings = DeepStringify`, `uiEs satisfies`), `format()` pura |
| T7 | `src/i18n/formatPeriod.ts` · `formatPeriod.test.ts` | `formatPeriod({start,end}, locale, presentLabel)` pura (RF-8); no depende de "hoy" (el `presentLabel` entra por parámetro) |
| T12 (Cambio F3) | `src/i18n/formatPeriod.ts` (+ su test) · `src/i18n/ui.{en,es}.ts` | Exportar `formatPeriodEndpoint` (formateo por extremo, la privada actual) sin tocar `formatPeriod`; clave `controls.lightMode` en ambos idiomas (lo consumen ThemeToggle/ControlsBar en F3) |
| T8 | `src/scripts/build-validator.ts` · `data/cv.types.generated.ts` · `data/validate-cv.generated.{js,d.ts}` · `src/content/schema.test.ts` | Scripts `gen:types` y `build:validator` operativos; generados commiteados con encabezado "GENERADO"; `schema.test.ts` (enums ≡ constantes; tipos al día) |
| T9 | `src/content/cv.en.json` · `cv.es.json` · `index.ts` · `content.test.ts` | Contenido en/es con `"$schema"` (arrancó como copia de `data/cv.example.{en,es}.json`; hoy porta el **CV real** — Cambio #108/#109, commits `63f6665`/`befb0db`; los ejemplos quedan como fixture de tests); `load()` + `cvByLocale` con `validateCv` (RF-7); paridad en/es, orden de fechas, rechazos en memoria |
| T10 | `src/providers/LocaleProvider.tsx` · `LocaleProvider.test.tsx` | `LocaleProvider` + `useLocale` + `useCv` (RF-5, RF-6): inicial de `<html lang>`, `setLocale` fija `lang` + persiste + conmuta `t`/`useCv()` |
| T11 | `src/styles/global.css` · `src/main.tsx` · `src/App.tsx` · `src/App.test.tsx` | Base tipográfica de `foundations/typography.md` + reset + `html:has(dialog[open])`; `main.tsx` importa tokens (ruta relativa, única vez), `@fontsource/poppins/{300,400,500,600}`, monta `ThemeProvider > LocaleProvider > App`; `App.tsx` provisorio (un texto de `t` + nombre de `useCv()`) |

## Funciones puras (C1)

- `format(template, values)` — sin fecha; reemplaza `{clave}`, placeholder
  ausente queda literal.
- `formatPeriod(period, locale, presentLabel)` — lógica de fechas; **"hoy" no
  interviene**: `end: null` → `presentLabel` (parámetro), normalización
  solo para comparar (`YYYY` → `YYYY-01`/`YYYY-12` en T9, no aquí).
- `load(raw, file)` (T9) — type guard `validateCv` + throw con
  `validateCv.errors`; sin React ni DOM.
- `expectNoA11yViolations(container)` (T3) — wrapper de `axe.run` + `expect`.

## Algoritmos no triviales (pseudocódigo)

**T8 `build-validator.ts`** (ajv standalone, draft-07):

```
leer data/cv.schema.json
ajv = new Ajv({ code: { source: true }, allErrors? no → default })  // standalone: true, type: "module"?
compile(schema) → módulo standalone → escribir data/validate-cv.generated.js
escribir data/validate-cv.generated.d.ts:
  import type { CvData } from "./cv.types.generated";
  export declare function validateCv(data: unknown): data is CvData;
  export declare namespace validateCv { let errors: … | null }  // según forma de ajv standalone
```

**T4 `anti-flash.test.ts`**: leer `index.html` y `tokens/tokens.css` con
`node:fs` (Vitest permite imports de Node); extraer con regex los dos
literales del script (`#eceef4`/`#151517`) y los valores de
`--palette-light-bg`/`--palette-dark-bg`; `expect(ambos pares).toEqual`.
Además: el `<script>` inline aparece antes de cualquier `<link>`/`<script
src>` del bundle.

**T5 RF-4 en jsdom**: `getComputedStyle` no resuelve variables de `tokens.css`
→ los tests spían `window.getComputedStyle` para devolver un valor controlado
de `--color-bg` y verifican que el `content` del meta **toma ese valor** en
ambas vías (toggle y sistema). Sin spy, el test solo afirmaría `""` y no
verificaría nada.

## Interfaz

La API completa (firmas de providers, hooks, `format`, `formatPeriod`,
`cvByLocale`, `expectNoA11yViolations`, scripts y alias) está fijada en
[spec.md §API](spec.md); este plan no la extiende.

## Decisiones (con alternativa descartada)

1. **Vitest dentro de `vite.config.ts`** (bloque `test`: jsdom,
   `globals: false`, `setupFiles`): un solo archivo de tooling. *Descartado:*
   `vitest.config.ts` separado (dos fuentes de config para el mismo proyecto,
   roza S2).
2. **`eslint.config.js` con `ignores` para `data/*.generated.*` y `dist/`**:
   la regla anti-colores y `strict` no pueden aplicar a código generado que no
   controlamos. *Descartado:* retocar los generados (prohibido: "no editar a
   mano").
   **Enmienda (Cambio aprobado por el usuario, 2026-10-03):**
   `react-refresh/only-export-components` se configura con
   `allowExportNames: ["useTheme", "useLocale", "useCv"]`: la API de la spec
   fija provider + hook en el mismo `.tsx` y la regla, sin esta exención, hace
   insatisfacible ese contrato. No cambia ningún contrato observable de las
   piezas. *Descartado:* mover los hooks a `.ts` aparte (viola la Anatomía de
   la spec). Ejecutado como T5b.
3. **Helper de `build:validator` en `src/scripts/build-validator.ts`**
   ejecutado con `node` directo (Node 24 trae *type stripping* estable) —
   único lugar dentro del permiso `edit` del agente foundation (`src/**`).
   *Descartado:* `scripts/` en la raíz (fuera del allowlist) y `ajv-cli`
   (dependencia no aprobada, S1).
4. **`gen:types` por CLI de `json-schema-to-typescript`** con opción de banner
   "GENERADO — no editar"; el `.d.ts` del validador se escribe desde el helper
   de T8. *Descartado:* mantener tipos a mano (la fuente de verdad es el
   esquema; P1/C3).
5. **Paridad `ui.es.ts` solo por `satisfies UiStrings`** (typecheck =
   verificación, como dice `foundations/i18n.md`). *Descartado:* test runtime
   de claves de UI (no está en las fuentes; P3).
6. **`index.html` referencia `/src/main.tsx` desde T4** aunque `main.tsx`
   aparezca en T11: el `build` no corre por tarea (#80), así que el
   intermedio roto es invisible a los checks; el smoke de T4 no carga el
   bundle. *Descartado:* postergar el tag `script` a T11 (el anti-flash pierde
   su test de orden `<head>`).
7. **Tests que leen archivos del repo** (T4 anti-flash, T8 schema al día) con
   `node:fs` / API del generador en memoria, dentro de Vitest: son tests de
   contrato entre documentos, no de DOM. *Descartado:* verificarlos solo "a
   ojo" en revisión (RF-1 quedaría sin test, y la spec lo exige).
8. **El `App.tsx` provisorio no tiene CSS propio**: hereda `body` de
   `global.css`; así su test solo verifica contenido + axe (T11). *Descartado:*
   estilos de ejemplo (alcance nuevo que F4 borra).

## Estrategia de tests

- Cada Tn: commit `test(Foundation): Tn` con los tests nuevos en rojo (fallan
  por ausencia del código, no por error de setup) → commit `feat(Foundation): Tn`
  → `npm run lint && npm run typecheck && npm test` en verde (T5/#80). `feat`
  no toca archivos de test; `test` solo agrega.
- Identidad de commits por flag: `git -c user.name="jmiban" commit -m "…"`.
- `npm test` (Vitest run) como runner de toda la pieza; los mocks de T2 valen
  para todos los tests futuros; `expectNoA11yViolations` (T3) se usa ya en T11.
- Orden de dependencias: T1 → T2 → T3 → {T4, T5, T6, T7} → T8 → T9 → T10 → T11
  (T4–T7 entre sí son independientes; T5 usa los mocks de T2; T10 usa T6 y T9;
  T11 usa todo).
- Cobertura de RF: RF-1→T4; RF-2…RF-5→T5; RF-6→T6 (`t`) + T10 (set/inicial/
  storage); RF-7→T8 (generados al día) + T9 (`load`/rechazos); RF-8→T7.
- Al cerrar la pieza: `npm run build` en verde + verificación visual del
  reviewer con la app servida por el usuario (#91).

---

# Plan del Cambio motion (#106) — RF-9/RF-10

Aprobado por el usuario el 2026-11-12 con ajustes (especificidad (0,2,0),
`useLayoutEffect` con ref de montaje, orden de ejecución, RF-10 con test fs,
cierre con QA + build). Base: `specs/motion/proposal.md` §4.1. Unidad de
delegación: una tarea = `test(Foundation): Tn` (rojo) + `feat(Foundation): Tn`
(#73); T15 y T18 son de kit y los ejecuta el usuario.

## Archivos del Cambio (agrupados por tarea)

| Tarea | Archivos | Responsabilidad | Dueño |
|---|---|---|---|
| T15 | `tokens/tokens.css` | escala RF-10: `base 0.2s`, `slow 0.3s`, `exit 0.22s`, `stagger 0.03s`, `ease-enter`/`ease-exit`; reduced motion → las **5** duraciones a `0.01ms` | usuario (kit, precedente `--z-skip` `b2563f0`) |
| T16 | `src/providers/ThemeProvider.tsx` · `ThemeProvider.test.tsx` · `src/styles/global.css` | RF-9: switching + `data-theme` + meta en el **mismo** `useLayoutEffect`; regla `:root[data-theme-switching] *,::before,::after { transition: none }` | `foundation` |
| T17 | `src/test/anti-flash.test.ts` (o nuevo test fs en `src/`) | RF-10: contrato de los valores de `tokens.css` (5 duraciones, `ease-enter`/`ease-exit`, override reduced motion) leído con `fs` | `foundation` (escribe solo `src/**`; lee kit) |
| T18 | `foundations/motion.md` + QA navegador + `build` | docs: tokens, tema sin transiciones, reduced motion con delays, regla "sin `transition` en selectores ≥ (0,2,0)" (rige Cambios 2–4; la verifica el reviewer); QA §2.3 de la propuesta con `base` 0.2s | usuario + reviewer |

## Decisiones del Cambio (con alternativa descartada)

1. **Un solo `useLayoutEffect`**: agrega `data-theme-switching`, aplica
   `data-theme` y el meta `theme-color`; **ref de primer montaje** saltea la
   supresión inicial (coherente con spec: solo cambios interactivos).
   *Descartado:* `useEffect` pasivo + layout aparte (el `data-theme` puede
   pintar antes del switching y filtra la transición de color; hallazgo del
   usuario en la puerta).
2. **Doble `requestAnimationFrame`** para quitar el atributo; cleanup
   incondicional con `cancelAnimationFrame` al desmontar o al volver a cambiar.
   *Descartado:* `setTimeout` fijo (no garantiza el frame ni el orden).
3. **Regla global `:root[data-theme-switching] *` (0,2,0)**, sin
   `!important` (+ pseudos). *Descartado:* `html[data-theme-switching] *`
   (0,1,1): empata con `.social a`/`.contacts a` y pierde por orden de carga.
   *Descartado también:* clase `no-transition` por componente (invasivo).
4. **RF-10 con test `fs` (T17), no solo inspección**: `anti-flash.test.ts` ya
   lee `tokens.css` con `fs`; se le agregan las aserciones. Régimen #101:
   commit único `test(Foundation): T17`, verde al escribirse (espeja el
   documento aprobado de T15); requiere T15 aplicado.
5. **`--duration-slow` se repurposea** (0.6→0.3s; cero usos actuales).
   *Descartado:* token paralelo `--duration-content` (proliferación).
6. **No se toca el anti-flash** de `index.html`. *Descartado:* extender la
   supresión al primer paint.

## Ejecución y cobertura

- Orden: **T16 se delega ya** (no depende de T15: jsdom con rAF mockeado y la
  regla global no lee duraciones). **T15 la hace el usuario cuando pueda**;
  recién con T15 aplicado se delega **T17** (aserta los valores del documento).
  **T18** cierra el Cambio.
- Cobertura: RF-9 → T16 (tests: aplica antes del theme + quita a los 2 frames,
  cleanup al desmontar, cambio rápido sin huérfanos, vía sistema igual, montaje
  inicial sin atributo). RF-10 → T15 + T17.
- Cierre del Cambio: T18 — QA visual de las transiciones existentes a 0.2s
  (tabs, chevron, Button hover/press, bullet, dialog; §2.3 de la propuesta) +
  `npm run build` verde + aprobación del usuario → `Estado: implementada`.
- Commits de código: `test/feat/fix(Foundation): Tn` (T16), `test(Foundation):
  T17`; T15/T18 los commitea el usuario.

---

# Plan del Cambio #117 — Metadatos SEO y para compartir

Aprobado por el usuario el 2026-11-14 en la puerta de Plan+Tareas (spec
reaprobada en `472bc1d`). Base: decisión #117 (`docs/README.md`) y sus seis
condiciones.
Unidad de delegación: una tarea = `test(Foundation): T19` (rojo) +
`feat(Foundation): T19` (#73/#101).

## Archivos del Cambio (agrupados por tarea)

| Tarea | Archivos | Responsabilidad | Dueño |
|---|---|---|---|
| T19 | `index.html` · `src/test/anti-flash.test.ts` · `public/og-image.png` | RF-11…RF-14: los nueve bloques de metadatos con los literales de la tabla de la spec y la colocación aprobada; los tests de contrato se agregan a `anti-flash.test.ts` (solo agrega); el PNG del usuario entra **intacto** en el `feat` (no se regenera) | `foundation` |

## Decisiones del Cambio (con alternativa descartada)

1. **Colocación (aprobada en la puerta de spec):** los `<meta>` (description,
   og, twitter) después del `<title>` y **antes** del anti-flash — un `<meta>`
   no es `<link>` ni `<script src>`, el contrato T4 no se viola y el orden
   estándar es title→description→OG→twitter —; `<link rel="canonical">` y el
   JSON-LD después del bloque de íconos, antes de `</head>`. *Descartado:*
   todo al final del `<head>` (uniforme, pero separa `og:title` del `<title>`
   con el script en el medio). *Descartado también:* canonical antes del
   anti-flash (viola T4, `anti-flash.test.ts:123`).
2. **URLs literales absolutas del deploy de GitHub Pages, fijadas en el HTML**
   (condición 3 de #117; Vite no las reescribe en `index.html`). *Descartado:*
   derivarlas de `import.meta.env.BASE_URL` o `assetUrl()` (son runtime; el
   HTML de metadatos es estático y `og:*` exige URL absoluta).
3. **El test cruza el JSON-LD con `src/content/cv.en.json` leído con `fs`**
   (`name`/`jobTitle`/`sameAs`) **comparándolo parseado** (`JSON.parse` +
   `toEqual` contra el objeto de seis claves exactas; el formato del bloque no
   es contrato): si el contenido cambia y el JSON-LD no lo sigue, el desfase
   se detecta acá. Además identidad `url` del JSON-LD ≡ `href` del canonical
   ≡ `og:url` (si algún día cambia el dominio, no queda una etiqueta sin
   actualizar). *Descartado:* solo literales duplicados sin cruce (el desfase
   pasaría desapercibido). *Descartado también:* importar `cv.en.json` vía
   módulo (aquí rigen los contratos entre documentos del plan base, decisión
   7; `no-restricted-imports` de React/DOM no aplica: es un test `fs`).
4. **Sede de los tests: `src/test/anti-flash.test.ts`** (extensión, solo
   agrega). *Descartado:* archivo nuevo (dos sedes de contrato para el mismo
   `index.html`; el de T4 ya lee el archivo y tiene los helpers `capture` /
   `readRepoFile` y la lección T14b de la ruta en variable).
5. **Conteo de etiquetas como aserción separada** (exactamente 5
   `meta[property^="og:"]` y 1 `meta[name^="twitter:"]`): cubre el pasaje
   "ninguna otra etiqueta fuera de la lista" de RF-11 (condición 1).
   *Descartado:* dejar el límite solo en "No hacer" (sin test no es
   verificable, P3).
6. **Régimen #101 parcial y declarado:** la aserción del PNG (firma + IHDR
   1200×630) **nace en verde** porque el archivo ya existe sin commitear; el
   commit `test(Foundation): T19` es igualmente rojo por las etiquetas
   ausentes en `index.html`. Queda declarado en el cuerpo de T19 (tasks).

## Ejecución y cobertura

- Orden: única tarea **T19** (sin dependencias internas; la spec ya fija
  literales y colocación).
- Cobertura: RF-11 → literales exactos + conteo 5+1 + `og:title` ≡ `<title>`;
  RF-12 → JSON-LD parseado `toEqual` (seis claves) + cruce con `cv.en.json` +
  identidad `url`/canonical/`og:url`; RF-13 → orden canonical y JSON-LD tras
  el anti-flash (test T4 preexistente sigue vigente); RF-14 → PNG 1200×630
  (firma + IHDR, ruta en variable, lección T14b).
- El test "copies the inline script verbatim from foundations/theming.md" y
  el contrato T4 preexistente **no se tocan**: los `<meta>` nuevos no los
  afectan (`extractInlineScript` matchea solo `<script>` plano sin atributos;
  el JSON-LD lleva `type` y no colisiona).
- Cierre de pieza (la pieza vuelve a abrirse con este Cambio): al terminar
  T19, revisión completa del reviewer contra la spec + `npm run build` verde
  (#80) + QA del reviewer sobre `dist/index.html` (etiquetas intactas tras el
  build: Vite no reescribió los literales) y presencia de `dist/og-image.png`
  (sin servidor; inspección de `dist/`). Docs #86 + BACKLOG ("Metadatos y
  Open Graph" resuelto; "SEO por idioma" sigue abierto) + hashes de #117:
  los hace el orchestrator en la puerta de cierre, no el builder.
- Commits de código: `test(Foundation): T19` (rojo; `git add` explícito del
  archivo de test) → `feat(Foundation): T19` (`index.html` + `public/og-image.png`
  con `git add public/og-image.png` explícito; el `feat` no toca tests).
