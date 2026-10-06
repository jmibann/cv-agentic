// IconBox — contenedor cuadrado tintado con un ícono en gradiente
// (specs/primitives/IconBox/spec.md). T1: estructura (RF-1): `<span>` raíz con
// un `Icon tone="gradient"` centrado. T2 hecha: el raíz es siempre decorativo
// (`aria-hidden="true"`, RF-2) y la `className` del consumidor se UNE a la
// clase base (`iconBox`) del raíz (P2); el módulo nace en T2 con la clase base
// vacía. T3 hecha: IconBox.module.css fija los estilos por tokens (cuadrado
// --size-icon-box, --color-surface-muted, --radius-12, inline-flex centrado y
// flex-shrink: 0; RF-3/RF-4) y `index.ts` re-exporta IconBox e IconBoxProps.
// IconBox NO monta las
// defs del gradiente: la unicidad del montaje es de AppLayout (RF-1 de la spec
// y plan.md → Decisiones); el test las monta como armazón (patrón de Icon).

import { Icon } from "../Icon";
import type { IconName } from "../Icon";

import styles from "./IconBox.module.css";

// API (spec → API): `icon: IconName`; `className` unida a la clase base del
// `<span>` raíz (unión aplicada en T2).
export interface IconBoxProps {
  icon: IconName;
  /** Se une a la clase base del `<span>` raíz. Nota: `--icon-size` fijada
   * aquí NO llega al ícono (no hereda; plan → Decisiones C-1). */
  className?: string;
}

export function IconBox({ icon, className }: IconBoxProps) {
  // RF-1: el ícono viaja con `tone="gradient"` (trazo `url(#accent-gradient)`
  // que resuelve desde las defs de AppLayout). IconBox no pasa `--icon-size`:
  // aplica el fallback default de Icon (`var(--size-icon)`) — plan.md →
  // Decisiones (C-1).
  // RF-2 (T2): el raíz es siempre decorativo (`aria-hidden="true"`): el
  // significado lo da el texto que lo acompaña (spec → Accesibilidad).
  // T2 (spec → API, P2): la `className` del consumidor se UNE a la clase base
  // sobre el único elemento raíz (no la reemplaza). Mismo mecanismo aprobado
  // en Box/Icon/BrandIcon/Badge/Overhead: array + filtro de undefined + join,
  // base primero, sin librerías; así no quedan clases vacías cuando
  // `className` no se pasa. Las clases del módulo son `string | undefined`
  // bajo noUncheckedIndexedAccess. El centrado visual (`inline-flex` +
  // `align-items`/`justify-content`) rige desde T3 en la clase base.
  const rootClassName = [styles.iconBox, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <span aria-hidden="true" className={rootClassName}>
      <Icon name={icon} tone="gradient" />
    </span>
  );
}
