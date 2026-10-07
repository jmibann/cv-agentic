// Re-exports del módulo SkillList (plan.md → Archivos). La app importa desde
// acá. La superficie pública es la API de la spec
// (specs/content/SkillList/spec.md → API): SkillList y el tipo SkillListProps.
// `SkillListName` queda DENTRO del módulo: el bloque de la API de la spec lo
// declara como `type` sin `export` (es el union del nombre accesible que
// compone SkillListProps), mismo criterio de exclusión que BadgeElement en
// Badge y BoxElement en Box. No hay otros nombres que exportar.
export { SkillList } from "./SkillList";
export type { SkillListProps } from "./SkillList";
