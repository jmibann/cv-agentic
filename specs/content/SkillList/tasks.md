# Tareas — SkillList

- [ ] **T1. Lista nombrada de chips con Badge.** RF-1, RF-2, RF-3
  - Hecho cuando: con `label`, `getByRole("list", { name: label })`; con `labelledBy` (armazón `<h2 id>`), el nombre sale del heading; un `listitem` por skill en orden, cada uno con la clase base de Badge (`#99`) y **sin** `className` extra de SkillList (inspección: `.chip` ilustrativo); `skills=[]` → `container` vacío; los dos casos `// @ts-expect-error` (ambos props / ninguno) typecheckean como esperado; verde tras `feat(SkillList): T1`.

- [ ] **T2. Estilos, keys duplicadas y cierre a11y.** RF-5, RF-6 (+RF-4 inspección de uso)
  - Hecho cuando: el módulo declara `display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; margin: 0; padding: 0;` y cero `@media` (inspección); con skills duplicadas el render no emite warning de React (spy `console.error`) y las keys índice+valor quedan documentadas en el código; `className` externa coexiste con la base del `<ul>` (test); el archivo termina con `expectNoA11yViolations`; `index.ts` re-exporta `SkillList` y tipos; lint + typecheck + test verdes tras `feat(SkillList): T2`.
