---
description: "SDD · Cambio de requisitos: primero la spec, después el código (uso: /sdd-change <categoria>/<Name> <cambio>)"
agent: orchestrator
---

Cambio para `specs/$1/spec.md`: el texto de `$ARGUMENTS` que sigue a `$1`.

Cargá la skill `sdd` (sección Cambio) y leé `docs/constitution.md`. **No toques código.**

1. Proponé el cambio en `specs/$1/spec.md`: RF nuevos o modificados en EARS, casos límite,
   lo que queda fuera de alcance y los "Tests esperados" que cambian.
2. Indicá qué partes de `plan.md` y `tasks.md` habría que cambiar después (no las cambies todavía).
3. Mostrame el diff de la spec y esperá mi aprobación (tu permiso sobre `spec.md` es `ask`).
   Con la spec aprobada, el cambio sigue por `/sdd-plan` y `/sdd-task`.
