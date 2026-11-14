# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
Solo la edita el orchestrator al cerrar puerta F o ante decisión de reglas (#86).
El detalle histórico vive en `docs/diagnostics.md` (§I–§XXVIII) y `docs/README.md` (#1–#117, con la enmienda de #116: `transition: none` excluido).

## Estado actual (2026-11-14)

- **Entregado — F1–F5 cerradas**; **28/28 `implementada`**; suite **472/41**. Recientes: **Cambio #117 CERRADO** (§XXVIII: metadatos SEO/OG + JSON-LD + `og-image.png` en `index.html` — Foundation reabierta y vuelta a `implementada`; primera reapertura por pedido nuevo, el flujo de Cambio funcionó completo); **sistema motion COMPLETO 4/4** (#106/#116, §XXIV–§XXVII).
- **Mantenimiento 2026-11-11/12 (§XIV–§XIX)**: CV real + 3 testimonios reales (#112/#113) con `assetUrl()`/base (#107); tests adaptados sin debilitar; QA visual aprobada (gap chevron↔nombre 72.84px a 375; `qa-report.md`). `headline`/cargos en inglés en `cv.es.json`: decisión editorial #109, **no re-reportarla**.
- **Motion: CERRADO 4/4** (§XXIV–§XXVII; propuesta marcada "IMPLEMENTADO"). #116 rige como **regla permanente** (`foundations/motion.md` + `AGENTS.md` → Convenciones, `11b475b`; aclaración: `transition: none` excluido). Sin pendientes del sistema; QA live cerró dialog: 200 ms `ease-enter`, cierre 0 eventos ×3 caminos.
- **CI (§XVII)**: Node **26 LTS** (`.nvmrc`, que lee el deploy, #110); el deploy corre `lint` → `test` → `build` y no publica si algo falla (#111). Pages publicado e inspeccionado en vivo (§XXI).
- **Pendientes**: push de los commits locales (desde `11b475b` hasta el docs de este cierre #117; lo hacés vos) · opcionales: deudas de forma —incluida la **nueva**: `<script>` anti-flash en columna 0 en `index.html`, preexistente de T4—, StrictMode/F1-F2 (filas propias de **Abiertos**). El motion y sus confirmaciones manuales (Ctrl+P, reduced-motion) quedaron **cerrados**.

## Reglas no negociables para cualquier tarea futura

- Fuente de verdad: `docs/constitution.md` > skill `sdd` > spec. **Nadie edita `spec.md`
  sin aprobación explícita del usuario** (`ask`, P2/#75/#94); un cambio de lo que espera un
  test **es** Cambio de spec. `src/test/**`, configs y `src/test/a11y.ts`: intocables.
- Motion (#116, **regla permanente desde 2026-11-13**): **ninguna `transition` que produzca
  animación en un selector de especificidad (0,2,0) o mayor**; `transition: none` está
  excluido (es la supresión). Rige SIEMPRE, no solo los Cambios 2–4.
- Flujo futuro: contenido → `integrator` (dueño de `src/content/**`, con
  `validate:content`); cambio en pieza existente → **Cambio** (spec→plan→tasks→código);
  pieza nueva → `/sdd-spec` + `/sdd-plan <cat>/<Name>` (puertas de pieza suelta);
  verificación visual → `reviewer` con app servida por el usuario (#91; el MCP de Chrome
  es solo del reviewer).
- Commits: unidad = 1 tarea; `test(<Name>): Tn` (subject a secas, #102: subject EN, cuerpo
  ES **sin tildes**; `feat`/`fix` no tocan tests; `test` solo agrega) → `feat(<Name>): Tn`;
  identidad `git -c user.name="jmiban" commit`; sin `--amend`/`--no-verify`/push; `git add`
  con rutas explícitas + `git diff --cached --name-only` antes (un subagente puede dejar
  staged ajeno). Docs los commitea el orchestrator; el código, sus builders.
- Cierre de cualquier tarea: lint + typecheck + test verdes (build al cerrar pieza/puerta,
  #80). Máx. 3 rondas fix↔verify y frenar con salida exacta.
- `allowExportNames` de `react-refresh` (#96/#100): `useTheme`/`useLocale`/`useCv`,
  `BRAND_NAMES`, `getTabId` — nombre nuevo = aprobación del usuario; nunca mover el hook
  o `eslint-disable`. `skipLibCheck: true` aceptado (jest-dom 7 vs Vitest 5).
- EARS (3–8 RF derivados solo de las secciones de la spec; RF sin test → reportar, no
  inventar test). Aserción de clases: canon #99 (`const c = styles.name ?? "name"`).
- Stack fijo: React+TS+Vite, CSS Modules, solo tokens semánticos, sin `any`/casts/
  `@ts-ignore`; mobile-first 580/768/992/1200; textos desde `useLocale()`/`useCv()`
  (páginas/AppLayout); fuera de alcance: lo de `docs/DESIGN.md` y `docs/BACKLOG.md`.
- Assets públicos: usar `assetUrl()`; `vite.config.ts` aplica base `/cv-agentic/` solo con
  `DEPLOY_TARGET=gh-pages` (local/Vercel en `/`).
- Verificar estado real antes de afirmar (`git status`/`git log` frescos; salidas pueden
  llegar rezagadas en sesiones largas).
