// Re-export del módulo AppLayout (plan → Archivos). La app (`main.tsx`/`App`
// en T6) importa desde acá: la superficie pública es la API de la spec
// (specs/layout/AppLayout/spec.md → API): AppLayout + AppLayoutProps
// (criterio AboutPage/ResumePage; `TAB_IDS`/`isTabId`/`focusPanel` son
// internos del módulo — la spec no los exporta).
export { AppLayout } from "./AppLayout";
export type { AppLayoutProps } from "./AppLayout";
