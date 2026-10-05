// BrandIcon — logos de redes sociales como SVG inline
// (specs/primitives/BrandIcon/spec.md). T2: render del <svg> por red desde
// paths.ts (RF-1): `viewBox` de la entrada y un <path> por cada `d` no vacío.
// T3: <svg> siempre decorativo (RF-3: aria-hidden/focusable, y fill="currentColor"
// de la Anatomía/RF-1) + BRAND_NAMES (RF-2). T4: el tamaño por CSS (clase
// `.brandIcon`) y la unión de `className` del consumidor (RF-5/RF-6).

import type { SocialNetwork } from "@data/cv.types.generated";

import styles from "./BrandIcon.module.css";

import { BRAND_PATHS } from "./paths";

export interface BrandIconProps {
  network: SocialNetwork;
  /** Se UNE a la clase base `.brandIcon` sobre el `<svg>` raíz (no la
      reemplaza); ahí el padre fija `--icon-size` (spec → Estilos y tokens). */
  className?: string;
}

// RF-2 (spec → API): nombre visible de cada red, para los aria-labels del
// link contenedor. Literales definidos por el diseño, NO derivados del
// `title` de simple-icons (plan.md → decisión B-3: el fallback oficial de
// LinkedIn no trae `si.title` y el nombre lo elige el diseño). El tipo
// `Record<SocialNetwork, string>` exige una clave por cada valor de la unión
// (@data/constants → SOCIAL_NETWORKS): si el esquema crece sin nombre, `tsc`
// falla (mismo anclaje en compilación que BRAND_PATHS en paths.ts; spec →
// Tests esperados).
export const BRAND_NAMES: Record<SocialNetwork, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  facebook: "Facebook",
  dribbble: "Dribbble",
  behance: "Behance",
};

// Lookup directo network → paths.ts (plan.md: sin lógica ni funciones puras
// aparte; C1 ya se cumple en paths.ts, dato puro sin React).
export function BrandIcon({ network, className }: BrandIconProps) {
  const { viewBox, d } = BRAND_PATHS[network];

  // `d` es string (un path) o array (un path por elemento). Se descartan los
  // `d` vacíos: RF-1 pide "uno o más path no vacíos" y el render no debe
  // emitir paths que no dibujan nada si un SVG oficial aportara uno (con los
  // datos actuales de paths.ts nunca ocurre; lo ancla el test de T1).
  const paths = (Array.isArray(d) ? d : [d]).filter((item) => item.trim() !== "");

  // RF-5/RF-6 y T4 (spec → API y Estilos y tokens): el tamaño va solo por CSS,
  // sin prop `size`. La clase base `.brandIcon` (width/height con `var(
  // --icon-size, var(--size-social-icon))`) se fija SIEMPRE sobre el propio
  // <svg> raíz; a ella se UNE el `className` del consumidor (no la reemplaza:
  // ahí el padre fija `--icon-size`, registrada en tokens.css con
  // @property inherits:false, así que solo afecta a este <svg>). Join manual
  // con el mismo mecanismo que Icon: se descartan los undefined, sin clases
  // vacías propias.
  const svgClassName = [styles.brandIcon, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-3 (spec → Accesibilidad): el logo es SIEMPRE decorativo, igual que el
  // caso sin `label` de Icon —el marcado se fija explícitamente en el
  // componente, sin depender de defaults—. aria-hidden="true" lo saca del
  // árbol de accesibilidad (focusable="false" cubre IE/Edge legacy) y el
  // nombre accesible la aporta el link contenedor con
  // `aria-label={BRAND_NAMES[network]}` (Sidebar, su spec). fill="currentColor"
  // es el de la Anatomía: monocromo heredado del padre (RF-5), sin color ni
  // gradiente propio. La clave de los paths es el índice: la lista es estática
  // y sin reordenos, y un array oficial podría traer `d` repetidos.
  return (
    <svg
      className={svgClassName}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((pathD, index) => (
        <path key={index} d={pathD} />
      ))}
    </svg>
  );
}
