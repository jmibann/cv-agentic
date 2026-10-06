# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): el orchestrator agrega
**una entrada** por cada cierre de puerta F y por cada decisión de reglas, con
los hashes de los commits relevantes. Última actualización: **2026-10-05**
(saneado del archivo + regla de mantenimiento + entrada #100 con poda #98).

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

### 2026-10-05 · Decisión #101 — tareas solo-inspección: rojo no exigible (en curso F2; no es puerta F)

- Qué: al cerrar Box, el reviewer detecta que T4 (RF-4/5/6 por inspección + cierre
  a11y sobre markup ya accesible; jsdom no carga CSS) no podía tener un `test(T4)`
  en rojo sin inventar alcance. El usuario aprueba la regla: en tareas cuyo alcance
  de test no discrimina el estado de la implementación, el rojo **no es exigible**;
  el `test` declara el porqué y la verificación real es la inspección del reviewer.
  P4 intacto para tareas con comportamiento observable nuevo (Icon T5 sí fue rojo).
- Checks: n/a (decisión de proceso; repo verde al registrar: lint ✓ · typecheck ✓ · test 154/154 ✓ · build ✓ al cerrar Box).
- Decisiones: **#101** → registro + `docs/memory.md`; se transmite en los encargos F2–F4 de tareas 100 % inspección.
- Commits: Box T4 `a8c515d` (precedente), spec `implementada` `aaab301`.
- Abre: nada; cierra: la duda de proceso planteada por el review de Box T4.

### 2026-10-05 · Decisión #100 — `allowExportNames` extendido a `BRAND_NAMES` (en curso F2; no es puerta F)

- Qué: BrandIcon T3 frena en lint: `react-refresh/only-export-components` marca el objeto
  `BRAND_NAMES` exportado junto al componente (la tabla del plan y B-3 lo mandatan en el `.tsx`;
  `allowConstantExport` solo exceptúa literales/plantillas/binarios). El usuario aprueba la
  extensión A del mecanismo #96: `"BRAND_NAMES"` en `allowExportNames`. Lo aplica `foundation`
  (dueño de configs, post-F1) y el builder cierra el `feat`. T3 luego **APROBADA** por el reviewer.
- Checks: lint ✓ · typecheck ✓ · test ✓ (139/139; BrandIcon 43).
- Decisiones: **#100** → registro + `docs/memory.md` (extensión de #96; nombre nuevo = aprobación del usuario).
- Commits: `1e41bb6` (test T3) · `6d107c6` (chore eslint) · `8de4610` (feat T3) · docs `c3d97ce`.
- Abre: nada; cierra: el freno de lint de T3. Además: el archivo pasaba de 150 líneas → se aplica la
  poda de #98 (entraciones §VI, R–V y K–Q reducidas a una línea; detalle en git, hash `dd7b35b`).

### 2026-10-05 · Decisión #99 — patrón canónico de aserción P2 (en curso F2; no es puerta F)

- Qué: Icon T3/T4 detecta fricción entre el criterio P2 y `noUncheckedIndexedAccess`
  (`styles.x` es `string | undefined`); el reviewer la dictamina no debilitante y el
  usuario fija el patrón canónico: `const c = styles.name ?? "name"` + `toHaveClass(c)`.
- Descartado: helper en `src/test/` (sin dueño de escritura desde F1) y criterio libre por builder.
- Decisiones: **#99** → registro + `docs/memory.md`; se transmite en cada encargo F2–F4.
- Abre: nada; cierra: la duda metodológica de Icon T3/T4. Además, el usuario agregó
  `--button-small-padding-*` a `tokens/tokens.css` (T-2=A de la Clarificación F2), aún **sin commitear**.

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

### 2026-10-02 · Post-auditoría hallazgos 1–3 y decisión #95 · #95 · `git show dd7b35b:docs/diagnostics.md` (§VI)

### 2026-10-02 · Auditorías del sistema agéntico (secciones R–V) · #75–#94 · `git show dd7b35b:docs/diagnostics.md`

### 2026-10-02 · Decisiones de proceso #67–#74 (secciones K–Q) · #67–#74 · `git show dd7b35b:docs/diagnostics.md`

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
