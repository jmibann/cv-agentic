// Re-exports del módulo TestimonialDialog (plan.md → Archivos). La app importa
// desde acá. La superficie pública es la API de la spec
// (specs/content/TestimonialDialog/spec.md → API): TestimonialDialog y el tipo
// TestimonialDialogProps. No hay otros nombres que exportar: el id del título
// `testimonial-dialog-title` (Anatomía literal) es interno del componente y
// `Testimonial` se re-exporta desde @data/cv.types.generated, no desde acá.
export { TestimonialDialog } from "./TestimonialDialog";
export type { TestimonialDialogProps } from "./TestimonialDialog";
