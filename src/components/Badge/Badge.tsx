// Badge — etiqueta compacta sobre fondo tintado
// (specs/primitives/Badge/spec.md). T1: render base (RF-1, RF-2): el raíz es
// `<span>` por defecto y `<li>` con `as="li"`, con `children` como texto.
// T2 hecha: la `className` del consumidor se UNE a la clase base del raíz
// (RF-3) en Badge.module.css (`badge`). T3 hecha: esa clase base trae los
// estilos por tokens (RF-4, RF-5) y el módulo se re-exporta desde `index.ts`.

import styles from "./Badge.module.css";

// Elementos válidos para `as` (spec → API): span por defecto; `li` para los
// chips de SkillList (RF-2: la validez del contexto de lista es del
// consumidor).
type BadgeElement = "span" | "li";

// API (spec → API): `children: string` a propósito (plan → Decisiones: el tipo
// fuerza "solo texto"; Nada de íconos ni elementos anidados, spec → No hacer).
export interface BadgeProps {
  /** Solo texto: los chips no anidan elementos ni íconos. */
  children: string;
  as?: BadgeElement;
  /** Se une a la clase base del elemento raíz (unión aplicada en T2, RF-3). */
  className?: string;
}

export function Badge({ as, children, className }: BadgeProps) {
  // RF-1/RF-2: default `span`; `as` cambia el elemento raíz. Mismo patrón que
  // Box (`const El = as ?? "div"`).
  const El = as ?? "span";

  // RF-3 / T2 (spec → API): la `className` del consumidor se UNE a la clase
  // base sobre el único elemento raíz (no la reemplaza). Mismo mecanismo
  // aprobado en Box/Icon/BrandIcon: array + filtro de undefined + join, sin
  // librerías; así no quedan clases vacías cuando `className` no se pasa. Las
  // clases del módulo son `string | undefined` bajo noUncheckedIndexedAccess.
  // Base primero (precedente). Aplica a ambos `as`: la spec define un único
  // raíz. Sin roles añadidos (RF-4).
  const rootClassName = [styles.badge, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return <El className={rootClassName}>{children}</El>;
}
