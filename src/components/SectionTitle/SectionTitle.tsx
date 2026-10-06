// SectionTitle — títulos de página y de sección (specs/primitives/SectionTitle/
// spec.md). T1: heading raíz `h1`/`h2`/`h3` según `as` (RF-1), **sin wrapper**
// (spec → Anatomía/plan: el único elemento raíz es el propio heading), que
// renderiza el `children` y transmite `id` al heading para que la sección use
// `aria-labelledby` (RF-4).
// Diferidos según tasks.md: `decorated` (barra `::after`, T3), `icon` (IconBox
// en el heading, T4), unión de `className` y márgenes RF-5 (T5) y las clases
// de nivel del módulo `.h1/.h2/.h3` con su `font-size` por tokens (T2; el
// módulo CSS nace ahí, no hay nada que verificar todavía).

import type { ReactNode } from "react";

// Solo el tipo para `icon` (API de la spec); el IconBox se monta en T4.
import type { IconName } from "../Icon";

// API (spec → API): `as` obligatorio (el nivel lo decide el contexto; RF-1:
// nunca se infiere del tamaño), `children`, `id` (RF-4). `decorated`, `icon` y
// `className` quedan **declarados sin comportamiento en T1** (sin efecto en el
// render): `decorated` se conecta en T3 (barra `::after` +
// `margin-bottom: var(--title-decorated-gap)`), `icon` en T4 (IconBox a la
// izquierda en el propio heading, sin alterar el nombre accesible) y
// `className` en T5 (unión a la clase base del heading raíz).
export interface SectionTitleProps {
  as: "h1" | "h2" | "h3";
  children: ReactNode;
  /** Barra de gradiente debajo (comportamiento en T3). */
  decorated?: boolean;
  /** IconBox a la izquierda (comportamiento en T4). */
  icon?: IconName;
  /** Para `aria-labelledby` de la sección (RF-4). */
  id?: string;
  /** Se une a la clase base del heading (el elemento raíz; sin wrapper)
   * (comportamiento en T5). */
  className?: string;
}

export function SectionTitle({ as, children, id }: SectionTitleProps) {
  // RF-1: el nivel viene de `as` sin conversión (mismo patrón `const El = as`
  // de Overhead; la unión es de intrinsic elements y React acepta cualquiera
  // como tag). RF-4: `id` va directo al heading; si no se pasa, React omite el
  // atributo. Sin `className` ni estilos en T1: no hay módulo todavía (T2) y
  // no se agrega ningún wrapper alrededor del heading.
  const El = as;

  return <El id={id}>{children}</El>;
}
