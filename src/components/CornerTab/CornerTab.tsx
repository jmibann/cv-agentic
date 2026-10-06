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
// T2 agrega las variantes `size` (RF-2): `.md`/`.sm` del módulo, default `md`
// (spec → API), unidas a la base en el orden canon de la fase (base →
// variante → externa). Diferidos según tasks.md: `placement="float"` y su
// único `@media (min-width: 992px)` (T3), fondo `surface-raised`, bordes
// obligatorios, radio asimétrico, layout interno, ausencia de sombra y cierre
// `expectNoA11yViolations` + `index.ts` (T4).

import type { ReactNode } from "react";

import styles from "./CornerTab.module.css";

// API (spec → API), completa desde T1. `placement` sigue **tipada sin
// comportamiento** hasta T3 (no se destruye acá para no crear variables
// muertas; precedente Separator T1, que tampoco destruía sus diferidas; la
// firma recibirá el parámetro al conectarse). `size` se conecta en T2
// (variante .md/.sm, default "md"). `children` y `className` se conectaron
// en T1 ("Hecho cuando" y nota de tasks.md).
export interface CornerTabProps {
  children: ReactNode;
  /** "md": altura de nav (--size-nav-tab-height). "sm": compacta (Show
   * Contacts). Default "md". */
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

export function CornerTab({ children, className, size = "md" }: CornerTabProps) {
  // RF-1 (T1): la clase base `cornerTab` del módulo fija la posición de
  // overlay (absolute/top/right/`--z-raised`); rige hoy para todo placement y
  // en T3 `.float` la sobrescribe ≥ 992px (inspección del CSS; jsdom no la
  // computa). `placement` (T3) aún no destruye: sin comportamiento.
  // T2 (RF-2): `size` aplica su variante del módulo —mapa trivial como Box
  // (cada variante tiene su clase y SIEMPRE se aplica una: `sm` y `md` son
  // clases distintas; spec → "Tests esperados")—. Default `"md"` por
  // destructuración (spec → API: "Default \"md\""). Las alturas/padding de
  // cada clase (filas `size` de la tabla de la spec) se verifican por
  // inspección del CSS: jsdom no carga hojas de estilos.
  const sizeClass = size === "sm" ? styles.sm : styles.md;

  // T1 (spec → API, P2): la `className` del consumidor se UNE a la clase base
  // sobre el único elemento raíz (no la reemplaza). Mismo mecanismo aprobado
  // en Box/Icon/BrandIcon/Badge/IconBox/Overhead/Separator: array + filtro de
  // undefined + join, sin librerías; así no quedan clases vacías cuando
  // `className` no se pasa. Orden canon de la fase (Button T5/T6): base →
  // variante (`size`; `placement` se insertará acá en T3) → className
  // externa. Las clases del módulo son `string | undefined` bajo
  // noUncheckedIndexedAccess.
  const rootClassName = [styles.cornerTab, sizeClass, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-6 (T1): el raíz es un `<div>` sin `role` ni ningún `aria-*` (spec →
  // Accesibilidad: "Sin rol propio (es un contenedor visual). No debe tener
  // `aria-*`"): los nombres y estados los aportan los children (NavTabs,
  // botón Show Contacts).
  return <div className={rootClassName}>{children}</div>;
}
