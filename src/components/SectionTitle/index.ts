// Re-exports del módulo SectionTitle (plan.md → Archivos; nota de cierre de
// pieza en tasks.md → T5). La app importa desde acá. La superficie pública es
// la API de la spec (specs/primitives/SectionTitle/spec.md → API): SectionTitle
// y el tipo SectionTitleProps (criterio IconBox; no hay alias internos que
// excluir: la spec no exporta otros nombres).
export { SectionTitle } from "./SectionTitle";
export type { SectionTitleProps } from "./SectionTitle";
