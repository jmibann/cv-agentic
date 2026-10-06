// Re-exports del módulo ThemeToggle (plan.md → Archivos; tasks.md → T3 "index.ts
// re-exporta ThemeToggle y tipos"). La app importa desde acá (ControlsBar). La
// superficie pública es la API de la spec (specs/controls/ThemeToggle/spec.md →
// API): ThemeToggle y el tipo ThemeToggleProps — nada más se exporta (criterio
// Badge/Icon: solo lo que fija el bloque API; los imports internos del módulo
// —useTheme, Icon— no se reexportan).
export { ThemeToggle } from "./ThemeToggle";
export type { ThemeToggleProps } from "./ThemeToggle";
