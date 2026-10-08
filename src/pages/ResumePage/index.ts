// Re-export del módulo ResumePage (plan → Archivos). La app (AppLayout en F4)
// importa desde acá: la superficie pública es la API de la spec
// (specs/pages/ResumePage/spec.md → API): ResumePage + ResumePageProps
// (criterio AboutPage/index.ts).
export { ResumePage } from "./ResumePage";
export type { ResumePageProps } from "./ResumePage";
