// Re-exports del módulo LanguageSwitcher (plan.md → Archivos; tasks.md → T3
// "index.ts re-exporta LanguageSwitcher y tipos"). La app importa desde acá
// (ControlsBar). La superficie pública es la API de la spec
// (specs/controls/LanguageSwitcher/spec.md → API): LanguageSwitcher y el tipo
// LanguageSwitcherProps — nada más se exporta (criterio Badge/Icon/ThemeToggle:
// solo lo que fija el bloque API; los imports internos del módulo —useLocale,
// LOCALES, el mapa LOCAL de nombres fijos— no se reexportan).
export { LanguageSwitcher } from "./LanguageSwitcher";
export type { LanguageSwitcherProps } from "./LanguageSwitcher";
