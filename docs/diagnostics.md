# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): una entrada por cada
cierre de puerta F y por cada decisión de reglas, con los hashes relevantes.
Última actualización: **2026-11-15** (cierre de #121, código en inglés §XXXV; reglas §XXXIV; auditoría general y saneado §XXXIII; README en inglés y `docs/STATUS.md` §XXXII, #120; Cambio #119, avatar en WebP §XXXI; saneado de docs §XXX; Cambio #118, colección `projects` §XXIX; Cambio #117, metadatos SEO §XXVIII; sistema motion completo §XXVII; cambios 3 §XXVI y 2 §XXV; puerta etapa 1 §XXIII).
El proceso F1–F5 sigue cerrado (§XII); flujo y dueños en "Modo mantenimiento"
de `docs/agent-system.md`.

Lo vivo no vive aquí: estado → `docs/STATUS.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#121 → `docs/README.md` · QA de F5 →
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
en `docs/STATUS.md` ("Estado actual") y en `docs/memory.md`. Si supera las **150
líneas**, el orchestrator reduce, **en esa misma puerta F**, a **una línea**
cada entrada anterior a las de las dos últimas puertas F:
`fecha · título · #n · git show <hash>:docs/diagnostics.md` (hash de creación
de la entrada); el detalle queda en git.

## Abiertos

| Ítem | Qué falta | Se cierra en |
|---|---|---|
| Pendientes post-F5 (residuos) | **Deudas de forma**: `lang="es"` sin restaurar en AppLayout.test (nota), `<script>` anti-flash en columna 0 en `index.html` (preexistente de T4, menor de §XXVIII), títulos de test con referencias internas (`T1: RF-1`) y fragmentos en español (§XXXV; cambiarlos toca ~625 títulos, ninguna aserción) — pase único solo si el usuario lo decide (las deudas de comentarios en tests se cerraron con #121) · opcionales kit: `cursor: pointer` no listado en controles/bullets, fila `contrast.md` regla 6 para ServiceCard | Decisión del usuario; sin fecha |
| Del usuario (§XXXIII, §XXXV) | **README raíz**: dice "482 tests in 41 files" y "#1–#120" (hoy 485/42 y #121; solo cambia a pedido del usuario, #120). **PDF descargable** `public/cv/…pdf`: dice "445 tests" (hoy 485) e incluye el teléfono, que el sitio no muestra por decisión; **"About" del repo en GitHub**: descripción vieja y sin enlace al sitio; **PageSpeed**: volver a medir tras #119. **Dependencias**: 7 avisos moderados de desarrollo por `minimatch` vía `typescript-eslint` (esperar versión corregida; no forzar) | Usuario; `minimatch`: próxima actualización de dependencias |
| Deudas menores de F1 | `StrictMode` sin mandato (si se quiere, es Cambio), `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md`. Reevaluadas al cerrar F2 (2026-10-06): **permanecen**, sin impacto en F2 | Sin fecha; decisión del usuario si se reparan |
| Deudas menores de F2 | (a) AGENTS.md "parámetros sin usar: prefijo `_`" es impreciso con el eslint real (`after-used`, sin `argsIgnorePattern`: el `_` no protege el último parámetro) → enmienda a decidir por el usuario; (b) nota #99: con el proxy CSS-Modules de Vitest la rama de fallback puede no ejercitarse nunca — la validez del patrón está en compartir el objeto `styles` entre test e implementación; (c) stderr preexistente `act(...)` en 2 tests de `ThemeProvider.test.tsx` (pasan) → decidir si repara | (a) y (c): decisión del usuario; (b): próxima revisión de la skill sdd |

## Entradas

### §XXXV · 2026-11-15 — Cierre de #121: código 100 % en inglés, comentarios "why-only"
- Qué: limpieza completa de comentarios en `src/` (139 archivos, tests incluidos) y fuera de `src/` (`tokens.css`, `data/constants.ts`, descripciones del esquema + generados, banners, `index.html`, configs, `.gitignore`, nombre del workflow); mensajes de error e invariantes de test en inglés; test guardián `src/test/comments.test.ts` (Foundation T22). % de comentario: `.ts`/`.tsx` 54 → 12, CSS 66 → 15, tests 44 → 3. Hecho por Claude Code a pedido del usuario, con piloto revisado.
- Checks: por commit, salida transpilada sin comentarios idéntica byte a byte; bundle de producción idéntico (hashes de clase normalizados) tras la etapa de solo comentarios; lista de nombres de test sin cambios; lint · typecheck · test (**485/42**) · build · validate:content; pasada en navegador sobre el build local (tabs, tema, idioma, diálogo) sin errores de consola.
- Decisiones: #121 → `docs/README.md`. El comentario del script anti-flash se cambió también en `foundations/theming.md` (un test los compara literal) y el encabezado de generados pasa a "GENERATED" (línea de la spec de Foundation y prompt de `foundation` alineados).
- Commits: `6405b72` (reglas) · `98c6bfb`…`fc269d9` (un `chore(<Name>)` por pieza) · `138f75b` `2cb90c9` (mensajes) · `ec45ee4` (fuera de `src/`) · `870aa69` (T22).
- Abre: títulos de test con referencias internas y algo de español (no se tocaron); cifras del README raíz desactualizadas; cierra: deudas de forma de comentarios en tests.

### 2026-11-15 · §XXXIV — Decisión #121: comentarios "why-only" en inglés (reglas) · #121 · `git show 6405b72:docs/diagnostics.md`

### 2026-11-15 · §XXXIII — Auditoría general y saneado (deps en rango, docs al día) · — · `git show f450e4e:docs/diagnostics.md`

### 2026-11-15 · §XXXII — README público en inglés y tablero de estado a `docs/STATUS.md` · #120 · `git show f836812:docs/diagnostics.md`

### 2026-11-15 · §XXXI — Cambio #119: avatar del sitio en WebP · #119 · `git show 6f06934:docs/diagnostics.md`

### 2026-11-14 · §XXX — Saneado de documentación tras #117 y #118 (auditoría) · — · `git show e0b6104:docs/diagnostics.md`

### 2026-11-14 · §XXIX — Cambio #118: colección `projects` y sección Projects en Resume · #118 · `git show b22655a:docs/diagnostics.md`

### 2026-11-14 · §XXVIII — Cierre del Cambio #117 (Foundation: metadatos SEO y para compartir) · #117 · `git show 3d22bf8:docs/diagnostics.md`

### 2026-11-13 · §XXVII — Cierre del Cambio motion 4 y del sistema motion (4/4) · #116 · `git show 0bab158:docs/diagnostics.md`

### 2026-11-13 · §XXVI — Cierre del Cambio motion 3 (Sidebar, expansión de contactos) · — · `git show 5ac25ff:docs/diagnostics.md`

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
