// Re-exports del módulo ControlsBar (plan.md → Archivos; tasks.md → T2
// "index.ts re-exporta ControlsBar (y tipos si los hubiera)"). La app importa
// desde acá (AppLayout, F4). La superficie pública es la API de la spec
// (specs/controls/ControlsBar/spec.md → API): ControlsBar y el tipo
// ControlsBarProps — nada más se exporta (criterio Badge/Icon/ThemeToggle/
// LanguageSwitcher: solo lo que fija el bloque API; los imports internos del
// módulo —useLocale, ThemeToggle, LanguageSwitcher— no se reexportan).
export { ControlsBar } from "./ControlsBar";
export type { ControlsBarProps } from "./ControlsBar";
