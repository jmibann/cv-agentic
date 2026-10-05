// Box — superficie base del diseño (specs/primitives/Box/spec.md). T1: render
// base (RF-1, RF-3): raíz `div` por defecto y render de `children`; `as`
// cambia el elemento. T2: la clase se elige por `variant` (`inner`/`outer`,
// RF-1/RF-2) y `id`/`aria-label`/`aria-labelledby` llegan al raíz (RF-3). T3:
// la `className` del consumidor se UNE a la clase de variante en el único
// elemento (RF-3). Falta: los estilos por tokens con `overflow` (T4).

import type { ReactNode } from "react";

import styles from "./Box.module.css";

// Elementos válidos para `as` (spec → API): div por defecto.
type BoxElement = "div" | "section" | "article" | "aside" | "header";

// API cerrada (RF-3/RF-4): solo estos atributos llegan al elemento; sin
// pass-through de `role`, `tabIndex` ni `...rest`.
export interface BoxProps {
  variant?: "outer" | "inner";
  as?: BoxElement;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export function Box({
  as,
  variant,
  children,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: BoxProps) {
  // RF-1/RF-2: sin `variant` rige `outer` (default); con `variant="inner"`
  // se aplica SOLO `inner` (una única clase de variante, nunca ambas).
  const variantClass = variant === "inner" ? styles.inner : styles.outer;

  // RF-3 / T3 (spec → API): la `className` del consumidor se UNE a la clase
  // de variante sobre el único elemento raíz (no la reemplaza). Mismo
  // mecanismo que Icon/BrandIcon (plan.md): array + filtro de undefined +
  // join, sin librerías; así no quedan clases vacías cuando `className` no
  // se pasa. Las clases del módulo son `string | undefined` bajo
  // noUncheckedIndexedAccess. El orden en el atributo `class` no resuelve
  // conflictos de especificidad (spec → API: rige la hoja de estilos); se
  // mantiene la variante primero por precedente de Icon/BrandIcon.
  const rootClassName = [variantClass, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  const El = as ?? "div";

  // RF-3: al elemento solo le llegan `children`, `id`, `aria-label`,
  // `aria-labelledby` y `className` (API cerrada, RF-4: sin `role`,
  // `tabIndex` ni `...rest`).
  return (
    <El
      className={rootClassName}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </El>
  );
}
