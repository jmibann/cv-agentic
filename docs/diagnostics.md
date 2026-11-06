# Diagnóstico — registro de puertas y auditorías

Log mínimo del proyecto (decisiones **#86** y **#98**): el orchestrator agrega
**una entrada** por cada cierre de puerta F y por cada decisión de reglas, con
los hashes de los commits relevantes. Última actualización: **2026-11-06**
(mantenimiento: bug-fix de alineación en ControlsBar T4; el proceso F1–F5 sigue
cerrado — ver §XII; flujo y dueños en "Modo mantenimiento" de `docs/agent-system.md`).

Lo vivo no vive aquí: estado → `README.md` ("Estado actual") · memoria →
`docs/memory.md` · decisiones #1–#105 → `docs/README.md` · QA de F5 →
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
| Pendientes post-F5 (residuos) | **Contenido real**: al reemplazar el nombre de ejemplo en `src/content/cv.*.json`, re-observar 375px es/en el gap chevron↔nombre (spot-check midió 23px exactos con "Alex Rivera" — límite, sin defecto) · **deudas de forma**: comentario inglés `useHashTab.test.ts:143`, jerga "asiértan/asiértala" en tests (transversal), `lang="es"` sin restaurar en AppLayout.test (nota) — pase único solo si el usuario lo decide · opcionales kit: `cursor: pointer` no listado en controles/bullets, fila `contrast.md` regla 6 para ServiceCard | Decisión del usuario; sin fecha |
| Deudas menores de F1 | `StrictMode` sin mandato (si se quiere, es Cambio), `value` de contexto sin `useMemo` en ambos providers, typos "recalculera", rastro `07eead6`; detalle en `docs/memory.md`. Reevaluadas al cerrar F2 (2026-10-06): **permanecen**, sin impacto en F2 | Sin fecha; decisión del usuario si se reparan |
| Deudas menores de F2 | (a) AGENTS.md "parámetros sin usar: prefijo `_`" es impreciso con el eslint real (`after-used`, sin `argsIgnorePattern`: el `_` no protege el último parámetro) → enmienda a decidir por el usuario; (b) nota #99: con el proxy CSS-Modules de Vitest la rama de fallback puede no ejercitarse nunca — la validez del patrón está en compartir el objeto `styles` entre test e implementación; (c) stderr preexistente `act(...)` en 2 tests de `ThemeProvider.test.tsx` (pasan) → decidir si repara | (a) y (c): decisión del usuario; (b): próxima revisión de la skill sdd |

## Entradas

### §XIII · 2026-11-06 — Mantenimiento: bug-fix ControlsBar T4 (alineación)
- Qué: el `div[role="group"]` interno de ControlsBar pasó a ser el contenedor flex (`.group`: `display:flex; align-items:center; gap:var(--controls-gap)`); se eliminó el `gap` inerte del `<header>` (único hijo flex: el group). Corrige la alineación por baseline que bajaba ThemeToggle respecto de LanguageSwitcher; sin cambio de API, ARIA ni spec (el usuario lo clasificó como bug-fix).
- Checks: lint ✓ · typecheck ✓ · test **446/40** ✓ · build ✓ · QA visual 375/768/1024/1440 × claro/oscuro × en/es: mismo top/bottom y gap 8/12px, sin overflow ✓.
- Decisiones: ninguna nueva (mantenimiento).
- Commits: `d65ac7a` (test) · `9f9de59` (fix) · `f97562d` (T4 en tasks) · `a12dfb7` (T4 aprobada).
- Abre: nada; cierra: nada.

### §XII · 2026-10-08 — Cierre de F5 (QA) — fin del proceso F1–F5

- Qué: **F5 CERRADA**. Cuatro pasadas del reviewer con chrome-devtools MCP sobre la app servida por el usuario (#91) + verificación de **papel real por Ctrl+P del usuario: APROBADA** (6/6 criterios). La 1ª/2ª pasada detectaron el paquete #104 (B-2/B-3/M-1 print, D1 solape 375, D2/D3 anillos, D4 favicon), corregido íntegramente en 8 tareas nuevas repartidas en sus piezas (ControlsBar T3, CornerTab T5, TestimonialCard T4, Sidebar T7, AppLayout T7/T8, Foundation T13/T13b) y re-verificado en vivo en pasadas 3/4 + spot-check #105c. Decisiones del usuario: **#104** (mecánicas) y **#105** (visuales: favicon cerrado como está, **F8 CERRADO** — `9rem` definitivo sin captura; base `< md` `6.375rem` aplicada, commit del usuario `190c678`; chevron con acento semántico por tema). Cierre del proceso: **F1–F5 completas**, 27/27 specs `implementada`, proyecto entregado.
- Checks: lint ✓ · typecheck ✓ · test **445/40** ✓ · build ✓ · validate:content ✓ · axe en navegador: **0 violaciones** (2×about/res × 2 idiomas) ✓ · contrastes del chevron: 5.87:1 claro / 12.06:1 oscuro ✓ (filas contrast.md 15/19/39) · zero overflow 375–1440 ✓ · sticky/float/dialog/teclado ✓ (informe completo con evidencia en `docs/qa-report.md`).
- Decisiones: **#104** y **#105** → registro. Sin reglas nuevas de proceso.
- Commits del paquete: `eaa4d01` `25e2ee4` `02a2756` `fac2fbe` `87edfd1` `74bafe2` `b93c510` (+ tests `c0492ac` `dc026d0` `7d602eb` `06bf088`); docs #104 `3b86937`, kit #104b `6109561`, qa-report `f2cb537` `5b9fce3`, #105 `5a9c240`, token `190c678` (usuario). Cierre de F4 en §XI. Menores de forma registradas en `tasks.md`/`qa-report.md`.
- Abre: fila "Pendientes post-F5 (residuos)" (contenido real + re-observar gap 23px con nombre definitivo; deudas de forma opcionales). Cierra: filas F5/F3 y el resto de F4 de **Abiertos**. Proceso completo: queda del usuario el push (57+ commits) y el reemplazo del contenido de ejemplo.

### §XI · 2026-10-08 — Cierre de F4

- Qué: **F4 Integración cerrada (4/4)**: `hooks/useHashTab` (3 tareas), `pages/AboutPage` (4), `pages/ResumePage` (4) y `layout/AppLayout` (6) con spec `Estado: implementada`; `App.tsx` definitivamente montado sobre AppLayout; impresión transversal fijada por contrato `data-*` + `global.css` (decisión **#103**) y token nuevo `--z-skip`. Kickoff: Clarificación con hallazgos en las 4 specs (U1–U5, A1–A11, P1–P11) resueltas por el usuario; Plan+Tareas de fase aprobados en una puerta (17 tareas, asignación 1:1 de Tests verificada antes del cierre, regla F3). Hitos de proceso: **guard `isTabId`** en el sitio de uso (NavTabs intacta; alternativa genérico descartada); el stack `data-print-page` con **una sola copia de cada página** (resuelve h1 doble, ids duplicados y orden dependiente del tab); ajuste T2b/T3b en AboutPage (re-acotes de asserts globales `<p>`/`article` ante contenido nuevo, **con aprobación explícita del usuario**, patrón F3 vigente); 3 tareas de **verificación pura** sin `feat` en AppLayout (T2/T3/T4, on-arrival declarado por test, extensión práctica de #101); reemplazo autorizado del smoke de `App.test.tsx` (doble documentación Foundation+plan T6); **reparo comment-only `fix(SectionTitle)`** (glob con `*/` que cerraba el comentario: bug latente de F2 que solo el primer build con grafo completo destapó — el build #80 por pieza en F2/F3 nunca importó esos módulos en `vite build`); mock `vi.hoisted`+`importOriginal` consolidado para variantes de contenido (vacíos/`end: null`).
- Checks: lint ✓ · typecheck ✓ · test **441/40** ✓ · build ✓ (1988 módulos, post-reparo `7e07fcc`) · validate:content ✓ (todo sobre `7e07fcc`/HEAD de la puerta).
- Decisiones: **#103** → `docs/README.md`. Nuevas reglas de proceso: ninguna fuera de aplicaciones de #99/#101/#102 y del patrón de ajuste entre tareas ya vigente.
- Commits: specs `implementada` `ac65f1f` `6d8d0d5` `2984844` `730d9ce`; Clarificación aplicada `b42c4ab`; plan/tasks fase `dc05e3b`; tokens `--z-skip` `b2563f0` (usuario); feats clave `7e0f45c` `ab13f31` `ceb9c12` (hook) `8f47cb4` (AboutPage T4) `977a320` (ResumePage T4) `0fe9c9c`/`127cff7` (AppLayout T5/T6); reparo `7e07fcc`. Notas de forma: `730d9ce` marcó T6 **y** spec en un solo commit bajo subject "T6 approved"; `bc040d2` subject con sufijo español (#102, no enmendable); `127cff7` sin cuerpo.
- Abre: fila "Seguimientos F4" en **Abiertos**; cierra: items F4-verification de la fila "Seguimientos F3" (no-BFC, skip-link→ControlsBar, banner único, defs ×1, unicidad tabpanel, superficies RF-4 de primitivas en consumidores). **Siguiente: F5** — QA completa con app servida por el usuario (#91; pedir `npm run dev` y URL), informe en `docs/qa-report.md` (#85).

### §X · 2026-10-07 — Cierre de F3

- Qué: **F3 Compuestos cerrada (12/12)**: ThemeToggle, LanguageSwitcher, ControlsBar, NavTabs, Sidebar, Timeline, ResumeSection, SkillList, ServiceCard, TestimonialCard, TestimonialDialog y TestimonialCarousel con spec `Estado: implementada`. Por pieza: Clarificación→Plan/Tareas de fase (aprobados `bdfa58c` tras la ronda de hallazgos G-A…G-E/1–21), revisión por tarea + revisión completa + `build` ✅. Hitos de proceso: **Foundation T12** (Cambio `formatPeriodEndpoint` + `controls.lightMode`), extensión **#100** a `"getTabId"` (aprobada por el usuario, `0df3855`), ajustes de aserción entre tareas **con aprobación explícita** (Sidebar `4ff4424`; Carousel T5 `b6efae7`), **Cambio de accesibilidad opción A** (Test 12 inviable con `li[role=group]` por `aria-allowed-role`+`list` de axe → modelo div de slides; cerrado en verde **sin** desactivar reglas ni tocar `src/test/`), 2 puertas de pieza RECHAZADAS r1→APROBADAS r2 (NavTabs: Test esperado #11 caído del reparto; TestimonialDialog T1: effect de presencia con dep `[open]`), y regla nueva **#102** (L2: subject EN, cuerpo ES sin acentos). Lecciones fijadas: cross-check 1:1 de "Tests esperados" antes de dictar revisión completa; sin archivos scratch (no hay `rm` en allowlists).
- Checks: lint ✓ · typecheck ✓ · test **395/36** ✓ · build ✓ por pieza y al cerrar (spec final `6b871e1`).
- Decisiones: #99/#100 (ext. "getTabId")/#101 (ext. commit único `test` sin `feat`: ThemeToggle T2)/**#102** → registro. Ninguna regla nueva además de #102.
- Commits: specs `implementada` ×12 `35083ef` `3da32b9` `ddfd1f7` `d63d1b1` `82017f1` `3b457f3` `ef78c22` `bf26962` `0388366` `3ce10df` `37711dc` `6b871e1`; Cambio Carousel `d535895`; T12 `29b063f`.
- Abre: fila "Seguimientos F3" en **Abiertos**; cierra: nada propio (F8 y F5 siguen; deudas F1/F2 permanecen según sus filas).

### 2026-10-06 · Decisión #102 — L2: subject inglés, cuerpo español sin acentos · #102 · `git show 3da32b9:docs/diagnostics.md`

### §IX · 2026-10-06 — Cierre de F2

- Qué: **F2 Primitivas cerrada (11/11)**: Icon, BrandIcon, Box, Button, Badge,
  Overhead, IconBox, SectionTitle, Separator, CornerTab y HexAvatar con spec
  `Estado: implementada`. Por pieza: revisión por tarea + revisión completa +
  `build` ✅. Mecanismos aplicados: #99 (aserción P2), #100 (`BRAND_NAMES`),
  #101 extendido en la práctica (verdes on-arrival declarados en Button T6,
  Badge T3, Overhead T3/T4, SectionTitle T3/T5, Separator T3, CornerTab T4,
  HexAvatar T3/T4; **commit único `feat` sin `test`** cuando no hay nada
  discriminate-testable: IconBox T3). Decisiones de delegación registradas en
  las notas de `tasks.md` (gaps de reparto de `index.ts` en todas y de
  `className` en CornerTab T1, `31adfb5`). El reviewer validó `display: block`
  en HexAvatar T2 como necesidad mecánica fiel (no Cambio) y recálculo propio
  de la geometría de "Forma" en T1. Las restricciones de uso de primitivas
  (Badge RF-6, Overhead RF-4, IconBox RF-5, Separator RF-4 gap, CornerTab
  no-BFC y float ≥992, combo hover+focus Button, Safari/H-8, F8) se verifican
  en F3/F4/F5 según sus specs.
- Checks: lint ✓ · typecheck ✓ · test **236/236 (22 archivos)** ✓ · build ✓
  por pieza y al cerrar (HEAD `1a0ec18`, árbol limpio).
- Decisiones: ninguna nueva de regla en esta puerta; #99/#100/#101 ya
  registrados (entradas podadas abajo; detalle en git). Deudas menores F2 →
  tabla **Abiertos**.
- Commits: specs `implementada` ×11 `ee9ee34` `765834a` `aaab301` `76c348d`
  `1962e3f` `b2783f6` `cc2cb0d` `ac47b8e` `d21b3aa` `3a6da02` `1a0ec18`; feats
  de HexAvatar `09c9e03` `9137a67` `bcfe9ec` `b0b2b2c`; docs de estado por
  pieza (`d0da569` … `c5a7879`).
- Abre: fila "Deudas menores de F2" en **Abiertos**; cierra: nada propio — la
  fila de deudas de F1 se **reevaluó** y permanece; F8 y F5 siguen abiertos.

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
