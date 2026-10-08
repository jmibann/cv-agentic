# cv-agentic

Sitio CV personal (**React + TypeScript + Vite + CSS Modules**, responsive,
claro/oscuro, en/es) construido por agentes de OpenCode con
**spec-driven development**.

## Estado actual (2026-10-08)

| Qué | Estado |
|---|---|
| Kit de diseño (reglas, tokens, fundamentos, 27 specs, contrato de datos) | ✅ Completo y auditado; `## No hacer` en las 27 (#89) |
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
| **F5 QA** | ✅ **CERRADA (2026-10-08) — fin del proceso F1–F5**: 4 pasadas del reviewer con chrome-devtools MCP sobre la app servida + **Ctrl+P real aprobado por el usuario** (6/6 criterios de papel). Primera pasada detectó el paquete **#104** (print B-2/B-3/M-1, D1 solape 375, D2/D3 anillos, D4 favicon) → 8 tareas nuevas en sus piezas, todas aprobadas y re-verificadas en vivo; decisiones visuales **#105** (favicon cerrado, **F8 cerrado** `9rem` definitivo, base `< md` `6.375rem`, chevron con acento semántico). Informe con evidencia: `docs/qa-report.md`; cierre: §XII en diagnostics. **27/27 specs `implementada`, suite 445/40, build ✅.** Residuos no bloqueantes → fila "Pendientes post-F5" (contenido real + deudas de forma opcionales) |
| Post-entrega (del usuario) | Push de las 57+ commits locales · reemplazar el contenido de ejemplo de `src/content/cv.{en,es}.json` (con nombre real, re-observar 375px es/en el gap chevron↔nombre: 23px medidos con "Alex Rivera") · opcionales: `downloadCvUrl` (ejercita `aside [download]`), pase de deudas de forma, StrictMode/F1-F2 (filas propias en Abiertos) |
| F2 → seguimientos abiertos | Combo hover+focus del Button (el `outline` gana siempre; la spec no fija el combo) → **F5** · Badge RF-6 ("no dentro de `Box inner`") se verifica en los consumidores → **F3/F4** (SkillList/Sidebar) · Overhead RF-4 (nunca sobre `--color-bg` en claro) se verifica en los consumidores → **F3/F4** (Sidebar) · IconBox RF-5 (no dentro de `Box variant="inner"`) se verifica en los consumidores → **F3/F4** (Sidebar/ResumeSection) · `--button-small-padding-*` literales: promover a token si se repite en otro componente |

Detalle y decisiones: [docs/diagnostics.md](docs/diagnostics.md).

## Estructura

```
cv-agentic/
├─ README.md          este índice
├─ AGENTS.md          convenciones para los agentes (OpenCode lo lee desde la raíz)
├─ docs/              documentación (constitution, README completo, DESIGN, BACKLOG, diagnostics, agent-system.md, tokens/)
├─ tokens/            tokens.css (lo importa la app)
├─ foundations/       tipografía · layout · movimiento · theming · i18n
├─ specs/             una carpeta por pieza (<categoria>/<Name>/spec.md)
├─ data/              esquema JSON del CV (fuente de verdad) + ejemplos
├─ .opencode/         agents/ (los 5 agentes), skills/sdd/, commands/ (/sdd-*)
├─ opencode.json      config de OpenCode (MCP de Chrome DevTools, solo para el reviewer)
└─ src/ · public/ · index.html · package.json   ← los crea la Fase 1
```

## Por dónde empezar

1. [docs/constitution.md](docs/constitution.md): las reglas no negociables
   del proyecto (están por encima de todo).
2. [docs/README.md](docs/README.md): qué es el kit, cómo lo usa la app,
   dependencias aprobadas y registro de decisiones.
3. [docs/DESIGN.md](docs/DESIGN.md): lenguaje visual y reglas duras.
4. [specs/README.md](specs/README.md): índice de specs y orden de construcción.
5. [AGENTS.md](AGENTS.md) y [docs/agent-system.md](docs/agent-system.md): cómo trabajan los agentes.
6. [docs/memory.md](docs/memory.md): memoria del proyecto (estado y decisiones recientes).
