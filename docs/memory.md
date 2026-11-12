# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
Solo la edita el orchestrator al cerrar puerta F o ante decisión de reglas (#86).
El detalle histórico vive en `docs/diagnostics.md` (§I–§XXI) y `docs/README.md` (#1–#115).

## Estado actual (2026-11-12)

- **ENTREGADO — F1–F5 cerradas**: 28/28 `implementada` (27 de componentes + Foundation); QA F5 + Ctrl+P real ✅; suite **449/40**. Resume en una sola columna, Experience primero (#114, §XX); favicon tipo app JM + título real (#115, §XXI).
- **Mantenimiento 2026-11-11 cerrado (§XIV–§XVI)**: base Vite + `assetUrl()`
  (`c2d4232`/`5f6c0a6`); **CV real** + assets (`63f6665`) sin teléfono/WhatsApp; **3 testimonios reales**
  (#112, textos literales; TestimonialCard T5/T6: comilla reservada y avatar anclado arriba, #113); tests adaptados sin debilitar (`3855eb0`/`befb0db`); spec de
  Foundation alineada (**#109**; `headline`/cargos en inglés por decisión editorial
  — no re-reportarla). **QA visual APROBADA (§XVI)**: gap chevron↔nombre a 375px con el
  nombre real = **72.84px**, sin solapes ni overflow (informe: `qa-report.md`).
- **Motion aprobado, NO implementado**: contrato en `specs/motion/proposal.md` (#106); falta aprobar specs/planes/tareas.
- **CI (§XVII)**: Node **26 LTS** (`.nvmrc`, que lee el deploy, #110); el deploy corre
  `lint` → `test` → `build` y no publica si algo falla (#111). Commits `cf28268`/`35dbf2d`.
- **Pendientes del usuario**: push + verificar Actions y GitHub Pages (base `/cv-agentic/`);
  aprobar specs motion. (Hallazgo "registrar `motion`" cerrado 2026-11-12: `specs/README.md` `a783d69` + `AGENTS.md` `c04f13d`.)

## Reglas no negociables para cualquier tarea futura

- Fuente de verdad: `docs/constitution.md` > skill `sdd` > spec. **Nadie edita `spec.md`
  sin aprobación explícita del usuario** (`ask`, P2/#75/#94); un cambio de lo que espera un
  test **es** Cambio de spec. `src/test/**`, configs y `src/test/a11y.ts`: intocables.
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
