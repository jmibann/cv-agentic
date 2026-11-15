import {
  siBehance,
  siDribbble,
  siFacebook,
  siGithub,
  siInstagram,
  siX,
} from "simple-icons";

import type { SocialNetwork } from "@data/cv.types.generated";

export interface BrandPath {
  viewBox: string;
  d: string | string[];
}

// LinkedIn "in" logo, monochrome, 24×24. It is not in simple-icons 16 (the
// brand asked for its removal in v14); this is the path simple-icons shipped
// under CC0 until then. Its exact match with the official brand kit
// (https://brand.linkedin.com/downloads) is still to be verified.
const LINKEDIN_OFFICIAL_D =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.208 0 22.225 0z";

// Named imports (no `import * as`) for tree-shaking. Record<SocialNetwork, …>
// requires one entry per network: a new one without a path fails the type
// check.
export const BRAND_PATHS: Record<SocialNetwork, BrandPath> = {
  github: { viewBox: "0 0 24 24", d: siGithub.path },
  // Not in simple-icons: see LINKEDIN_OFFICIAL_D.
  linkedin: { viewBox: "0 0 24 24", d: LINKEDIN_OFFICIAL_D },
  x: { viewBox: "0 0 24 24", d: siX.path },
  instagram: { viewBox: "0 0 24 24", d: siInstagram.path },
  facebook: { viewBox: "0 0 24 24", d: siFacebook.path },
  dribbble: { viewBox: "0 0 24 24", d: siDribbble.path },
  behance: { viewBox: "0 0 24 24", d: siBehance.path },
};
