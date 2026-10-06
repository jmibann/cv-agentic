// Re-exports del módulo Button (plan.md → Archivos; nota de cierre de pieza
// en tasks.md → T6; gap de índice detectado en el review de Icon T1). La app
// importa desde acá. La superficie pública es la API de la spec
// (specs/primitives/Button/spec.md → API): Button y el tipo ButtonProps.
// `CommonProps` queda dentro del módulo: la spec la muestra en el bloque de
// la API sin `export` y el tipo público es la unión ButtonProps (mismo
// criterio que Box con BoxElement y que BrandIcon/Icon, que no exportan
// detalles internos).
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
