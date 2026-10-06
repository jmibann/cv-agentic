// SectionTitle — títulos de página y de sección (specs/primitives/SectionTitle/
// spec.md). T1: heading raíz `h1`/`h2`/`h3` según `as` (RF-1), **sin wrapper**
// (spec → Anatomía/plan: el único elemento raíz es el propio heading), que
// renderiza el `children` y transmite `id` al heading para que la sección use
// `aria-labelledby` (RF-4).
// T2 hecha: el módulo `.h1/.h2/.h3` fija el `font-size` por tokens
// (--font-size-h1/2/3) y el heading raíz aplica la clase de su nivel (RF-1: el
// tamaño sigue al nivel, no a la tipografía global por etiqueta).
// T3 hecha: `decorated` une la clase `.decorated` del módulo a la clase base
// de nivel en el heading raíz (RF-2: la barra la dibuja su `::after` puro en
// CSS, sin contenido textual; el `margin-bottom` de RF-5 llega en T5).
// Diferidos según tasks.md: `icon` (IconBox en el heading, T4) y unión de
// `className` y márgenes RF-5 (T5).

import type { ReactNode } from "react";

// Solo el tipo para `icon` (API de la spec); el IconBox se monta en T4.
import type { IconName } from "../Icon";

import styles from "./SectionTitle.module.css";

// API (spec → API): `as` obligatorio (el nivel lo decide el contexto; RF-1:
// nunca se infiere del tamaño), `children`, `id` (RF-4). `decorated` conectado
// en T3 (RF-2: clase `.decorated` cuya barra `::after` es puro CSS; el
// `margin-bottom: var(--title-decorated-gap)` de RF-5 corresponde a T5), `icon`
// se conecta en T4 (IconBox a la izquierda en el propio heading, sin alterar
// el nombre accesible) y `className` en T5 (unión a la clase base del heading
// raíz).
export interface SectionTitleProps {
  as: "h1" | "h2" | "h3";
  children: ReactNode;
  /** Barra de gradiente debajo (RF-2; T3). */
  decorated?: boolean;
  /** IconBox a la izquierda (comportamiento en T4). */
  icon?: IconName;
  /** Para `aria-labelledby` de la sección (RF-4). */
  id?: string;
  /** Se une a la clase base del heading (el elemento raíz; sin wrapper)
   * (comportamiento en T5). */
  className?: string;
}

export function SectionTitle({ as, children, id, decorated }: SectionTitleProps) {
  // RF-1: el nivel viene de `as` sin conversión (mismo patrón `const El = as`
  // de Overhead; la unión es de intrinsic elements y React acepta cualquiera
  // como tag). RF-4: `id` va directo al heading; si no se pasa, React omite el
  // atributo. Sin wrapper alrededor del heading (spec → Anatomía/plan).
  // T2 (RF-1, spec → Estilos y tokens): la clase de tamaño es `styles[as]`, la
  // del nivel correspondiente del módulo (.h1/.h2/.h3 → --font-size-h1/2/3).
  // `as` es clave literal de la unión y las claves existen en el módulo, así
  // que no hacen falta casts; bajo `noUncheckedIndexedAccess` el tipo resulta
  // `string | undefined`.
  // T3 (RF-2, spec → Estilos y tokens "decorated"): con `decorated` se UNE la
  // clase `.decorated` del módulo a la base de nivel (la barra la pinta su
  // `::after` en CSS: sin nodos extra, sin alterar el nombre accesible).
  // Mismo mecanismo aprobado en Box/Icon/BrandIcon/Badge/Overhead/IconBox:
  // array + filtro de undefined + join, base primero; así no quedan clases
  // vacías. La unión de la `className` externa NO se conecta todavía (T5,
  // P2 completo).
  const El = as;

  const rootClassName = [
    styles[as],
    decorated ? styles.decorated : undefined,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <El id={id} className={rootClassName}>
      {children}
    </El>
  );
}
