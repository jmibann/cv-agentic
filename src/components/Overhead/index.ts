// Re-exports del módulo Overhead (plan.md → Archivos; nota de cierre de pieza
// en tasks.md → T3). La app importa desde acá. La superficie pública es la API
// de la spec (specs/primitives/Overhead/spec.md → API): Overhead y el tipo
// OverheadProps. `OverheadElement` queda dentro del módulo: es el alias del
// dominio de `as` que usa OverheadProps, pero el bloque de la API de la spec no
// lo exporta (mismo criterio que el índice de Box con BoxElement y Badge con
// BadgeElement).
export { Overhead } from "./Overhead";
export type { OverheadProps } from "./Overhead";
