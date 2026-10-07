// Re-exports del módulo NavTabs (plan.md → Archivos; nota de cierre de pieza
// en tasks.md → T4). La app importa desde acá (AppLayout, F4). La superficie
// pública es la API de la spec (specs/layout/NavTabs/spec.md → API): NavTabs,
// `getTabId` —la usa AppLayout para el `aria-labelledby` del tabpanel (spec →
// Anatomía)— y los tipos NavTabItem/NavTabsProps (criterio de la fase:
// CornerTab/Separator; no hay alias internos que excluir: la spec no exporta
// otros nombres).
export { getTabId, NavTabs } from "./NavTabs";
export type { NavTabItem, NavTabsProps } from "./NavTabs";
