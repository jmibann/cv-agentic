// Button — acción principal con el gradiente de acento
// (specs/primitives/Button/spec.md). T1: rama botón de la unión discriminada
// por `href` (RF-1): sin `href` renderiza un <button> con el `type` recibido
// (default "button") y el nombre accesible desde `children`. T2: `onClick` y
// `disabled` de la rama botón llegan al <button> (RF-3). Ramas diferidas a su
// tarea según tasks.md: render del <a> con href/rel/target/download (T3),
// ícono e iconPosition (T4), clases size/fullWidth y unión de className (T5),
// estilos por tokens y pseudo-estados (T6).

import type { ReactNode } from "react";

import type { IconName } from "../Icon";

// Props comunes a las dos ramas (spec → API). `size`/`icon`/`iconPosition`/
// `fullWidth`/`className` se declaran ya —la API es la de la spec— pero se
// ignoran en el render hasta su tarea (T4/T5); no se agregan props extra.
interface CommonProps {
  children: ReactNode;
  /** Default "default". */
  size?: "default" | "small";
  icon?: IconName;
  /** Default "start". */
  iconPosition?: "start" | "end";
  /** Default false. */
  fullWidth?: boolean;
  /** Se une a la clase base del elemento raíz (<button> o <a>). */
  className?: string;
}

// Unión discriminada por `href` (spec → API; plan.md → Decisiones: se
// descarta la interfaz única porque permitiría `disabled` en un <a>). La
// rama link queda DECLARADA completa desde T1 porque la spec fija esta
// unión como contrato, pero su render del <a> NO se implementa hasta T3:
// abajo, un `href` definido cae provisoriamente al <button> (ver Button).
export type ButtonProps =
  | (CommonProps & {
      href?: undefined;
      type?: "button" | "submit";
      onClick?: () => void;
      disabled?: boolean;
    })
  | (CommonProps & {
      href: string;
      download?: boolean | string;
      target?: "_blank";
      rel?: string;
    });

export function Button(props: ButtonProps) {
  // RF-1 (T1): la unión no permite leer `type` sin discriminar `href`
  // (solo existe en la rama botón). Con `href === undefined` TS angosta a
  // la rama botón y `type ?? "button"` aplica el default. La rama link
  // (`href` definida) usa provisoriamente "button" porque el <button> es
  // el único render implementado hasta T3.
  // T3: acá se derivará el <a> con `href`, `rel` default (`target="_blank"`
  // sin `rel` → "noopener noreferrer", RF-2/RF-9) y `download` (RF-8).
  const type = props.href === undefined ? (props.type ?? "button") : "button";

  // RF-3 (T2): `onClick` y `disabled` solo existen en la rama sin `href`
  // (spec → API); el mismo angostado por `href === undefined` que usa `type`
  // los lee con tipos. En la rama link (provisoria hasta T3) quedan
  // `undefined`: la unión no permite pasarlos, así que el angostado de TS
  // los deja fuera del <a> futuro sin código extra.
  const onClick = props.href === undefined ? props.onClick : undefined;
  const disabled = props.href === undefined ? props.disabled : undefined;

  // API cerrada (spec → API): al botón llegan `type`, `onClick`, `disabled` y
  // `children`; el ícono en T4, las clases en T5.
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {props.children}
    </button>
  );
}
