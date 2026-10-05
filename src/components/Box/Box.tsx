// Box — superficie base del diseño (specs/primitives/Box/spec.md). T1: render
// base (RF-1, RF-3): raíz `div` por defecto con la clase `outer` y
// render de `children`; `as` cambia el elemento. La elección de clase por
// `variant` (`inner`), los atributos `id`/ARIA y la unión de `className`
// llegan en T2/T3; los estilos por tokens y `overflow`, en T4.

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

export function Box({ as, children }: BoxProps) {
  // RF-1: sin `variant` rige `outer` (default). En T1 aún no se elige la
  // clase por `variant` (la variante `inner` es T2), así que la clase fija
  // es siempre `outer`.
  const El = as ?? "div";

  // La clase del módulo va tal cual (string | undefined bajo
  // noUncheckedIndexedAccess; React admite className undefined). El join con
  // la `className` del consumidor es T3.
  return <El className={styles.outer}>{children}</El>;
}
