// CornerTab — solapa de carpeta pegada a la esquina superior derecha de un
// `Box variant="outer"` (specs/primitives/CornerTab/spec.md). T1: render base
// overlay (RF-1, RF-6): un `<div>` que renderiza los `children` y aplica la
// clase base del módulo —la fila "Posición" de la spec (`position: absolute;
// top: 0; right: 0; z-index: var(--z-raised)`, verificada por inspección del
// CSS: jsdom no computa posición)— y la `className` externa unida a esa base
// (nota de T1 en tasks.md; spec → API, plan → Interfaz; P2: coexistencia
// base-primero, canon de la fase Badge/IconBox/Separator). RF-6: sin `role`
// ni ningún atributo `aria-*` en el raíz: es contenedor visual, los estados
// de hover/foco pertenecen a su contenido (tabs, botón); más fuerte que
// Separator, acá tampoco `aria-hidden` (la tab envuelve contenido accesible).
// Diferidos según tasks.md: variantes `size` sm/md (T2), `placement="float"`
// y su único `@media (min-width: 992px)` (T3), fondo `surface-raised`, bordes
// obligatorios, radio asimétrico, layout interno, ausencia de sombra y cierre
// `expectNoA11yViolations` + `index.ts` (T4).

import type { ReactNode } from "react";

import styles from "./CornerTab.module.css";

// API (spec → API), completa desde T1. `size` y `placement` quedan **tipadas
// sin comportamiento** hasta su tarea (T2/T3): no se destruyen acá para no
// crear variables muertas (precedente Separator T1, que tampoco destruía sus
// diferidas); la firma recibirá los parámetros al conectarse. `children` y
// `className` sí se conectan en T1 ("Hecho cuando" y nota de tasks.md).
export interface CornerTabProps {
  children: ReactNode;
  /** "md": altura de nav (--size-nav-tab-height). "sm": compacta (Show
   * Contacts). Default "md". (Comportamiento en T2.) */
  size?: "sm" | "md";
  /**
   * "overlay" (default): siempre posicionada en absoluto sobre la esquina.
   * "float": absoluta en < lg; en ≥ lg flota a la derecha (en el flujo).
   * Solo lo usa NavTabs. (Comportamiento en T3.)
   */
  placement?: "overlay" | "float";
  /** Se une a la clase base del `<div>` raíz. */
  className?: string;
}

export function CornerTab({ children, className }: CornerTabProps) {
  // RF-1 (T1): la clase base `cornerTab` del módulo fija la posición de
  // overlay (absolute/top/right/`--z-raised`); rige hoy para todo placement y
  // en T3 `.float` la sobrescribe ≥ 992px (inspección del CSS; jsdom no la
  // computa). `size`/`placement` (T2/T3) aún no destruyen: sin comportamiento.
  // T1 (spec → API, P2): la `className` del consumidor se UNE a la clase base
  // sobre el único elemento raíz (no la reemplaza). Mismo mecanismo aprobado
  // en Box/Icon/BrandIcon/Badge/IconBox/Overhead/Separator: array + filtro de
  // undefined + join, base primero, sin librerías; así no quedan clases vacías
  // cuando `className` no se pasa. Las clases del módulo son
  // `string | undefined` bajo noUncheckedIndexedAccess.
  const rootClassName = [styles.cornerTab, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-6 (T1): el raíz es un `<div>` sin `role` ni ningún `aria-*` (spec →
  // Accesibilidad: "Sin rol propio (es un contenedor visual). No debe tener
  // `aria-*`"): los nombres y estados los aportan los children (NavTabs,
  // botón Show Contacts).
  return <div className={rootClassName}>{children}</div>;
}
