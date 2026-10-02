---
description: "SDD · Tareas de una pieza suelta o de un Cambio, con su plan ya aprobado (uso: /sdd-task <categoria>/<Name>)"
agent: orchestrator
---

Para piezas de una fase F, las tareas se redactan con `/sdd-plan <fase>` (puerta
por fase). Este comando es para una pieza suelta o un Cambio.

Cargá la skill `sdd` (sección Tareas). A partir de `specs/$1/spec.md` y `specs/$1/plan.md`
(aprobado), redactá `specs/$1/tasks.md`:

- Tareas pequeñas (máx. 20–30 min cada una), en orden de dependencia, con checkbox.
- Cada una con los RF que cubre y una línea "Hecho cuando:" verificable.
- Si salen más de 10, proponé dividir la spec.

Mostrame las tareas y esperá mi aprobación (puerta de Tareas).
