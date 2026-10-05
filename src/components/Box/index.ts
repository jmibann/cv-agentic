// Re-exports del módulo Box (plan.md → Archivos; nota de cierre de pieza en
// tasks.md → T4). La app importa desde acá. La superficie pública es la API de
// la spec (specs/primitives/Box/spec.md → API): Box y el tipo BoxProps.
// `BoxElement` queda dentro del módulo: la spec lo define como alias del
// dominio de `as` pero no lo exporta en el bloque de la API (mismo criterio
// que el índice de BrandIcon, que no exporta detalles internos).
export { Box } from "./Box";
export type { BoxProps } from "./Box";
