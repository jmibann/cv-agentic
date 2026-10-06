// Re-exports del módulo Badge (plan.md → Archivos; nota de cierre de pieza en
// tasks.md → T3). La app importa desde acá. La superficie pública es la API de
// la spec (specs/primitives/Badge/spec.md → API): Badge y el tipo BadgeProps.
// `BadgeElement` queda dentro del módulo: es el alias del dominio de `as` que
// usa BadgeProps, pero el bloque de la API de la spec no lo exporta (mismo
// criterio que el índice de Box con BoxElement y BrandIcon).
export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";
