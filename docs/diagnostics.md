# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): el orchestrator agrega
**una entrada** por cada cierre de puerta F y por cada decisión de reglas, con
los hashes de los commits relevantes. Última actualización: **2026-10-05**
(saneado del archivo + regla de mantenimiento).

Lo vivo no vive aquí: estado → `README.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#98 → `docs/README.md` · QA de F5 →
`docs/qa-report.md`.

Dueño: orchestrator (`edit` por ruta). Las puertas de pieza no tocan este
archivo.

## Plantilla de entrada

```text
### §<n> · <AAAA-MM-DD> — <Puerta F o auditoría>
- Qué: <qué se hizo o aprobó>.
- Checks: lint · typecheck · test (n/n) · build (si aplica).
- Decisiones: #NN → `docs/README.md`.
- Commits: `<hash>` … (solo los relevantes).
- Abre: <nuevos>; cierra: <los que resuelve esta entrada> (actualizá la tabla **Abiertos**).
```

Las entradas van **más reciente arriba**. El consolidado vive en la tabla
**Abiertos**.

## Mantenimiento (decisión #98)

Cada **puerta F** o **decisión de reglas** agrega una entrada con el formato
fijo de la "Plantilla de entrada" y actualiza la tabla **Abiertos** (lo cerrado
**sale** de la tabla). Este archivo no lleva secciones de estado: el estado vive
en `README.md` ("Estado actual") y en `docs/memory.md`. Si supera las **150
líneas**, el orchestrator reduce, **en esa misma puerta F**, a **una línea**
cada entrada anterior a las de las dos últimas puertas F:
`fecha · título · #n · git show <hash>:docs/diagnostics.md` (hash de creación
de la entrada); el detalle queda en git.

## Abiertos

| Ítem | Qué falta | Se cierra en |
|---|---|---|
| F8 | `--size-avatar-sidebar: 9rem` (≥ 768) es **provisional** en `tokens/tokens.css`; el valor final se fija con la captura de referencia | QA visual de F5 |
| F5 | QA visual completa (4 viewports × 2 temas × 2 idiomas); informe en `docs/qa-report.md` (#85) | F5 |
| Deudas menores de F1 | `StrictMode` sin mandato, `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md` | Sin fecha (se reevalúan en F2) |

## Entradas

### 2026-10-05 — Regla de mantenimiento del log (#98)

- Qué: regla propia del archivo: entrada por puerta F o decisión de reglas con
  el formato fijo, tabla **Abiertos** como único consolidado, sin secciones de
  estado y poda a una línea por entrada pasadas las 150 líneas.
- Decisiones: **#98** (texto replicado en la skill, `orchestrator.md`,
  `AGENTS.md`, `docs/agent-system.md` y `docs/memory.md`).
- Commits: el de este cambio (`docs(sdd): add diagnostics maintenance rule (#98)`).
- Abre: no cierra ningún ítem de la tabla.

### §VIII · 2026-10-03 — Cierre de F1

- **F1 (pieza `foundation/Foundation`) cerrada**: T6–T11 aprobadas por tarea;
  la revisión completa salió **RECHAZADA** por un `describe` en español (L2) →
  reparo **T8b** → **APROBADO**. QA visual en navegador **APROBADO** (app
  servida por el usuario: anti-flash oscuro, RF-3 en vivo, `theme-color`,
  es/en, Poppins autohosteada, 375/1440 sin overflow).
- Checks de cierre: lint ✓ · typecheck ✓ · test 53/53 ✓ · validate:content ✓ ·
  build ✓ (sin diff post-build).
- Decisiones: **#97** (`ucs2length` de ajv aceptado en el bundle).
- Commits: feats T6–T11 `15a9592` `884bb2f` `14aec22` `59efc8d` `faae4c2`
  `79b7133`; reparo T8b `ae59762`; spec `implementada` `e4bcb9d`; cierre
  `1865d86`.
- Pendientes: deudas menores de F1 (arriba); F8 y F5 siguen abiertos.

### §VII · 2026-10-03 — F1 hasta T5

- T1–T5 (+ reparos T2b, T3b, T5b) aprobadas. Deuda L1 detectada en T4
  (comentarios en inglés en `src/test/`) → **T3b** la reparó; criterio
  unificado en `docs/memory.md` (español también en `src/test/**`; títulos de
  tests e identificadores en inglés).
- Bloqueante en T5 → Cambio aprobado: `react-refresh/only-export-components`
  vs. la API spíada (provider + hook en el mismo `.tsx`).
- Decisiones: **#96** (`allowExportNames: ["useTheme", "useLocale", "useCv"]`
  en `eslint.config.js`; descartado mover los hooks a `.ts`).
- Commits: `c259db2` (T4→L1) `17b0409` (T3b) `48bd323` (T5b) `bcb4605`
  (feat T5) `4adab35` (registro).
- Pendientes: cierra la deuda L1 de T4/T3.

### §VI · 2026-10-02 — Post-auditoría: hallazgos 1–3 y decisión #95

