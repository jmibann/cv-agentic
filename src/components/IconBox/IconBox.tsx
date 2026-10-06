// IconBox — contenedor cuadrado tintado con un ícono en gradiente
// (specs/primitives/IconBox/spec.md). T1: estructura (RF-1): `<span>` raíz con
// un `Icon tone="gradient"` centrado por CSS. IconBox NO monta las defs del
// gradiente: la unicidad del montaje es de AppLayout (RF-1 de la spec y
// plan.md → Decisiones); el test las monta como armazón (patrón de Icon).
// T2 pendiente: `aria-hidden="true"` en el raíz (RF-2) y unión de `className`
// a la clase base; T3 pendiente: IconBox.module.css (cuadrado
// --size-icon-box, --color-surface-muted, --radius-12, inline-flex centrado,
// RF-3). En T1 no hay estilos observables ni clase base todavía, por eso el
// módulo CSS recién se crea en T3.

import { Icon } from "../Icon";
import type { IconName } from "../Icon";

// API (spec → API): `icon: IconName`; `className` se une a la clase base del
// `<span>` raíz — unión y clase base aplican en T2/T3; en T1 está declarada
// sin comportamiento (la spec la fija como parte del contrato de la pieza).
export interface IconBoxProps {
  icon: IconName;
  /** Se une a la clase base del `<span>` raíz (unión aplicada en T2). */
  className?: string;
}

export function IconBox({ icon }: IconBoxProps) {
  // RF-1: el ícono viaja con `tone="gradient"` (trazo `url(#accent-gradient)`
  // que resuelve desde las defs de AppLayout). IconBox no pasa `--icon-size`:
  // aplica el fallback default de Icon (`--size-icon`) — plan.md → Decisiones
  // (C-1). Sin `label`: el contenido es decorativo (el significado lo da el
  // texto acompañante); el `aria-hidden` del raíz y la unión de `className`
  // son T2, y el centrado visual (`inline-flex` + `align-items`/
  // `justify-content`), T3.
  return (
    <span>
      <Icon name={icon} tone="gradient" />
    </span>
  );
}
