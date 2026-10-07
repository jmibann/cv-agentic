// Re-exports del módulo Timeline (plan.md → Archivos). La app importa desde
// acá. La superficie pública es la API de la spec
// (specs/content/Timeline/spec.md → API): Timeline y el tipo TimelineProps
// (criterio SectionTitle/IconBox; no hay alias internos que excluir: la spec
// no exporta otros nombres).
export { Timeline } from "./Timeline";
export type { TimelineProps } from "./Timeline";
