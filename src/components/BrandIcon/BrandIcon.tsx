import type { SocialNetwork } from "@data/cv.types.generated";

import styles from "./BrandIcon.module.css";

import { BRAND_PATHS } from "./paths";

export interface BrandIconProps {
  network: SocialNetwork;
  /** Added to the base class on the <svg>; the parent sets --icon-size there. */
  className?: string;
}

// Display names chosen by design, not taken from simple-icons titles (the
// LinkedIn fallback has none). Used as the aria-label of the wrapping link.
export const BRAND_NAMES: Record<SocialNetwork, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  facebook: "Facebook",
  dribbble: "Dribbble",
  behance: "Behance",
};

export function BrandIcon({ network, className }: BrandIconProps) {
  const { viewBox, d } = BRAND_PATHS[network];

  // Empty `d` values are dropped so no path that draws nothing is rendered.
  const paths = (Array.isArray(d) ? d : [d]).filter((item) => item.trim() !== "");

  const svgClassName = [styles.brandIcon, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // Always decorative: the accessible name comes from the wrapping link.
  // focusable="false" covers legacy IE/Edge.
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
