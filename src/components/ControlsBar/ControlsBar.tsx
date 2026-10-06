// ControlsBar — barra de controles de visualización (ThemeToggle +
// LanguageSwitcher) arriba de las cards (specs/controls/ControlsBar/spec.md).
// T1 hecha: banner `<header>` (RF-2: landmark por semántica nativa, SIN
// `aria-label` propio — los nombres van al group; la unicidad de página y el
// orden tras el skip link (RF-4) son invariantes de AppLayout, plan →
// Decisiones) con un `div role="group" aria-label={t.controls.label}` que
// compone ambos controles pasándoles sus labels traducidos de
// `t.controls` (RF-3: al cambiar el idioma del provider, los hijos renuevan
// sus nombres — la traducción vive en ui.{en,es}.ts, C3) y la `className`
// del consumidor UNIDA a la clase base del raíz (G-B, API de la spec).
// T2 diferida: estilos por tokens del módulo (RF-1 flex-end/--size-control/
// --z-controls, RF-5 cero texto propio, RF-6 gap por --controls-gap sin
// @media) e `index.ts` (tasks.md).
// C2 (excepción documentada, specs/README.md → reglas comunes + plan →
// Decisiones): ControlsBar sí consume `useLocale()` — es la fuente de los
// labels que pasa a sus hijos; en T1 usa solo `.t` (el idioma activo del
// LanguageSwitcher lo lee el propio control del provider, no una prop).
// G-A: este componente NO lee ni escribe `localStorage` ni toca
// `document.documentElement`: aplicar el idioma es del LocaleProvider.

import { useLocale } from "../../providers/LocaleProvider";

import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle";

import styles from "./ControlsBar.module.css";

// API (spec → API): sin hijos ni props obligatorias; la `className` va al
// `<header>` raíz (G-B). No se agregan props "por si acaso".
export interface ControlsBarProps {
  /** Se une a la clase base del `<header>` raíz (G-B). */
  className?: string;
}

export function ControlsBar({ className }: ControlsBarProps) {
  // RF-3: `t` del LocaleProvider REAL — el objeto cambia de idioma con el
  // provider y los labels fluyen a los hijos en cada render (nada
  // hardcodeado, C3; la lectura de useLocale() es la excepción C2 del plan).
  const { t } = useLocale();

  // T1 (G-B, unión canónica #99): la clase base va primera y se le UNE la
  // externa (no la reemplaza). Mismo mecanismo aprobado en
  // Box/Icon/BrandIcon/Badge/IconBox/ThemeToggle/LanguageSwitcher: array +
  // filtro de undefined + join, sin librerías; así no queda una clase vacía
  // cuando `className` no se pasa. `styles.controlsBar` es
  // `string | undefined` bajo noUncheckedIndexedAccess.
  const rootClassName = [styles.controlsBar, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // spec → Anatomía, literal: <header> > div role="group" > ThemeToggle +
  // LanguageSwitcher. El group se nombra con t.controls.label; ThemeToggle
  // recibe AMBOS labels (darkModeLabel/lightModeLabel — clave
  // controls.lightMode de Foundation T12) y LanguageSwitcher su label de
  // grupo. Los `<div>` intermedios innecesarios no existen: la barra es el
  // propio <header> (RF-1 lo define en T2: justify-content: flex-end sobre
  // el único hijo del flujo, el group).
  return (
    <header className={rootClassName}>
      <div role="group" aria-label={t.controls.label}>
        <ThemeToggle
          darkModeLabel={t.controls.darkMode}
          lightModeLabel={t.controls.lightMode}
        />
        <LanguageSwitcher label={t.controls.language} />
      </div>
    </header>
  );
}
