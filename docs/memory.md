# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
Solo la edita el orchestrator al cerrar puerta F o ante decisión de reglas (#86).
El detalle histórico vive en `docs/diagnostics.md` (§I–§XV) y `docs/README.md` (#1–#108).

## Estado actual (2026-11-11)

- **PROYECTO ENTREGADO — F1–F5 cerradas**: 27/27 specs `implementada`; suite **447/40**,
  lint/typecheck/build/validate:content ✅; QA F5 en 4 pasadas + **Ctrl+P real aprobado**
  (`docs/qa-report.md`; §XI–§XIII). Mantenimiento 2026-11-11: base Vite + `assetUrl()`
  (`c2d4232`/`5f6c0a6`) y **CV real** (`63f6665`; §XV).
- **CV real cargado y validado**: `src/content/cv.{en,es}.json` con `testimonials: []`,
  contact sin teléfono/WhatsApp y PDF en `public/cv/`; avatar actualizado y `avatar.svg`
  retirado. Tests adaptados sin debilitar (fixtures + valores derivados); commits
  `3855eb0` `befb0db` `63f6665`.
- **Motion aprobado, NO implementado** (`specs/motion/proposal.md`): tokens `base 0.2`,
  `slow 0.3`, `exit 0.22`, `stagger 0.03` + `ease-enter/exit`; tabs B (fade+translateX,
  `key` remonta y resetea carrusel/dialog); Sidebar grid `0fr→1fr`; `data-theme-switching`;
  reduced motion instantáneo; dialog `--ease-enter`; Separator vía `within()`. Falta
  aprobar specs/planes/tareas.
- **Pendientes del usuario**: push; QA visual 375px con el nombre real (gap chevron↔nombre);
  decidir traducción de `headline`/cargos en `cv.es.json`; aprobar specs motion;
  opcionales deudas de forma, StrictMode/F1-F2.

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
  identidad `git -c user.name="jmiban" commit`; sin `--amend`/`--no-verify`/push;
  `git add` con rutas explícitas y `git diff --cached --name-only` antes (un subagente
  puede dejar staged ajeno). Docs los commitea el orchestrator; el código, sus builders.
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
