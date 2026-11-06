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
// T3 hecha (RF-6, Cambio F5): el `<header>` raíz agrega el hook
// `data-print-hide` del contrato de impresión (comentario en el return;
// único cambio de markup — ningún atributo/estructura/estilo previo toca).
// T2 hecha: el módulo fija los estilos por tokens de la tabla (RF-1
// flex-end/--size-control/--z-controls, RF-5 cero texto propio, RF-6 gap por
// --controls-gap sin @media) e `index.ts` re-exporta el componente y su tipo
// (tasks.md). El tsx NO cambia en T2: su marcado de T1 ya deja el group como
// único hijo del flujo y la posición vertical/ancho las define AppLayout.
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

  // T3 (RF-6, Cambio F5 2026-10-08, hallazgo B-2 de `docs/qa-report.md`,
  // decisión #104): el raíz `<header>` renderiza el hook `data-print-hide`
  // del contrato de impresión. `global.css` lo oculta en print con la
  // variante compuesta `header[data-print-hide]` (0,1,1), que gana por
  // especificidad a la clase hasheada del módulo (0,1,0) — el selector
  // nativo `header` (0,0,1) solo perdía (B-2). La pieza NO declara
  // `@media print` (spec → "No hacer"; lo ocultan los estilos
  // compartidos). El atributo no es `aria-*`: estructura, roles y estilos
  // del marcado de T1/T2 quedan intactos (precedente hermana CornerTab T5).
  // spec → Anatomía, literal: <header> > div role="group" > ThemeToggle +
  // LanguageSwitcher. El group se nombra con t.controls.label; ThemeToggle
  // recibe AMBOS labels (darkModeLabel/lightModeLabel — clave
  // controls.lightMode de Foundation T12) y LanguageSwitcher su label de
  // grupo. Los `<div>` intermedios innecesarios no existen: la barra es el
  // propio <header> (RF-1 lo define en T2: justify-content: flex-end sobre
  // el único hijo del flujo, el group).
  return (
    <header className={rootClassName} data-print-hide>
      {/* T4 (bug-fix de alineación, RF-1/RF-6): el group interno es el
          contenedor flex real — flex + align-items: center + gap por token
          viven en `styles.group`. Sin layout propio, sus hijos `inline-flex`
          (ThemeToggle y LanguageSwitcher) se alineaban por baseline y el gap
          del header era inerte (único hijo flex). Rol y nombre intactos. */}
      <div role="group" aria-label={t.controls.label} className={styles.group}>
        <ThemeToggle
          darkModeLabel={t.controls.darkMode}
          lightModeLabel={t.controls.lightMode}
        />
        <LanguageSwitcher label={t.controls.language} />
      </div>
    </header>
  );
}
