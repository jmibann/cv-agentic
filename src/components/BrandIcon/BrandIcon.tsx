// BrandIcon — logos de redes sociales como SVG inline
// (specs/primitives/BrandIcon/spec.md). T2: render del <svg> por red desde
// paths.ts (RF-1): `viewBox` de la entrada y un <path> por cada `d` no vacío.
// T3 agrega el marcado decorativo (aria-hidden/focusable) y BRAND_NAMES
// (RF-2/RF-3); T4, el tamaño por CSS y la unión de `className` (RF-5/RF-6)
// — ver specs/primitives/BrandIcon/tasks.md.

import type { SocialNetwork } from "@data/cv.types.generated";

import { BRAND_PATHS } from "./paths";

export interface BrandIconProps {
  network: SocialNetwork;
  /** Se UNE a la clase base del `<svg>` raíz (no la reemplaza). La API la
      declara la spec; su unión sobre el elemento llega con T4 (tasks.md). */
  className?: string;
}

// Lookup directo network → paths.ts (plan.md: sin lógica ni funciones puras
// aparte; C1 ya se cumple en paths.ts, dato puro sin React).
export function BrandIcon({ network }: BrandIconProps) {
  const { viewBox, d } = BRAND_PATHS[network];

  // `d` es string (un path) o array (un path por elemento). Se descartan los
  // `d` vacíos: RF-1 pide "uno o más path no vacíos" y el render no debe
  // emitir paths que no dibujan nada si un SVG oficial aportara uno (con los
  // datos actuales de paths.ts nunca ocurre; lo ancla el test de T1).
  const paths = (Array.isArray(d) ? d : [d]).filter((item) => item.trim() !== "");

  // Sin `fill`/`aria-hidden`/`focusable` todavía: eso es T3 (RF-3/RF-1 en su
  // parte de atributos). Sin clase base ni `className`: el módulo CSS y la
  // unión son T4 (RF-5/RF-6; tasks.md). La clave es el índice: la lista es
  // estática y sin reordenos, y un array oficial podría traer `d` repetidos.
  return (
    <svg viewBox={viewBox}>
      {paths.map((pathD, index) => (
        <path key={index} d={pathD} />
      ))}
    </svg>
  );
}
