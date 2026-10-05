// Re-exports del módulo BrandIcon (plan.md → Archivos; nota de cierre de
// pieza en tasks.md → T4). La app importa desde acá. La superficie pública es
// la API de la spec (specs/primitives/BrandIcon/spec.md): BrandIcon,
// BRAND_NAMES y el tipo BrandIconProps. `BrandPath` queda dentro del módulo
// (es la forma interna de paths.ts, no la API; mismo criterio que el índice
// de Icon, que no exporta detalles de sus datos).
export { BRAND_NAMES, BrandIcon } from "./BrandIcon";
export type { BrandIconProps } from "./BrandIcon";
