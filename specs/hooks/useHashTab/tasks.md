# Tareas — useHashTab

- [x] **T1. Hook con estado inicial por hash.** RF-1 — 7e0f45c (APROBADA: tests 1–3 literales, `parseHash` no exportado, setter mínimo sin comportamiento RF-2, spy de `replaceState` mide solo al hook; RF-6 inspección OK; 398/37 verdes)
  - Hecho cuando: `useHashTab.test.ts` cubre tests 1–3 de la spec (sin hash → `defaultId`; `#resume` antes de montar → `"resume"`; `#foo` → `defaultId` y spy de `replaceState` **no** llamado); `useHashTab.ts` existe con la firma de spec → API y `parseHash` de módulo no exportado; verde tras `feat(useHashTab): T1`.

- [ ] **T2. `setActiveId` con replaceState sin tocar el activo.** RF-2
  - Hecho cuando: tests 4, 5 y 9 de la spec: `setActiveId("resume")` → estado `"resume"` + `replaceState` con URL que termina en `#resume` (y `pushState` spy: nunca llamado); repetir el id activo → cero llamadas a `replaceState`; con `pathname`/`search` no vacíos el argumento URL conserva ambos (solo cambia el hash); verde tras `feat(useHashTab): T2`.

- [ ] **T3. `hashchange` y desmontaje con listener estable.** RF-3, RF-4
  - Hecho cuando: tests 6, 7 y 8 de la spec: `hashchange` con hash válido actualiza; con `#foo` mantiene el valor anterior; con spy de `addEventListener`/`removeEventListener` sobre `window`: al montar se registra `hashchange` y al desmontar se quita **el mismo handler** (misma referencia), y un `hashchange` disparado post-desmontaje no provoca actualizaciones; verde tras `feat(useHashTab): T3`. Cierre sin a11y (hook sin UI): la verificación de RF-6 (no router, no scroll/foco, lectura del hash solo al montar/handler) es inspección del reviewer sobre `useHashTab.ts`.
