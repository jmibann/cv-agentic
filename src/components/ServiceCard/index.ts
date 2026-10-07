// Re-exports del módulo ServiceCard (plan.md → Archivos). La app importa desde
// acá. La superficie pública es la API de la spec
// (specs/content/ServiceCard/spec.md → API): ServiceCard y el tipo
// ServiceCardProps. No hay otros nombres que exportar: el id derivado
// `service-${service.id}-title` (RF-3) es interno del componente y `Service`
// se re-exporta desde @data/cv.types.generated, no desde acá.
export { ServiceCard } from "./ServiceCard";
export type { ServiceCardProps } from "./ServiceCard";
