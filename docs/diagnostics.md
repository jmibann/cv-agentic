# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): una entrada por cada
cierre de puerta F y por cada decisión de reglas, con los hashes relevantes.
Última actualización: **2026-11-13** (sistema motion completo §XXVII; cambios 3 §XXVI y 2 §XXV; puerta etapa 1 §XXIII).
El proceso F1–F5 sigue cerrado (§XII); flujo y dueños en "Modo mantenimiento"
de `docs/agent-system.md`.

Lo vivo no vive aquí: estado → `README.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#116 → `docs/README.md` · QA de F5 →
`docs/qa-report.md` · motion → `specs/motion/proposal.md`.

Dueño: orchestrator (`edit` por ruta). Las puertas de pieza no tocan este
archivo. Tope: **150 líneas** (poda #98).

## Plantilla de entrada

```text
### §<n> · <AAAA-MM-DD> — <Puerta F o auditoría>
- Qué: <qué se hizo o aprobó>.
- Checks: lint · typecheck · test (n/n) · build (si aplica).
- Decisiones: #NN → `docs/README.md`.
- Commits: `<hash>` … (solo los relevantes).
- Abre: <nuevos>; cierra: <los que resuelve esta entrada> (actualizá la tabla **Abiertos**).
```

Entradas: **más reciente arriba**; el consolidado vive en la tabla **Abiertos**.

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
| Pendientes post-F5 (residuos) | **Deudas de forma**: comentario inglés `useHashTab.test.ts:143`, jerga "asiértan/asiértala" en tests (transversal), `lang="es"` sin restaurar en AppLayout.test (nota) — pase único solo si el usuario lo decide · opcionales kit: `cursor: pointer` no listado en controles/bullets, fila `contrast.md` regla 6 para ServiceCard | Decisión del usuario; sin fecha |
| Deudas menores de F1 | `StrictMode` sin mandato (si se quiere, es Cambio), `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md`. Reevaluadas al cerrar F2 (2026-10-06): **permanecen**, sin impacto en F2 | Sin fecha; decisión del usuario si se reparan |
| Deudas menores de F2 | (a) AGENTS.md "parámetros sin usar: prefijo `_`" es impreciso con el eslint real (`after-used`, sin `argsIgnorePattern`: el `_` no protege el último parámetro) → enmienda a decidir por el usuario; (b) nota #99: con el proxy CSS-Modules de Vitest la rama de fallback puede no ejercitarse nunca — la validez del patrón está en compartir el objeto `styles` entre test e implementación; (c) stderr preexistente `act(...)` en 2 tests de `ThemeProvider.test.tsx` (pasan) → decidir si repara | (a) y (c): decisión del usuario; (b): próxima revisión de la skill sdd |

## Entradas

### §XXVII · 2026-11-13 — Cierre del Cambio motion 4 y del sistema motion (4/4)
- Qué: último Cambio, TestimonialDialog: fila "Entrada" de la spec `--ease-standard`→`--ease-enter` (la historia quedó solo en el anexo del plan, ajuste de redacción del usuario) y plan/tareas aprobados (`febce50`/`e72b964`). T4 (`1d2aba8`, feat único, verde-only #101 bien declarado: sin discriminator jsdom sobre la curva; hunk único; close hover conserva standard — ítem 10 de la matriz) APROBADA. T5: QA en vivo — entrada 200 ms con `cubic-bezier(0.22,1,0.36,1)` y frame inicial `scale(0.96)` vía `@starting-style` (sin overshoot), **cierre instantáneo en los 3 caminos** (Close/Esc/backdrop real; 0 `transitionrun`, `getAnimations()=[]`; 6 runs = 2×3 aperturas, 0 cancels), backdrop/scroll/bloqueo de fondo sin regresión, print `display:none` presente, reapertura reinicia; pieza 15/15 con cierre axe. Usuario: **Ctrl+P con el dialog abierto OK** y aplicó los **dos textos permanentes de #116** (`11b475b`: viñeta en `foundations/motion.md` + regla corta en `AGENTS.md` → Convenciones). TestimonialDialog → `implementada` (**28/28**); **propuesta reescrita a 4/4** (cabecera con las cuatro puertas §XXIV–§XXVII + #116 permanente; nota de las citas +1 línea). Sistema motion **COMPLETO**.
- Checks: lint ✓ · typecheck ✓ · test **466/41** ✓ · build ✓ (prebuild + validate:content incluidos).
- Decisiones: ninguna nueva; #116 elevada a **regla permanente** (decisión del usuario, registro en su fila de `docs/README.md`).
- Commits: `febce50` `e72b964` `1d2aba8` `80a5301` `11b475b` (usuario) + `a8e1ff9` (specs) y el docs de este cierre.
- Abre: nada. Cierra: la **fila Motion de Abiertos** (el sistema queda completo; los opcionales de forma viven en sus filas).

### §XXVI · 2026-11-13 — Cierre del Cambio motion 3 (Sidebar, expansión de contactos)
- Qué: Cambio completo sobre Sidebar: spec reabierta y aprobada en 3 rondas (`4313f3d`, con la **enmienda de #116** escrita en su fila de `docs/README.md`: la regla refiere a `transition` que puedan *producir animación*; `transition: none` excluido) + plan/tareas (`8a89a5f`; ajustes del usuario: T12 feat-only, `data-contacts-animate` refleja `expanded` sin estado extra, reescritura C9 del Selector a descendiente —una línea, 4 usos intactos—, test 13 por clase y no `toBeVisible()`). Ejecución: T9+T9b (`c5617e0`/`2db9975`, reubicación del cierre axe ordenada por el reviewer), T10 (`5162e2e` wrapper + atributo), T11 (`4e80fb3` grid 0fr/1fr + stagger gated `backwards` + P5' con clase simple ≥1200), T12 (`efbe0e1` print en `global.css`: se quema el `display: block` heredado de #103 — el grid base del módulo lo hace inerte — y resets (1,0,0)); todas APROBADAS por tarea + revisión completa. QA en vivo: expansión 310 ms + stagger ~290 ms (mid-flight verificó `backwards`), repliegue 224 ms con `visibility` diferido, cargas 900/1400 sin animación, cruce de media sin animar, reinicio al reexpandir, clics rápidos, colapsado fuera de foco/árbol medido. **Ctrl+P con el bloque colapsado aprobado por el usuario.** Sidebar → `implementada` (28/28). Pendientes del usuario: commitear el C3 de `foundations/motion.md` (redactado y entregado) y confirmar reduced-motion con flag real (por inspección P6' cerrada).
- Checks: lint ✓ · typecheck ✓ · test **466/41** ✓ · build ✓ (prebuild + validate:content incluidos).
- Decisiones: ninguna nueva (enmienda registrada en la fila #116).
- Commits: `4313f3d` `8a89a5f` `c5617e0` `2db9975` `5162e2e` `4e80fb3` `efbe0e1` + las marcas de tareas.
- Abre: los 2 pendientes del usuario (fila Motion de **Abiertos**). Cierra: el Cambio motion 3; queda solo el 4 (TestimonialDialog).

### 2026-11-13 · §XXV — Cierre del Cambio motion 2 (AppLayout, entrada de panel) · — · `git show de5f32a:docs/diagnostics.md`

### 2026-11-13 · §XXIV — Cierre del Cambio motion etapa 1 (Foundation T18) · #116 · `git show fd3d1d1:docs/diagnostics.md`

### 2026-11-13 · §XXIII — Puerta motion etapa 1 + saneado de documentación · #116 · `git show aca2b59:docs/diagnostics.md`

### 2026-11-12 · §XXII — Saneado de documentación (hallazgo de auditoría cerrado) · — · `git show a783d69:docs/diagnostics.md`

### 2026-11-12 · §XXI — Favicon tipo app y título real · #115 · `git show de87d04:docs/diagnostics.md`

### 2026-11-12 · §XX — ResumePage en una sola columna, Experience primero · #114 · `git show 31d7ee9:docs/diagnostics.md`

### 2026-11-12 · §XIX — TestimonialCard: avatar anclado arriba · #113 · `git show c240dd8:docs/diagnostics.md`

### 2026-11-12 · §XVIII — Testimonios reales + Cambio de TestimonialCard · #112 · `git show 36be49c:docs/diagnostics.md`

### 2026-11-12 · §XVII — CI: Node 26 LTS y quality gates en el deploy · #110–#111 · `git show a9849b7:docs/diagnostics.md`

### 2026-11-11 · §XVI — QA visual post-contenido (pasada enfocada) · — · `git show bbb70b9:docs/diagnostics.md`

### 2026-11-11 · §XV — Contenido real, tests y CTA de descarga · #107–#109 · `git show 0c5c54b:docs/diagnostics.md`

### 2026-11-11 · §XIV — Deploy GitHub Pages + propuesta de motion · #106–#108 · `git show 3496bb7:docs/diagnostics.md`

### 2026-11-06 · §XIII — Bug-fix ControlsBar T4 (alineación) · — · `git show 47cd6da:docs/diagnostics.md`

### 2026-10-08 · §XII — Cierre de F5 (fin del proceso F1–F5) · #104–#105 · `git show 31d8f27:docs/diagnostics.md`

### 2026-10-08 · §XI — Cierre de F4 · #103 · `git show 133b1e8:docs/diagnostics.md`

### 2026-10-07 · Cierre de F3 · #99–#102 · `git show 7f52303:docs/diagnostics.md`

### 2026-10-06 · Decisión #102 — L2: subject inglés, cuerpo español sin acentos · #102 · `git show 3da32b9:docs/diagnostics.md`

### 2026-10-06 · Cierre de F2 · #99–#101 · `git show 2c086fb:docs/diagnostics.md`

### 2026-10-05 · Decisión #101 — tareas solo-inspección: rojo no exigible · #101 · `git show 81ef2ff:docs/diagnostics.md`

### 2026-10-05 · Decisión #100 — `allowExportNames` extendido a `BRAND_NAMES` · #100 · `git show d5f5bff:docs/diagnostics.md`

### 2026-10-05 · Decisión #99 — patrón canónico de aserción P2 · #99 · `git show e28fe86:docs/diagnostics.md`

### 2026-10-05 — Regla de mantenimiento del log · #98 · `git show 4730d8d:docs/diagnostics.md`

### 2026-10-03 · §VIII — Cierre de F1 · — · `git show 1865d86:docs/diagnostics.md`

### 2026-10-03 · §VII — F1 hasta T5 · #96 · `git show dd7b35b:docs/diagnostics.md`

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
