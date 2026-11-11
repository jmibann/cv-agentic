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
