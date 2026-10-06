// ThemeToggle — botón de alternancia de tema claro/oscuro
// (specs/controls/ThemeToggle/spec.md). T1 hecha: render conectado a
// `useTheme()` (RF-1, RF-2, RF-3, RF-6): un único <button type="button"> con
// `aria-pressed` reflejando el tema, `aria-label` que nombra el modo al que se
// va, ícono decorativo (luna en claro, sol en oscuro), `onClick` →
// `toggleTheme()` y la `className` del consumidor UNIDA a la clase base del
// raíz (G-B). Pendientes: T2 teclado nativo (RF-4), T3 estilos por tokens del
// módulo (focus-visible, tamaño --size-control; RF-4/RF-5), `index.ts` y el
// cierre a11y de los tests.
// G-A / D3 (spec → No hacer): este componente NO lee ni escribe `localStorage`
// ni toca `document.documentElement`/`data-theme`: la aplicación y la
// persistencia (try/catch, clave cv:theme) son del ThemeProvider.

import { useTheme } from "../../providers/ThemeProvider";

import { Icon } from "../Icon";

import styles from "./ThemeToggle.module.css";

// API (spec → API): los labels llegan traducidos por props (C3: nada
// hardcodeado; ControlsBar los pasa desde useLocale().t). La lectura de
// `useTheme()` acá es la excepción documentada a "props en, eventos fuera"
// (RF-6; specs/README.md → excepciones de C2).
export interface ThemeToggleProps {
  /** aria-label en tema claro: nombra el modo al que se va. Ej: "Dark mode" / "Modo oscuro". */
  darkModeLabel: string;
  /** aria-label en tema oscuro: nombra el modo al que se va. Ej: "Light mode" / "Modo claro". */
  lightModeLabel: string;
  /** Se une a la clase base del `<button>` raíz (G-B). */
  className?: string;
}

export function ThemeToggle({
  darkModeLabel,
  lightModeLabel,
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  // RF-3 (spec → API): el label activo nombra el MODO AL QUE SE VA, nunca una
  // acción: en claro → darkModeLabel, en oscuro → lightModeLabel. El estado
  // lo comunica aria-pressed (RF-2), no el label ("No hacer").
  const label = theme === "light" ? darkModeLabel : lightModeLabel;

  // T1 (G-B, unión canónica #99): la clase base va primera y se le UNE la
  // externa (no la reemplaza). Mismo mecanismo aprobado en
  // Box/Icon/BrandIcon/Badge/IconBox: array + filtro de undefined + join, sin
  // librerías; así no queda una clase vacía cuando `className` no se pasa.
  // `styles.themeToggle` es `string | undefined` bajo noUncheckedIndexedAccess.
  const rootClassName = [styles.themeToggle, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-1/RF-6: el click SOLO invoca toggleTheme() del contexto.
  // RF-2: aria-pressed = tema oscuro activo (false en claro, true en oscuro).
  // RF-3: ícono decorativo — Icon sin `label` (aria-hidden y focusable="false"
  // los fija el propio Icon): luna en claro (ir a oscuro), sol en oscuro (ir a
  // claro). tone default "current": hereda el color del botón (spec → Estilos).
  return (
    <button
      type="button"
      className={rootClassName}
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "dark"}
    >
      <Icon name={theme === "light" ? "moon" : "sun"} />
    </button>
  );
}
