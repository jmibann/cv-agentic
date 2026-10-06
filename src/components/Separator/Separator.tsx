// Separator — línea horizontal de 1px que separa bloques dentro de un
// `Box variant="outer"`, full-bleed hasta los bordes de la card
// (specs/primitives/Separator/spec.md). T1: raíz decorativa (RF-1, RF-2): un
// `<div>` con `aria-hidden="true"`, sin `role` y sin `<hr>` (un `<hr>`
// anunciaría un cambio de tema del contenido; spec → Accesibilidad y
// "No hacer"). Sin hijos: es decoración pura (spec → Anatomía).
// T2 hecha: el módulo `Separator.module.css` nace con la línea 1px
// `--color-track`, el full-bleed calculado desde `--box-padding` (RF-3) y el
// `margin-block: var(--separator-gap)` en ambos lados (RF-4, RF-5) — valores
// por inspección del CSS (jsdom no los computa; spec → "Tests esperados") — y
// la `className` del consumidor se UNE a la clase base (`separator`) del raíz
// (P2). T3 hecha (cierre de pieza): el archivo de test cierra con
// `expectNoA11yViolations` (suelto y dentro de un `Box variant="outer"` de
// armazón) y el módulo se re-exporta desde `index.ts` (Separator + el tipo
// SeparatorProps; nota de tasks.md).

import styles from "./Separator.module.css";

// API (spec → API): `SeparatorProps { className?: string }`, tipada desde T1 y
// **conectada en T2**: su unión a la clase base del `<div>` raíz (plan →
// Interfaz; P2).
export interface SeparatorProps {
  /** Se une a la clase base del `<div>` raíz. */
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  // RF-1 (T1): el raíz es un `<div>` decorativo con `aria-hidden="true"` (la
  // línea de 1px la dibuja la clase base del módulo; grosor por inspección
  // del CSS, jsdom no lo computa).
  // RF-2 (T1, intacto en T2): sin `role="separator"` y sin `<hr>` (spec →
  // "No hacer"): el separador es decoración dentro del Box outer. Sin hijos.
  // T2 (spec → API, P2): la `className` del consumidor se UNE a la clase base
  // sobre el único elemento raíz (no la reemplaza). Mismo mecanismo aprobado
  // en Box/Icon/BrandIcon/Badge/IconBox/Overhead: array + filtro de undefined
  // + join, base primero, sin librerías; así no quedan clases vacías cuando
  // `className` no se pasa. Las clases del módulo son `string | undefined`
  // bajo noUncheckedIndexedAccess.
  const rootClassName = [styles.separator, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-3/RF-4/RF-5 (T2): full-bleed (`margin-inline` negativo + `width`
  // calculado desde `--box-padding`), alto 1px con `--color-track` y
  // `margin-block: var(--separator-gap)` en ambos lados viven en la clase
  // base del módulo (verificación por inspección; spec → Estilos y tokens y
  // Responsive: sin @media propios).
  return <div aria-hidden="true" className={rootClassName} />;
}
