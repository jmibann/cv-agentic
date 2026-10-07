// Re-exports del módulo TestimonialCard (plan.md → Archivos). La app importa
// desde acá. La superficie pública es la API de la spec
// (specs/content/TestimonialCard/spec.md → API): TestimonialCard y el tipo
// TestimonialCardProps. No hay otros nombres que exportar: el id derivado
// `testimonial-${testimonial.id}-name` (RF-7) es interno del componente y
// `Testimonial` se re-exporta desde @data/cv.types.generated, no desde acá.
export { TestimonialCard } from "./TestimonialCard";
export type { TestimonialCardProps } from "./TestimonialCard";
