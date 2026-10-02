---
description: "SDD · Entrevista y redacta una spec nueva (uso: /sdd-spec <categoria>/<Name> <idea inicial>)"
agent: orchestrator
---

Carpeta de la spec: `specs/$1/` (por ejemplo `primitives/Badge`).
Idea inicial: el texto de `$ARGUMENTS` que sigue a `$1`.

Cargá la skill `sdd` y leé `docs/constitution.md`, `specs/README.md` y `docs/memory.md`.
**No escribas código.**

1. Si `specs/$1/spec.md` ya existe, frená y avisame (para cambiarla se usa `/sdd-change`).
2. Hacé preguntas de UNA en UNA para eliminar ambigüedades (casos límite, errores, qué queda
   fuera de esta versión). Máximo 5 preguntas.
3. Con mis respuestas, redactá `specs/$1/spec.md` con la plantilla de `specs/README.md`
   (10 secciones + `Estado: borrador` + `## Requisitos (EARS)`). Si es una pieza del kit,
   incluye API, tokens y estructura HTML; si es una spec de dominio nueva, solo el QUÉ y
   el POR QUÉ (ver la skill).
4. Mostrame el contenido y esperá mi aprobación antes de guardar (tu permiso sobre
   `spec.md` es `ask`).
