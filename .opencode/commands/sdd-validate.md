---
description: "SDD · Revisión completa de una pieza RF por RF: tests + Chrome DevTools (uso: /sdd-validate <categoria>/<Name>)"
agent: reviewer
---

Hacé la **revisión completa de la pieza** `specs/$1/spec.md` (tu checklist + skill `sdd`,
sección Validación), con contexto limpio. **No arregles nada.**

1. Recorré la spec requisito por requisito. Para cada RF indicá qué test lo cubre y el
   resultado de `npm test`.
2. Los RF de interfaz que no se puedan verificar con `npm test`, verificalos con el MCP de
   Chrome DevTools (configurado en `opencode.json`), incluida la vista móvil de 375 px y
   ambos temas. Necesitás la app servida: si no hay un servidor corriendo, pedime que
   levante `npm run dev` (vos no podés iniciarlo). Si el MCP no responde, listá esos RF como
   "sin verificar (QA visual)".
3. Comprobá los criterios de finalización de la pieza (incluye `npm run build` en
   verde, que solo corre al cerrar la pieza) y que todas las tareas de `tasks.md`
   estén marcadas.

Veredicto con tu formato de informe: **¿la spec está cumplida?**
