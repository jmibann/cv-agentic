// Overhead — etiqueta pequeña en mayúsculas que precede a un valor
// (specs/primitives/Overhead/spec.md). T1: render base (RF-1): raíz `<span>`
// con la clase del módulo (única declaración por ahora:
// `text-transform: uppercase`) y el `children` tal cual, sin transformar el
// string: las mayúsculas las pone CSS y el DOM conserva la capitalización
// normal (spec → Accesibilidad).
// Pendientes de su tarea: `as="dt"` y unión de `className` (T2); elipsis,
// `--color-text-muted`, `--font-size-overhead`, peso regular, `display: block`
// y cierre `expectNoA11yViolations` (T3).

import type { ReactNode } from "react";

import styles from "./Overhead.module.css";

// Elementos válidos para `as` (spec → API): span por defecto; `dt` cuando va
// en una <dl> (RF-2: la validez del contexto es del consumidor). El tipo de la
// API está completo desde T1; el manejo de `as` y de `className` se conectan
// en T2 (sus tests están en rojo hasta entonces).
type OverheadElement = "span" | "dt";

// API (spec → API): `children: ReactNode`; `as` default "span"; `className` se
// une a la clase base del elemento raíz.
export interface OverheadProps {
  children: ReactNode;
  as?: OverheadElement;
  /** Se une a la clase base del elemento raíz (unión aplicada en T2). */
  className?: string;
}

export function Overhead({ children }: OverheadProps) {
  // RF-1: el texto se renderiza tal cual (sin `toUpperCase()` en JS); la
  // transformación a mayúsculas es solo visual, vía `text-transform` del
  // módulo. Sin roles añadidos (RF-6). `as` y la unión de `className` llegan
  // en T2; en T1 el raíz es `<span>` con la clase base aplicada.
  return <span className={styles.overhead}>{children}</span>;
}
