// Re-exports del módulo ResumeSection (plan.md → Archivos). La app importa
// desde acá. La superficie pública es la API de la spec
// (specs/content/ResumeSection/spec.md → API): ResumeSection y el tipo
// ResumeSectionProps (criterio Timeline/SectionTitle/IconBox; no hay alias
// internos que excluir: la spec no exporta otros nombres).
export { ResumeSection } from "./ResumeSection";
export type { ResumeSectionProps } from "./ResumeSection";
