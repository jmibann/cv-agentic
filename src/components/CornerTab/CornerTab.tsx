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
// variante → externa). T3 conecta `placement` (RF-3): default `"overlay"`
// (spec → API) no aplica clase float; `placement="float"` aplica `.float`,
// que solo pinta ≥ 992px (único `@media` del módulo; en < 992 la base sigue
// rigiendo — RF-3; contenido del media y ausencia de `@media print` (RF-4)
// por inspección: jsdom no lo computa, #101). T4 cierra la pieza: la forma
// (fondo `surface-raised`, bordes 1px obligatorios, radio asimétrico, layout
// interno flex, sin sombra — RF-5) vive en la clase base del módulo, el
// archivo de test termina con `expectNoA11yViolations` y `index.ts` re-exporta
// CornerTab y CornerTabProps (nota de cierre en tasks.md). El TSX no cambia:
// la forma es solo CSS y el markup ya era el de la spec desde T1 (RF-6).
// T5 (Cambio F5 2026-10-08, RF-7): el `<div>` raíz suma el hook de impresión
// `data-print-hide` (contrato #103/#104; hallazgo M-1: en print la tab debe
// desaparecer completa, no quedar como franja vacía con fondo/borde). Único
// cambio: el atributo en el raíz, en ambos `placement`; no es `aria-*`
// (RF-6 intacto) y el módulo sigue sin `@media print` propio (RF-4).

import type { ReactNode } from "react";

import styles from "./CornerTab.module.css";

// API (spec → API), completa desde T1. `placement` queda **tipada y conectada
// en T3** (default "overlay"; RF-3: `float` aplica su clase del módulo). No se
// destruyó antes de T3 para no crear variables muertas (precedente Separator
// T1, que tampoco destruía sus diferidas). `size` se conecta en T2 (variante
// .md/.sm, default "md"). `children` y `className` se conectaron en T1 ("Hecho
// cuando" y nota de tasks.md).
export interface CornerTabProps {
  children: ReactNode;
  /** "md": altura de nav (--size-nav-tab-height). "sm": compacta (Show
   * Contacts). Default "md". */
  size?: "sm" | "md";
  /**
   * "overlay" (default): siempre posicionada en absoluto sobre la esquina.
   * "float": absoluta en < lg; en ≥ lg flota a la derecha (en el flujo).
   * Solo lo usa NavTabs. (Comportamiento conectado en T3.)
   */
  placement?: "overlay" | "float";
  /** Se une a la clase base del `<div>` raíz. */
  className?: string;
}

export function CornerTab({
  children,
  className,
  placement = "overlay",
  size = "md",
}: CornerTabProps) {
  // RF-1 (T1): la clase base `cornerTab` del módulo fija la posición de
  // overlay (absolute/top/right/`--z-raised`). T3 (RF-3): para `float` la
  // base sigue rigiendo en < 992px ("SI el viewport es < 992px, ENTONCES
  // permanece absoluta") y `.float` la sobrescribe ≥ 992 dentro del único
  // @media del módulo (inspección del CSS; jsdom no computa posición ni
  // media queries — #101).
  // T2 (RF-2): `size` aplica su variante del módulo —mapa trivial como Box
  // (cada variante tiene su clase y SIEMPRE se aplica una: `sm` y `md` son
  // clases distintas; spec → "Tests esperados")—. Default `"md"` por
  // destructuración (spec → API: "Default \"md\""). Las alturas/padding de
  // cada clase (filas `size` de la tabla de la spec) se verifican por
  // inspección del CSS: jsdom no carga hojas de estilos.
  const sizeClass = size === "sm" ? styles.sm : styles.md;

  // T3 (RF-3): mapa `placement` → clase, mismo patrón que `size` (plan →
  // Funciones puras: "mapa placement/size → clases"). Default `"overlay"` por
  // destructuración (spec → API): NO aplica clase float; solo
  // `placement="float"` la aplica. Los demás valores devuelven `undefined`,
  // que el filtro de abajo descarta para que no queden clases vacías en el
  // join.
  const placementClass = placement === "float" ? styles.float : undefined;

  // T1 (spec → API, P2): la `className` del consumidor se UNE a la clase base
  // sobre el único elemento raíz (no la reemplaza). Mismo mecanismo aprobado
  // en Box/Icon/BrandIcon/Badge/IconBox/Overhead/Separator: array + filtro de
  // undefined + join, sin librerías; así no quedan clases vacías cuando
  // `className` no se pasa. Orden canon de la fase (Button T5/T6): base →
  // variante `size` → variante `placement` (T3) → className externa. Las
  // clases del módulo son `string | undefined` bajo
  // noUncheckedIndexedAccess.
  const rootClassName = [
    styles.cornerTab,
    sizeClass,
    placementClass,
    className,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-6 (T1): el raíz es un `<div>` sin `role` ni ningún `aria-*` (spec →
  // Accesibilidad: "Sin rol propio (es un contenedor visual). No debe tener
  // `aria-*`"): los nombres y estados los aportan los children (NavTabs,
  // botón Show Contacts).
  // RF-7 (T5, Cambio F5 2026-10-08; hallazgo M-1 de `docs/qa-report.md`): el
  // raíz renderiza el hook `data-print-hide` del contrato de impresión
  // (#103/#104), en ambos `placement`: `global.css` (AppLayout T7) oculta
  // `div[data-print-hide]` para que en impresión la tab desaparezca completa
  // (envoltorio con fondo/borde incluido) y no quede la franja vacía. No es
  // un atributo `aria-*`, así que RF-6 sigue vigente, y la pieza no declara
  // `@media print` propio (RF-4: manda el estilo compartido; plan →
  // Decisiones, resolución R-1). Misma forma que el skip link de AppLayout
  // (`data-print-hide` en JSX → atributo presente en el DOM).
  return (
    <div className={rootClassName} data-print-hide>
      {children}
    </div>
  );
}
