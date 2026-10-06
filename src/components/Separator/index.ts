// Re-exports del módulo Separator (plan.md → Archivos; nota de cierre de pieza
// en tasks.md → T3). La app importa desde acá. La superficie pública es la API
// de la spec (specs/primitives/Separator/spec.md → API): Separator y el tipo
// SeparatorProps (criterio de la fase: IconBox/SectionTitle/Overhead; no hay
// alias internos que excluir: la spec no exporta otros nombres).
export { Separator } from "./Separator";
export type { SeparatorProps } from "./Separator";