- Hallazgos no bloqueantes de la auditoría de arquitectura aplicados:
  `docs/agent-system.md` (bash del integrator sin `dev`), árbol de
  `README.md` (`agent-system.md` post-#92) y justificación de `engines` vs.
  jsdom en `docs/README.md` (el rango **no cambia**).
- Hallazgo nuevo: el `edit` del orchestrator no cubría `docs/README.md` ni
  `docs/agent-system.md` → rutas agregadas a su permiso.
- Decisiones: **#95**.
- Commits: `98ef9b4` (hallazgos 1–3) `c8ff8a7` (#95).

### 2026-10-02 — Auditorías del sistema agéntico (secciones R–V)

- Tres pasadas read-only sobre agentes, skills, comandos y documentación del
  flujo SDD: 6 puntos + re-auditoría (4 medios) + tercera (2 altos, 7 medios,
  bajos). Verificado: permisos con `opencode debug agent`/`debug config`,
  0 links rotos, 27 specs con `Estado: aprobada` + EARS y decisiones
  correlativas en el registro (#1–#74 al auditar).
- Decisiones: **#75–#80** (P2, commits de documentos, skills TDD en prompts,
  clave `skill`, `/constitution` fuera, DoD `build` por pieza), **#81–#82**
  (T5 por tarea, F4 = 4 piezas, `git config`), **#83–#84** (identidad de git
  en permisos; F1 como pieza con Tn), **#85–#91** (F5 sin Tn, cadencia #86,
  skills por lista, `git add` acotado, `## No hacer`, Clarificación #90, MCP
  y `npm run dev`), **#92–#94** (`agent-system.md`, `--no-verify` denegado,
  `ask` en `spec.md`).
- Commits: `5ab6a42` `1503bb1` `70d863c` `3480951` `8502c27` `c37cc4b`.
- Pendientes: cierra toda la deuda de auditoría ("sin pendientes de
  auditoría"); quedan F8/F5.

### 2026-10-02 — Decisiones de proceso #67–#74 (secciones K–Q)

- **K** constitución `docs/constitution.md` (S/P/C/T/D/L, por encima de todo)
  · **L** modelo único de spec `specs/<cat>/<Name>/{spec,plan,tasks}.md` con
  `Estado` + EARS en las 27 · **M** unidad de trabajo por tarea (Tn) y memoria
  única en `docs/memory.md` · **N** comandos `/sdd-*` con agentes del
  proyecto · **O** kit protegido por permisos y `validate:content` · **P**
  edición por grupo en los subagentes · **Q** puerta de Plan + Tareas por
  fase (~113 → ~63 puertas).
- Decisiones: **#67–#74**.
- Commits: `475534a` (baseline, con la constitución) `3820e93` `8f81d9d`
  `d5fab8d` `24cdad7` `953d620` `5d4b709` `e9d9218` `4931617`.

## Índice histórico — auditoría inicial (2026-09-29 → 2026-10-01)

Detalle textual en git: `git show 1865d86:docs/diagnostics.md` (evolución en
`475534a..1865d86`). Rutas de la época: `components/` = `specs/`,
`agents/agent/` = `.opencode/agents/`, `packages/cv-design-kit/` = raíz.

| Sección | Qué | Resultado |
|---|---|---|
| A | 6 contradicciones graves entre specs y docs (headroom de TestimonialCard, fórmula del h1 bajo la CornerTab, tabpanel "es un Box", `headingLevel` de Timeline, gradiente vs. sólido, 3 specs faltantes en la tabla de fases) | ✅ A1–A6 decididas y aplicadas (2026-09-30) |
| B | 9 puntos débiles: contraste de redes y tabs, foco, medidas responsive literales, landmarks, `theme-color`, dependencias, CSS global, 12 ambigüedades (B8), secciones de plantilla (B9) | ✅ B1–B9 aplicadas (2026-09-30); los 4 desvíos finales quedaron en las specs aprobadas |
| C | 9 notas de hygiene: tokens sin uso, `YearMonth` estricto, `Badge`, opacidades sin fila de contraste, entre otras | ✅ C1–C9 aplicadas (2026-09-30) |
| D | Verificación programática: 0 tokens colgantes, paridad en/es de los ejemplos, claves de labels, contrastes, breakpoints, tipografía | ✅ OK; no revisar de nuevo |
| F | 13 pendientes externos: regex de lint, serialización de builders, commits y permisos de agentes, formato de OpenCode, axe-core en vez de `vitest-axe`, ESLint 10, esquema/`alt`, MCP | ✅ F1–F13 aplicados o resueltos (2026-09-30); F8 provisional → F5 |
| Verificación y plan de kickoff | Segunda pasada sobre A/B/C/F cerradas: 27 specs, 0 tokens colgantes, veredicto "F1 desbloqueado" y etapas 0–3 (etapa 2 corregida en #77) | ✅ Cumplido: F1 cerrada el 2026-10-03; sección eliminada en el saneado |
| Contexto (causas raíz, estado del repo, cómo usar este archivo) | Diagnóstico de partida del kit | ✅ Obsoleto tras F1; eliminado en el saneado |
| Registro de documentación | Dos pases para que ningún documento del kit contradiga a las specs | ✅ 2026-09-30 |
| G | Contenido del CV en JSON: esquema draft-07, tipos y validador generados, `src/content/cv.{en,es}.json` | ✅ Aplicado (2026-10-01), decisión **#44** |
| H | Reestructura a proyecto único: raíz, `specs/`, `.opencode/agents/`, alias `@data` | ✅ Aplicado (2026-10-01), decisiones **#39–#42** |
| I | Documentación movida a `docs/` (README completo, DESIGN, BACKLOG, tokens) | ✅ Aplicado (2026-10-01), decisión **#43** |
| J | Auditoría de arquitectura React: 24 hallazgos (6 críticos, 6 altos, 12 medios) + observación posterior del sticky | ✅ Corregidos (2026-10-01), decisiones **#45–#66** |
