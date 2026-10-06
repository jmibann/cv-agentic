// Overhead — etiqueta pequeña en mayúsculas que precede a un valor
// (specs/primitives/Overhead/spec.md). T1: render base (RF-1): raíz con la
// clase del módulo (única declaración por ahora: `text-transform: uppercase`)
// y el `children` tal cual, sin transformar el string: las mayúsculas las pone
// CSS y el DOM conserva la capitalización normal (spec → Accesibilidad).
// T2 hecha: `as="dt"` renderiza `<dt>` (RF-2) y la `className` del consumidor
// se UNE a la clase base del raíz. Pendientes de su tarea: elipsis,
// `--color-text-muted`, `--font-size-overhead`, peso regular, `display: block`
// y cierre `expectNoA11yViolations` (T3).

import type { ReactNode } from "react";

import styles from "./Overhead.module.css";

// Elementos válidos para `as` (spec → API): span por defecto; `dt` cuando va
// en una <dl> (RF-2: la validez del contexto es del consumidor).
type OverheadElement = "span" | "dt";

// API (spec → API): `children: ReactNode`; `as` default "span"; `className` se
// une a la clase base del elemento raíz.
export interface OverheadProps {
  children: ReactNode;
  as?: OverheadElement;
  /** Se une a la clase base del elemento raíz (unión aplicada en T2). */
  className?: string;
}

export function Overhead({ as, children, className }: OverheadProps) {
  // RF-1: el texto se renderiza tal cual (sin `toUpperCase()` en JS); la
  // transformación a mayúsculas es solo visual, vía `text-transform` del
  // módulo. Sin roles añadidos (RF-6).
  // RF-2 (T2): default `span`; `as` cambia el elemento raíz a `<dt>` cuando
  // va en una <dl>. Mismo patrón que Box/Badge (`const El = as ?? "span"`).
  const El = as ?? "span";

  // T2 (spec → API, P3 del kit): la `className` del consumidor se UNE a la
  // clase base sobre el único elemento raíz (no la reemplaza). Mismo mecanismo
  // aprobado en Box/Icon/BrandIcon/Badge: array + filtro de undefined + join,
  // sin librerías; así no quedan clases vacías cuando `className` no se pasa.
  // Las clases del módulo son `string | undefined` bajo noUncheckedIndexedAccess.
  // Base primero (precedente). Aplica a ambos `as`: la spec define un único
  // raíz.
  const rootClassName = [styles.overhead, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return <El className={rootClassName}>{children}</El>;
}
