# Memoria del proyecto — cv-agentic (`docs/memory.md`)

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
La actualiza **solo el orchestrator** al cerrar cada puerta F o ante una decisión de reglas (#86; subagentes sin `edit`).

## Estado actual

- Kit completo y auditado: reglas, tokens, fundamentos, 27 specs, esquema de datos.
- **Modelo único de spec aprobado**: `specs/<categoria>/<Name>/spec.md` con `Estado: aprobada` y `Requisitos (EARS)` en las 27.
- **F1 CERRADA** (2026-10-03): pieza `foundation/Foundation` `Estado: implementada`; T1–T11 + reparos T2b/T3b/T5b/T8b aprobadas (última: revisión completa **APROBADA** tras reparo T8b `ae59762`; **QA visual en navegador APROBADO** con app servida: anti-flash oscuro, RF-3 vivo, `theme-color`, es/en, Poppins autohosteada, 375/1440 sin overflow). App Vite/React/TS en la raíz con providers, i18n, contenido validado y tooling; `build` ✅, 53 tests.
- **Auditoría de arquitectura 2026-10-02**: 6 puntos corregidos (#75–#80); re-auditoría: 4 medios (#81–#82); tercera: 2 altos (#83–#84), 7 medios (#85–#91) y bajos (#92–#94): sin pendientes de auditoría.
- **F2 Primitivas CERRADA (2026-10-06)**: las 11 specs `Estado: implementada` (Icon, BrandIcon, Box, Button, Badge, Overhead, IconBox, SectionTitle, Separator, CornerTab, HexAvatar). Por pieza: revisión por tarea + completa APROBADA + `build` ✅. Suite final: 236 tests, 0 warnings. Decisiones aplicadas en F2: #99, #100, #101 (verdes on-arrival declarados; IconBox T3 con commit único `feat` cuando no hay nada discriminate-testable; `display: block` en HexAvatar T2 validado por el reviewer como necesidad mecánica fiel, no Cambio; geometría de "Forma" auditada con recálculo propio en HexAvatar T1). Cierre registrado en `docs/diagnostics.md` §IX (poda #98 aplicada a las entradas de decisión 2026-10-05). Nota cosmética abierta: `plan.md`/`tasks.md` de varias piezas citan P2/P3 de forma cruzada para el mismo contrato de unión; el usuario no pidió uniformar (2026-10-06).
- **F3 Compuestos EN CURSO (7/12, 2026-10-06)**: T12 + ThemeToggle/LS/ControlsBar/NavTabs/Sidebar/Timeline/**ResumeSection** `implementada`. 333 tests (Timeline/ResumeSection cero rechazos; cross-check 1:1 de "Tests esperados" ya es rutina previa a cada revisión completa; `formatPeriodEndpoint` de T12 en uso real). **Siguiente: SkillList T1** (2 tareas: lista + `@ts-expect-error` x2 / keys+unión+cierre), luego ServiceCard → TestimonialCard → TestimonialDialog → TestimonialCarousel. En cada encargo: #102 (builder imprime/verifica mensajes), #99/#101. Acumulados F5/F4: cursor (×2), pseudo-estados, sticky/print/≥xl, `role="list"` VoiceOver (Sidebar), geometría punto-título Timeline, edge márgenes `.additional`, F8 avatar. Deudas #102 históricas en Sidebar tasks.

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
- **#86** Estado/memoria/diagnostics solo por puerta F o decisión de reglas. **#98** Log `diagnostics.md`: formato fijo, tabla Abiertos, sin estado propio y poda a 150 líneas. **#99** P2 canónico: en tests, `const c = styles.name ?? "name"` + `toHaveClass(c)` (fallback solo de tipos; prohibidos `!` y `as string`; sin helper en `src/test/`). **#91** `npm run dev` lo corre el usuario.
  **#95** El orchestrator edita el registro (`docs/README.md`) y la doc de agentes (`docs/agent-system.md`).
  **#101** Tareas solo-inspección (RF verificados por inspección + cierre a11y sobre markup ya accesible): el `test(<Name>): Tn` **no está obligado a quedar rojo** si su alcance no discrimina el estado de la implementación; debe declarar por qué y qué se inspecciona; la verificación real es la inspección del reviewer (F2/Box T4; descartado rojo artificial leyendo el CSS como texto). Overhead T3: el `<dl>` de armazón con solo `<dt>` nacía rojo por axe `definition-list` (error del test, no de implementación); corregir el armazón con `<dd>` dentro del mismo `test` commit es legítimo.
- **`skipLibCheck: true`** (F1/T2, aprobado por el usuario): jest-dom 7 y Vitest 5 declaran `Assertion` incompatibles
  en sus `.d.ts` (TS2428); el código propio sigue chequeando. Volver a `false` si jest-dom publica tipos compatibles.
- **#96 `react-refresh` + hooks de provider** (F1/T5b, aprobado por el usuario, 2026-10-03): la API spíada fija
  provider + hook en el mismo `.tsx`; `eslint.config.js` usa `allowExportNames: ["useTheme", "useLocale", "useCv"]`.
  Regla permanente para F2–F4: un hook spíado junto a su componente se agrega a `allowExportNames` (Cambio),
  nunca se mueve el hook a otro archivo ni se `eslint-disable`. **Extendido #100 (F2/BrandIcon T3, 2026-10-05):**
  mismo mecanismo aplica a **constantes-objeto exportadas junto al componente cuando el plan las manda ahí**
  (`BRAND_NAMES` en `BrandIcon.tsx`; `allowExportNames` suma `"BRAND_NAMES"`, `6d107c6`). Frenar y consultar si un
  builder propone mover el dato a `.ts` o `eslint-disable`.
- **Criterio L1 unificado** (T4/T3b): los comentarios de código van en español **también en `src/test/**`**  (títulos de tests, identificadores, rutas y citas entre backticks siguen en inglés). Deudas detectadas en review
  se tratan como tarea de reparo tipo T2b/T3b, no se dejan pasar. Lo mismo **L2**: títulos de `describe`/`it` y
  mensajes de commit en inglés (deudas reparadas: T2b, `c42e33d`, T8b; deuda de forma `07eead6` registrada).
- **#97 `ucs2length` de ajv aceptado en el bundle** (F1, decisión del usuario al cerrar la puerta): "no ajv en
  runtime" prohíbe el **compilador**; el helper standalone (~1 kB) necesario por los `pattern` UCS-2 queda aceptado.
- **Deudas registradas al cerrar F1** (mayor detalle en `docs/diagnostics.md` §VIII): ① `StrictMode` omitido en
  `main.tsx` por ausencia de mandato (si alguien lo quiere, es Cambio); ② `value` de contexto sin `useMemo` en
  ambos providers (coherente con T5 aprobado); ③ typos "recalculera" en 2 comentarios de tests; ④ rastros de
  reparo `07eead6` (etiqueta `fix`+español debió ser `test`+inglés) y shim CJS/ESM de `build-validator.ts` (`59efc8d`).

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

- **F3 (kickoffs hechos)**: seguir el orden de `specs/README.md` con la senda de las piezas cerradas (revisión por tarea + completa con `build` + puerta de usuario). En cada encargo: **#102** (subject inglés, cuerpo español sin acentos — cierra las deudas L2 de ThemeToggle/LS, historia no se enmienda), #99/#101 (incluido commit único `test` sin `feat` o sin `test` cuando no hay nada discriminate-testable), criterio L1/L2, nota en `tasks.md` si un contrato del plan no tiene tarea asignada. Verificar en planes de consumidores: restricción de no-BFC junto a `.float` (NavTabs/AppLayout, se ve en F4) y usos de primitivas con restricciones (Badge RF-6, Overhead RF-4, IconBox RF-5, Separator RF-4 en Sidebar/SkillList). Deudas F2 aún abiertas en diagnostics: enmienda `_` de AGENTS.md, nota del proxy Vitest para #99, stderr `act(...)` de `ThemeProvider.test.tsx`.
- **Unidad de trabajo por tarea** (decisión #69): `test(<Name>): Tn` → `feat(<Name>): Tn`; `feat`/`fix` no tocan
  tests y `test` solo agrega; el orchestrator escribe `plan.md`/`tasks.md` y marca cada Tn tras el OK del reviewer.
- Comandos `/sdd-*` (decisión #71): orchestrator o reviewer, argumento `<categoria>/<Name>`; MCP `chrome-devtools` solo para el reviewer.
- Permisos (#72, #73): edición por grupo con `"*": deny` (foundation → app; component-builder → `src/components/**`; integrator → F4); reviewer e integrator corren `validate:content`.
- Después de F1 nadie edita `src/test/**` ni configs: si un plan lo pide, decidir quién (consultar).
- Plan + Tareas **por fase F1–F4** (#74, #84); Clarificación: reviewer detecta, orchestrator resuelve, puerta
  solo con hallazgos (#90); `ask` en `spec.md` se mantiene (#94). Pendiente: QA visual (F5).
