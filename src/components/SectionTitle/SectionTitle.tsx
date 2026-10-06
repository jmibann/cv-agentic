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
// T4 hecha: `icon` monta un `IconBox` como PRIMER hijo del heading (antes del
// texto, en orden de DOM; RF-3: decorativo por su `aria-hidden`, no altera el
// nombre accesible) y une la clase `.withIcon` —el flex va en el propio
// heading, sin wrapper (spec → "with icon")—. `decorated` + `icon` es
// combinación válida: ambas clases coexisten (spec → "decorated + icon").
// Diferidos según tasks.md: unión de `className` y márgenes RF-5 (T5).

import type { ReactNode } from "react";

import { IconBox } from "../IconBox";
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
  /** IconBox a la izquierda (RF-3; T4: primer hijo del heading, sin wrapper). */
  icon?: IconName;
  /** Para `aria-labelledby` de la sección (RF-4). */
  id?: string;
  /** Se une a la clase base del heading (el elemento raíz; sin wrapper)
   * (comportamiento en T5). */
  className?: string;
}

export function SectionTitle({
  as,
  children,
  id,
  decorated,
  icon,
}: SectionTitleProps) {
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
  // T4 (RF-3, spec → Estilos y tokens "with icon"): con `icon` se UNE además
  // `.withIcon` (el flex en el propio heading). `decorated` + `icon` es
  // combinación válida (spec → "decorated + icon"): ambas clases coexisten
  // sobre el mismo heading, no se excluyen.
  const El = as;

  const rootClassName = [
    styles[as],
    decorated ? styles.decorated : undefined,
    icon ? styles.withIcon : undefined,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // T4 (RF-3; spec → "with icon": "IconBox a la izquierda; texto a
  // continuación"): el IconBox es el PRIMER hijo del heading, antes del
  // children, en orden de DOM; sin wrapper (el heading es el único elemento
  // raíz y el que lleva el flex, spec → Anatomía/plan → Interfaz). Su raíz es
  // `aria-hidden` (IconBox RF-2), así que el nombre accesible del heading es
  // solo el texto (spec → Accesibilidad). Sin `icon` no se monta nada.
  return (
    <El id={id} className={rootClassName}>
      {icon ? <IconBox icon={icon} /> : null}
      {children}
    </El>
  );
}
