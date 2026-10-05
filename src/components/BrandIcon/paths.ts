// paths.ts — dato de logos de marca por red (specs/primitives/BrandIcon/
// spec.md → "Fuente de los paths"; plan.md → decisión B-1). Dato puro sin
// React (C1): lo consume solo BrandIcon (T2).
//
// Estructura por red: { viewBox: string; d: string | string[] }. Los logos de
// simple-icons son siempre un único path sobre grilla 24×24; un SVG oficial
// que no sea cuadrado conserva su viewBox (no se deforma ni se recorta).

import {
  siBehance,
  siDribbble,
  siFacebook,
  siGithub,
  siInstagram,
  siX,
} from "simple-icons";

import type { SocialNetwork } from "@data/cv.types.generated";

/** Forma de una entrada de este módulo (plan.md → decisión B-1). */
export interface BrandPath {
  viewBox: string;
  d: string | string[];
}

// LinkedIn "in" monocromo, 24×24. Origen (RF-4): SVG oficial del kit de marca
// de LinkedIn (https://brand.linkedin.com/downloads, logo "in" en versión
// monocroma). No está en simple-icons 16.33.0 (la marca lo retiró a pedido
// propio en la v14; ver docs/BACKLOG.md → "Ícono de LinkedIn"): lo verificado
// es que el path es el que distribuyó simple-icons bajo licencia CC0 hasta esa
// versión (válido geométrica y tipológicamente en la grilla 24×24); su
// equivalencia exacta con el kit de prensa oficial queda pendiente de
// verificación y registrada en docs/BACKLOG.md. viewBox "0 0 24 24" propio del
// logo: no se deforma; el color lo aporta currentColor en el <svg> (T2), sin
// relleno propio acá.
const LINKEDIN_OFFICIAL_D =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.208 0 22.225 0z";

// Importaciones nombradas (plan.md; sin `import * as`, para tree-shaking).
// El tipo `Record<SocialNetwork, BrandPath>` exige una entrada por cada valor
// de la unión (data/cv.schema.json → SOCIAL_NETWORKS en @data/constants): si
// el esquema agrega una red sin path, `tsc` falla (RF-1). La única red sin
// simple-icons es linkedin (ver comentario de origen; RF-4).
export const BRAND_PATHS: Record<SocialNetwork, BrandPath> = {
  github: { viewBox: "0 0 24 24", d: siGithub.path },
  // Fallback oficial (no está en simple-icons 16.33.0): ver LINKEDIN_OFFICIAL_D.
  linkedin: { viewBox: "0 0 24 24", d: LINKEDIN_OFFICIAL_D },
  x: { viewBox: "0 0 24 24", d: siX.path },
  instagram: { viewBox: "0 0 24 24", d: siInstagram.path },
  facebook: { viewBox: "0 0 24 24", d: siFacebook.path },
  dribbble: { viewBox: "0 0 24 24", d: siDribbble.path },
  behance: { viewBox: "0 0 24 24", d: siBehance.path },
};
