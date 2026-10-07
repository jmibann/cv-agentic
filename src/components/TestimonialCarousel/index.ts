// Re-exports del módulo TestimonialCarousel (plan.md → Archivos). La app
// importa desde acá. La superficie pública es la API de la spec
// (specs/content/TestimonialCarousel/spec.md → API): TestimonialCarousel y los
// tipos TestimonialCarouselProps + TestimonialCarouselLabels. Las funciones
// puras del módulo (`getScrollStops`/`getActiveStop`, T1) NO se re-exportan
// (plan → Archivos: "quedan en archivo propio, sin re-export necesario": son
// internas de la pieza, testeadas aparte).
export { TestimonialCarousel } from "./TestimonialCarousel";
export type {
  TestimonialCarouselProps,
  TestimonialCarouselLabels,
} from "./TestimonialCarousel";
