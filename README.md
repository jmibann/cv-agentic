# cv-agentic

Sitio CV personal (**React + TypeScript + Vite + CSS Modules**, responsive,
claro/oscuro, en/es) construido por agentes de OpenCode con
**spec-driven development**.

## Estado actual (2026-11-13)

| Qué | Estado |
|---|---|
| Kit de diseño (reglas, tokens, fundamentos, 28 specs, contrato de datos) | ✅ Completo y auditado; `## No hacer` en las 27 de componentes + Foundation (#89) |
| Modelo único de spec (`specs/<categoria>/<Name>/{spec,plan,tasks}.md`, plantilla de la skill `sdd`, `Estado` + `Requisitos (EARS)` en las 27) | ✅ Migrado y aprobado (2026-10-02); `plan.md`/`tasks.md` los redacta el orchestrator en sus puertas |
| Agentes OpenCode (5) | ✅ En `.opencode/agents/`; el orchestrator también edita el registro de decisiones y `docs/agent-system.md` (#95) |
| Diagnóstico A, B, C, F, reestructuras H/I, auditoría J y constitución (K) | ✅ Cerrados |
| Repositorio git (baseline) | ✅ Inicializado; primeros commits del modelo de spec |
| Sticky del Sidebar en pantallas bajas | ✅ Resuelto: sticky solo con alto ≥ 900px |
| Constitución (`docs/constitution.md`) | ✅ Vigente; P1 verificado contra `specs/**/<Name>/spec.md` (decisión #68); P2/P4/T2 por tarea (decisión #69); P2 aclarado (decisión #75) |
| Comandos `/sdd-*` | ✅ Integrados: corren con el orchestrator o el reviewer, con argumento `<categoria>/<Name>` (decisión #71) |
| Puertas | ✅ Plan + Tareas por fase F1–F4 (#74, #84, #85); Clarificación solo con hallazgos (#90): entre ~37 y ~65 puertas en lugar de ~113 |
| Auditoría de arquitectura (agentes, skills, comandos) | ✅ Cerrada (2026-10-02): sin bloqueantes; 6 puntos corregidos (#75–#80); re-auditoría: 4 hallazgos medios corregidos (#81–#82); tercera auditoría: 2 altos (#83 identidad de git en permisos, #84 F1 como pieza `foundation/Foundation` con Tn) 7 medios (#85–#91) y bajos (#92–#94) corregidos; sin pendientes |
| Unidad de trabajo y memoria | ✅ Por tarea (Tn) en todo el sistema; memoria única en `docs/memory.md` (decisiones #69 y #70) |
| Contenido del CV en JSON (esquema + validación) | ✅ Operativo desde F1: esquema + generados (`gen:types`, `build:validator`) + `validate:content` en verde; contenido inicial en `src/content/cv.{en,es}.json` |
| `spec.md` de `foundation/Foundation` + `plan.md` / `tasks.md` | ✅ Aprobados; Tareas de las demás piezas: al inicio de su fase F |
| **F1 Foundation** (pieza `foundation/Foundation`, Tn por encargo) | ✅ **Cerrada (2026-10-03)**: spec `Estado: implementada`; T1–T11 + T2b/T3b/T5b/T8b aprobadas; revisión completa APROBADA; QA visual en navegador APROBADO. Cambios: `skipLibCheck`, #96 (`react-refresh` hooks), #97 (`ucs2length` aceptado). Deudas menores en `docs/memory.md` |
| **F2 Primitivas** (Icon, BrandIcon, Box, Button, Badge, Overhead, IconBox, SectionTitle, Separator, CornerTab, HexAvatar — 11 piezas) | ✅ **CERRADA (2026-10-06)**: las 11 specs `Estado: implementada`; por pieza: revisión por tarea + revisión completa APROBADA + `build` ✅. Suite: 236 tests, 0 warnings. Decisiones aplicadas: #99, #100, #101 (verdes on-arrival declarados; commit único `feat` en IconBox T3; gaps de reparto cubiertos con notas en `tasks.md`: `index.ts` en todas, `className` en CornerTab T1). Entrada de cierre: §IX en `docs/diagnostics.md` (poda #98 aplicada). Deudas menores F2 y restricciones de uso diferidas → tabla **Abiertos** de diagnostics y líneas de abajo |
| **F3 Compuestos** (12 piezas) | ✅ **CERRADA (2026-10-07)**: las 12 specs `Estado: implementada` (ThemeToggle, LanguageSwitcher, ControlsBar, NavTabs, Sidebar, Timeline, ResumeSection, SkillList, ServiceCard, TestimonialCard, TestimonialDialog, TestimonialCarousel). Por pieza: revisión por tarea + completa APROBADA + `build` ✅. Suite: **395 tests**, 0 warnings. Hitos: Foundation T12, extensión #100 `"getTabId"`, ajustes de aserción entre tareas con aprobación explícita (`4ff4424`, `b6efae7`), **Cambio accesibilidad opción A** (slides `div`, cierre axe verde sin filtros), 2 puertas r1→r2 (NavTabs, TestimonialDialog T1), decisión **#102**. Entrada de cierre: §X en `docs/diagnostics.md` (poda #98 aplicada). Seguimientos acumulados → fila "Seguimientos F3" en **Abiertos** de diagnostics |
| **F4 Integración** (hooks/useHashTab, pages/AboutPage, pages/ResumePage, layout/AppLayout + contenido es/en + impresión) | ✅ **CERRADA (2026-10-08)**: las 4 specs `Estado: implementada` (17 tareas; `build` ✅ post-reparo `7e07fcc`). `App.tsx` definitivo sobre AppLayout; impresión fijada por contrato `data-*` + `global.css` con orden About→Resume estable (**decisión #103**; token nuevo `--z-skip` en `tokens.css`). Los heredados de F3 se verificaron: skip-link→ControlsBar ✓ test 8, banner único ✓ test 1, defs ×1 ✓ test 7, tabpanel único e ids sin duplicar ✓ tests 9/12 + escaneo anti-`duplicate-id`, no-BFC ✓ inspección, superficies RF-4 de primitivas en consumidores ✓. Hitos: guard `isTabId` sin tocar NavTabs, ajustes T2b/T3b con aprobación explícita, 3 verificaciones puras sin `feat` (#101), reparo comment-only de F2 (`*/` en comentario). Entrada de cierre: §XI en `docs/diagnostics.md`. **Seguimientos F4** (impresión real, sticky/float/contrastes…) → fila nueva en **Abiertos** → F5 |
| **F5 QA** | ✅ **CERRADA (2026-10-08) — fin del proceso F1–F5**: 4 pasadas del reviewer con chrome-devtools MCP sobre la app servida + **Ctrl+P real aprobado por el usuario** (6/6 criterios de papel). Primera pasada detectó el paquete **#104** (print B-2/B-3/M-1, D1 solape 375, D2/D3 anillos, D4 favicon) → 8 tareas nuevas en sus piezas, todas aprobadas y re-verificadas en vivo; decisiones visuales **#105** (favicon cerrado, **F8 cerrado** `9rem` definitivo, base `< md` `6.375rem`, chevron con acento semántico). Informe con evidencia: `docs/qa-report.md`; cierre: §XII en diagnostics. **28/28 specs `implementada`, suite 445/40, build ✅.** Residuos no bloqueantes → fila "Pendientes post-F5" (contenido real + deudas de forma opcionales) |
| **Mantenimiento (2026-11-06)** | ✅ **Bug-fix ControlsBar T4**: ThemeToggle y LanguageSwitcher alineados en una fila flex con `.group` (`display: flex; align-items: center; gap: var(--controls-gap)`); se eliminó el `gap` inerte del `<header>`. Sin cambio de API/ARIA/spec. Suite **446/40**, lint/typecheck/build ✅; QA visual 375/768/1024/1440 × claro/oscuro × en/es ✅. Commits `d65ac7a`/`9f9de59`; T4 en `specs/controls/ControlsBar/tasks.md`. |
| **Deploy GitHub Pages (2026-11-11)** | ✅ `vite.config.ts` usa base `/cv-agentic/` solo con `DEPLOY_TARGET=gh-pages` (local/Vercel siguen en `/`); `src/utils/assetUrl.ts` antepone `BASE_URL` a assets públicos y deja intactas las URLs externas. `HexAvatar` y el CTA de descarga del `Sidebar` lo usan. Commits `c2d4232` y `5f6c0a6`; suite **447/40**, lint/typecheck/build ✅. |
| **CV real (2026-11-11)** | ✅ **Cargado y validado**: `src/content/cv.{en,es}.json` con el CV real, 3 testimonios reales (desde 2026-11-12, #112), contact sin teléfono/WhatsApp y `downloadCvUrl` al PDF; avatar actualizado y `avatar.svg` retirado; tests adaptados con fixtures y expectativas derivadas del contenido. Commits `3855eb0` `befb0db` `63f6665`; `validate:content`/build ✅. Spec/plan/tasks de Foundation alineados con el contenido real y `headline`/cargos de `cv.es.json` en inglés por decisión editorial (decisión **#109**). **QA visual APROBADA (§XVI)**: grilla 375–1440 × temas × idiomas sin overflow ni solapes y gap chevron↔nombre a 375px con el nombre real = **72.84px** (→ `docs/qa-report.md`). |
| **CI y Node 26 (2026-11-12)** | ✅ **Node 26 LTS** (`.nvmrc` `26`, `@types/node` `^26`; constitución S5 y entorno aprobado actualizados, **#110**) y `deploy.yml` lee `node-version-file: .nvmrc`. **Quality gates** en el deploy: `lint` → `test` → `build`; si algo falla no se publica (**#111**); sin la línea `VITE_API_URL`. Commits `cf28268` y `35dbf2d`; suite **447/40**, lint/typecheck/build ✅. Detalle: §XVII. |
| **Testimonios (2026-11-12)** | ✅ 3 testimonios reales (María Angélica Grael, Pablo Tigani, Diego Rafael Harari) con sus fotos reales; textos literales en su idioma original y traducidos al otro (**#112**). Cambios de `TestimonialCard`: T5, la comilla ya no pisa nombres largos; T6 (**#113**), el avatar queda anclado arriba y alineado entre cards con cualquier cantidad de líneas. QA en navegador 375–1440 × claro/oscuro × en/es ✅. Commits `b0f19bc` `11d5edc` `7f7cbe3` `390bb06` `24faf70` `8bac5b7`; detalle §XVIII–§XIX. |
| **Resume en una columna (2026-11-12)** | ✅ Experience arriba y Education debajo, cada una con su timeline a ancho completo, en todos los anchos (**#114**, ResumePage T5; antes iban lado a lado desde 768px). Orden invertido en el DOM para que lectura y foco sigan el visual. Commits `28e6ecf` `1c16bf5` `174bc4e`; detalle §XX. |
| **Favicon y título (2026-11-12)** | ✅ Favicon tipo app (cuadrado azul, hexágono blanco y monograma JM), `apple-touch-icon.png` 180×180 y título de pestaña `Juan Manuel Ibáñez · Frontend Engineer` (**#115**, Foundation T14). Commits `a0d7b5f` `3b4db39` `516621a` `9ebcca4`; detalle §XXI. |
| **Motion (2026-11-13)** | ✅ **Cambios 1 (Foundation) y 2 (AppLayout) CERRADOS** (#106/#116, §XXIV–§XXV): etapa 1 — escala de tokens, `data-theme-switching`, contrato y `foundations/motion.md`; etapa 2 — entrada de panel al cambiar de tab (RF-9 de AppLayout; `src/lib/tabDirection.ts` pura, wrapper con `key` + `data-motion-direction`, `@keyframes` con `var(--panel-enter-x)`, `backwards`, print en el módulo; T10–T13 aprobadas, QA en vivo midió la animación bidireccional ~0.3s y el flujo del `h1` junto a la solapa). Suite **463/41**, 28/28 `implementada`. Faltan **Cambios 3–4** (grid del Sidebar, TestimonialDialog) con su puerta cada uno y la regla #116. |
| Post-entrega / próximos trabajos (2026-11-13) | Push de los commits locales (lo hacés vos; `main` adelantado) y verificar Actions post-push · abrir los **Cambios motion 3–4** (arrancan con los menores de la fila Motion de Abiertos, incl. las confirmaciones manuales reduced-motion con flag real y Ctrl+P) · deploy ya publicado e inspeccionado en vivo (§XXI, #115/T14c) · opcionales: deudas de forma, StrictMode/F1-F2 (tabla **Abiertos** de diagnostics) · ~~seguimientos de F2~~ **cerrados**: sus ítems se verificaron en F3–F5 (combo hover+focus del Button resuelto por cascada en `Button.module.css`; `--button-small-padding-*` son tokens desde #99) |

Detalle y decisiones: [docs/diagnostics.md](docs/diagnostics.md).

## Estructura

```
cv-agentic/
├─ README.md          este índice
├─ AGENTS.md          convenciones para los agentes (OpenCode lo lee desde la raíz)
├─ docs/              documentación (constitution, README completo, DESIGN, BACKLOG, diagnostics, agent-system.md, tokens/)
├─ tokens/            tokens.css (lo importa la app)
├─ foundations/       tipografía · layout · movimiento · theming · i18n
├─ specs/             una carpeta por pieza (<categoria>/<Name>/spec.md) + motion/proposal.md
├─ data/              esquema JSON del CV (fuente de verdad) + ejemplos
├─ .opencode/         agents/ (los 5 agentes), skills/sdd/, commands/ (/sdd-*)
├─ opencode.json      config de OpenCode (MCP de Chrome DevTools, solo para el reviewer)
└─ src/ · public/ · index.html · package.json   ← los crea la Fase 1
```

## Mantenimiento (modo actual — desde 2026-10-08)

El proceso F1–F5 cerró; el sitio quedó **entregado y en verde** (463 tests,
build, validate:content, QA en navegador y en papel; últimos trabajos:
bug-fix ControlsBar T4, base de deploy para GitHub Pages y CV real, 2026-11-11;
Node 26 LTS y quality gates en el deploy, 2026-11-12).
Para reabrir trabajo, el flujo vive en la skill `sdd` y los agentes en
`.opencode/agents/`:

| Quiero… | Cómo |
|---|---|
| Actualizar el CV (textos, avatar, testimonios, `downloadCvUrl`) | Editar `src/content/cv.{en,es}.json` (formato fijo por `data/cv.schema.json`) → `npm run validate:content` + `npm test`. Con el nombre real definitivo: re-observar 375px es/en el gap chevron↔nombre (fila "Pendientes post-F5" de diagnostics). Encargo al `integrator` (dueño de `src/content/**`) |
| Cambiar comportamiento/estética de una pieza | **Cambio** sdd: spec → plan → tareas → código (puertas); defecto encontrado → tarea nueva en su `tasks.md` |
| Pieza/función nueva (p. ej. las del `docs/BACKLOG.md`) | `/sdd-spec <categoria>/<Name>` → puerta spec → `/sdd-plan <cat>/<Name>` → puerta Plan+Tareas → delegación por Tn → reviewer |
| Verificar algo en el sitio servido | `npm run dev` (lo corrés vos, #91) + pasada enfocada del `reviewer` con chrome-devtools |
| Saber dónde está todo | Memoria: `docs/memory.md` · Log/pendientes: `docs/diagnostics.md` (**Abiertos**) · Decisiones #1–#116: `docs/README.md` · QA final: `docs/qa-report.md` · Motion: `specs/motion/proposal.md` |

Reglas que siguen vigentes sin excepción: specs intocables sin tu aprobación
(P2/#94); `src/test/**` y configs, nadie los edita; `src/test/a11y.ts`, nunca;
commits TDD por tarea sin `--amend` ni push (push: solo vos); DoD = lint +
typecheck + test por tarea, `build` al cerrar pieza/puerta.

## Por dónde empezar

1. [docs/constitution.md](docs/constitution.md): las reglas no negociables
   del proyecto (están por encima de todo).
2. [docs/README.md](docs/README.md): qué es el kit, cómo lo usa la app,
   dependencias aprobadas y registro de decisiones.
3. [docs/DESIGN.md](docs/DESIGN.md): lenguaje visual y reglas duras.
4. [specs/README.md](specs/README.md): índice de specs y orden de construcción.
5. [AGENTS.md](AGENTS.md) y [docs/agent-system.md](docs/agent-system.md): cómo trabajan los agentes.
6. [docs/memory.md](docs/memory.md): memoria del proyecto (estado y decisiones recientes).
