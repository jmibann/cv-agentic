// Re-exports del módulo CornerTab (plan.md → Archivos; nota de cierre de pieza
// en tasks.md → T4). La app importa desde acá. La superficie pública es la API
// de la spec (specs/primitives/CornerTab/spec.md → API): CornerTab y el tipo
// CornerTabProps (criterio de la fase: Separator/Box; no hay alias internos
// que excluir: la spec no exporta otros nombres).
export { CornerTab } from "./CornerTab";
export type { CornerTabProps } from "./CornerTab";
