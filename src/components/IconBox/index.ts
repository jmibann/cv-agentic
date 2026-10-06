// Re-exports del módulo IconBox (plan.md → Archivos; nota de cierre de pieza
// en tasks.md → T3). La app importa desde acá. La superficie pública es la API
// de la spec (specs/primitives/IconBox/spec.md → API): IconBox y el tipo
// IconBoxProps. No hay alias internos que excluir: la API de la spec solo
// define esos dos nombres (criterio Badge/Box, que sí ocultan su alias de
// `as`).
export { IconBox } from "./IconBox";
export type { IconBoxProps } from "./IconBox";
