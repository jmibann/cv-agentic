// Re-exports de la pieza Sidebar (plan.md → Archivos; nota de T1 y cierre de
// pieza en tasks.md → T6). La superficie pública es la API de la spec
// (specs/layout/Sidebar/spec.md → API): `Sidebar` + los tipos `SidebarProps`
// y `SidebarLabels`, y la función pura `getContactHref` — re-exportada para
// poder usarla/testearla desde otros consumidores (decisión 11 del plan).
export { getContactHref } from "./getContactHref";
export { Sidebar } from "./Sidebar";
export type { SidebarLabels, SidebarProps } from "./Sidebar";
