# cv-agentic

Sitio CV personal (**React + TypeScript + Vite + CSS Modules**, responsive,
claro/oscuro, en/es) construido por agentes de OpenCode con
**spec-driven development**.

## Estado actual (2026-10-01)

| Qué | Estado |
|---|---|
| Kit de diseño (reglas, tokens, fundamentos, 27 specs, contrato de datos) | ✅ Completo y auditado |
| Agentes OpenCode (5) | ✅ En `.opencode/agents/` |
| Diagnóstico A, B, C, F, reestructuras H/I y auditoría de arquitectura completa (J, 1–24) | ✅ Cerrados |
| Sticky del Sidebar en pantallas bajas | ✅ Resuelto: sticky solo con alto ≥ 900px |
| Constitución (`docs/constitution.md`) | ✅ Vigente; enlazada desde `AGENTS.md` y los agentes |
| Contenido del CV en JSON (esquema + validación) | ✅ Especificado: `data/cv.schema.json` + ejemplos JSON; se genera en F1 |
| Skills, piezas de SDD (PRD, IDs, DoR) y QA visual | ⏳ Próxima fase |
| App (`src/`, `package.json`, `.git`) | ⏳ No creada: la arma la Fase 1 (foundation) |

Detalle y decisiones: [docs/diagnostics.md](docs/diagnostics.md).

## Estructura

```
cv-agentic/
├─ README.md          este índice
├─ AGENTS.md          convenciones para los agentes (OpenCode lo lee desde la raíz)
├─ docs/              documentación (constitution, README completo, DESIGN, BACKLOG, diagnostics, agents, tokens/)
├─ tokens/            tokens.css (lo importa la app)
├─ foundations/       tipografía · layout · movimiento · theming · i18n
├─ specs/             una spec por pieza
├─ data/              esquema JSON del CV (fuente de verdad) + ejemplos
├─ .opencode/agents/  los 5 agentes
└─ src/ · public/ · index.html · package.json   ← los crea la Fase 1
```

## Por dónde empezar

1. [docs/constitution.md](docs/constitution.md): las reglas no negociables
   del proyecto (están por encima de todo).
2. [docs/README.md](docs/README.md): qué es el kit, cómo lo usa la app,
   dependencias aprobadas y registro de decisiones.
3. [docs/DESIGN.md](docs/DESIGN.md): lenguaje visual y reglas duras.
4. [specs/README.md](specs/README.md): índice de specs y orden de construcción.
5. [AGENTS.md](AGENTS.md) y [docs/agents.md](docs/agents.md): cómo trabajan los agentes.
