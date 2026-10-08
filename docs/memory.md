# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
Solo la edita el orchestrator al cerrar puerta F o ante decisión de reglas (#86).
El detalle histórico vive en `docs/diagnostics.md` (§I–§XII) y `docs/README.md` (#1–#105).

## Estado actual (2026-10-08)

- **PROYECTO ENTREGADO — F1–F5 cerradas**: 27/27 specs `implementada`; suite **445/40**,
  lint/typecheck/build/validate:content ✅; QA F5 en 4 pasadas (navegador) + **Ctrl+P real
  aprobado** (veredicto en `docs/qa-report.md`; hitos §XI–§XII en diagnostics).
- Reglas del proceso que quedaron probadas y valen para el mantenimiento: cross-check 1:1
  RF↔Tests antes de la revisión completa; ajuste de asserts de tarea previa → solo con
  aprobación explícita y scope más angosto; verificación pura sin `feat` con on-arrival
  declarado por test (#101); `build` con grafo completo destapa bugs que lint/test no ven
  (frenar y escalar al dueño del archivo); `vi.hoisted`+`importOriginal` delegando en lo
  real para variantes de contenido; print por hooks `data-*` + `global.css` con compuestos
  `(0,1,1)` (#103 revisado por #104); la emulación print no valida paginación → papel real
  lo mira el usuario; pasadas de QA cortas y priorizadas (el reviewer agota presupuesto).
- **Pendientes del usuario (loop de mantenimiento)**: `git push` (57+ commits locales) ·
  contenido real en `src/content/cv.{en,es}.json` (→ re-observar 375px es/en el gap
  chevron↔nombre: 23px justos con "Alex Rivera"; `profile.downloadCvUrl` opcional ejercita
  `aside [download]`) · opcionales: pase de deudas de forma (`useHashTab.test.ts:143`,
  jerga "asiértan", F1/F2 — ver Abiertos de diagnostics).

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
  puede dejar staged ajeno). Docs los commitea el orchestrator, código no.
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
- Verificar estado real antes de afirmar (`git status`/`git log` frescos; salidas pueden
  llegar rezagadas en sesiones largas).
