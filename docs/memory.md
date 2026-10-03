# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
La actualiza **solo el orchestrator** al cerrar cada puerta F o ante una decisión de reglas (#86; subagentes sin `edit`).

## Estado actual

- Kit completo y auditado: reglas, tokens, fundamentos, 27 specs, esquema de datos.
- **Modelo único de spec aprobado**: `specs/<categoria>/<Name>/spec.md` con `Estado: aprobada` y `Requisitos (EARS)` en las 27.
- **F1 en curso** (2026-10-03): spec/plan/tasks de `specs/foundation/Foundation/` aprobados; **T1–T5 aprobadas y marcadas** (+T2b, T3b, T5b de deuda/Cambio): andamiaje + configs, setup Vitest, helper axe (`src/test/a11y.ts`), `index.html` anti-flash con test verbatim, `ThemeProvider`+`useTheme`. Sigue **T6** (claves UI en/es + `format`), luego T7–T11. Puerta F1 al cerrar la pieza (`build` + revisión completa + aprobación del usuario).
- **Auditoría de arquitectura 2026-10-02**: 6 puntos corregidos (#75–#80); re-auditoría: 4 medios (#81–#82); tercera: 2 altos (#83–#84), 7 medios (#85–#91) y bajos (#92–#94): sin pendientes de auditoría.

## Decisiones (y por qué)

- **Modelo de spec**: una carpeta por pieza; `spec.md` es el contrato y lo escribe/ aprueba el usuario,
  `plan.md`/`tasks.md` los redacta el orchestrator en sus puertas (evita specs duplicadas con la skill `sdd`).
- **#75 P2 aclarado**: nadie edita `spec.md` sin aprobación explícita (orchestrator con `ask`).
- **#76 Commits de documentos**: el orchestrator commitea solo `README.md`, `docs/*`, `specs/*` en
  verde y con rutas explícitas (nunca `git add .`/`-A`); reviewer no commitea.
- **#87 Skills**: lista explícita en los 5 agentes (`sdd`; el reviewer además `browser-testing-with-devtools`);
  las globales (`spec-driven-development`, `git-workflow…`) quedan denegadas.
- **#79 `/constitution` eliminado** (referencias limpiadas). **#80 DoD**: `build` por pieza,
  `lint`/`typecheck`/`test` por tarea.
- **EARS**: 3–8 `RF-n`, derivados solo de `Propósito`, `Estados`, `Responsive`, `Accesibilidad` y
  `Tests esperados`; si un RF no tiene contrapartida en "Tests esperados" **no se agrega el test** (se reporta).
- **P1 actualizado** con aprobación explícita + decisión #68 (la constitución exige ambas).
- Commits con `git -c user.name="jmiban" commit -m` (permitido en bash por #83); no tocar git config; sin `--amend`.
- **#85 F5 sin Tn**: QA del reviewer, informe en `docs/qa-report.md`; defectos → tarea nueva o Cambio de su pieza.
- **#86** Estado/memoria/diagnostics solo por puerta F o decisión de reglas. **#91** `npm run dev` lo corre el usuario.
  **#95** El orchestrator edita el registro (`docs/README.md`) y la doc de agentes (`docs/agent-system.md`).
- **`skipLibCheck: true`** (F1/T2, aprobado por el usuario): jest-dom 7 y Vitest 5 declaran `Assertion` incompatibles
  en sus `.d.ts` (TS2428); el código propio sigue chequeando. Volver a `false` si jest-dom publica tipos compatibles.
- **#96 `react-refresh` + hooks de provider** (F1/T5b, aprobado por el usuario, 2026-10-03): la API spíada fija
  provider + hook en el mismo `.tsx`; `eslint.config.js` usa `allowExportNames: ["useTheme", "useLocale", "useCv"]`.
  Regla permanente para F2–F4: un hook spíado junto a su componente se agrega a `allowExportNames` (Cambio),
  nunca se mueve el hook a otro archivo ni se `eslint-disable`.
- **Criterio L1 unificado** (T4/T3b): los comentarios de código van en español **también en `src/test/**`**
  (títulos de tests, identificadores, rutas y citas entre backticks siguen en inglés). Deudas detectadas en review
  se tratan como tarea de reparo tipo T2b/T3b, no se dejan pasar.

## Aprendizajes y errores a evitar

- No pasadas globales de rename sobre `docs/diagnostics.md`: son referencias históricas (`components/...`).
- zsh no separa `$var` por espacios: usar `git ls-files -z '*.md' | xargs -0 perl -pi -e '...'`.
- Links entre specs de carpetas distintas necesitan `../../` (un `../` queda roto; verificar con un checker).
- Plantilla: "10 secciones (EARS incluida) + Estado" y `Requisitos` **justo después** de `Propósito` (no siempre antes de Anatomía).
- La memoria vive en `docs/memory.md`, no en la raíz (decisión #70). La doc de agentes es `docs/agent-system.md` (#92): un `agents.md` choca con `AGENTS.md` en macOS.
- El orchestrator **no puede `git push`** (no está en su allowlist de bash): los pushes los corre el usuario en su terminal.
- Salidas de herramientas **rezagadas o mezcladas** en sesiones largas: nunca citar un hash ni afirmar "commiteado"
  sin un `git log`/`git status` fresco inmediatamente después (pasó en F1: hashes phantom `e249d1f`/`c894023` citados
  al subagente que no existían).
- Un subagente puede dejar staged cambios ajenos: **siempre** `git diff --cached --name-only` antes de commitear
  y `git commit -- <ruta>` si el index está sucio (T5: el foundation commiteó su feat sin arrastrar el plan.md staged).

## Próximos pasos

- **F1: seguir T6** (claves UI en/es + `format`), T7–T11; puerta F1 al cerrar la pieza (`build` + revisión completa + aprobación del usuario).
- F1 (foundation): pieza `foundation/Foundation`, Tn con test → feat también en tooling; sin `chore: scaffold app`.
- **Unidad de trabajo por tarea** (decisión #69): `test(<Name>): Tn` → `feat(<Name>): Tn`; `feat`/`fix` no tocan
  tests y `test` solo agrega; el orchestrator escribe `plan.md`/`tasks.md` y marca cada Tn tras el OK del reviewer.
- Comandos `/sdd-*` (decisión #71): orchestrator o reviewer, argumento `<categoria>/<Name>`; MCP `chrome-devtools` solo para el reviewer.
- Permisos (#72, #73): edición por grupo con `"*": deny` (foundation → app; component-builder → `src/components/**`; integrator → F4); reviewer e integrator corren `validate:content`.
- Después de F1 nadie edita `src/test/**` ni configs: si un plan lo pide, decidir quién (consultar).
- Plan + Tareas **por fase F1–F4** (#74, #84); Clarificación: reviewer detecta, orchestrator resuelve, puerta
  solo con hallazgos (#90); `ask` en `spec.md` se mantiene (#94). Pendiente: QA visual (F5).
