import { assetUrl } from "../../utils/assetUrl";
import styles from "./HexAvatar.module.css";

export interface HexAvatarProps {
  src: string;
  /** Defaults to "": next to a visible name the image is decorative. */
  alt?: string;
  className?: string;
}

/** Single owner of the two clip-path ids; AppLayout mounts it once. */
export function HexAvatarDefs() {
  return (
    // Hidden by size, never display: none, which breaks url(#…) resolution in
    // some browsers.
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className={styles.defs}
    >

      {/* Outer hexagon on an 80×88 box, in objectBoundingBox units. */}
      <clipPath id="hex-avatar-outer" clipPathUnits="objectBoundingBox">
        <path d="M0.4639 0.0181 A0.075 0.068 0 0 1 0.5361 0.0181 L0.9611 0.2306 A0.075 0.068 0 0 1 1 0.2903 L1 0.7097 A0.075 0.068 0 0 1 0.9611 0.7694 L0.5361 0.982 A0.075 0.068 0 0 1 0.4639 0.982 L0.0389 0.7694 A0.075 0.068 0 0 1 0 0.7097 L0 0.2903 A0.075 0.068 0 0 1 0.0389 0.2306 Z" />
      </clipPath>

      {/* The inner hexagon has its own 72×80 box: it is a true 4px inset of the
          outer one, not a scaled copy, which would leave an uneven border. */}
      <clipPath id="hex-avatar-inner" clipPathUnits="objectBoundingBox">
        <path d="M0.4866 0.0138 A0.028 0.025 0 0 1 0.5134 0.0138 L0.9856 0.2475 A0.028 0.025 0 0 1 1 0.2694 L1 0.7306 A0.028 0.025 0 0 1 0.9856 0.7525 L0.5134 0.9863 A0.028 0.025 0 0 1 0.4866 0.9863 L0.0144 0.7525 A0.028 0.025 0 0 1 0 0.7306 L0 0.2694 A0.028 0.025 0 0 1 0.0144 0.2475 Z" />
      </clipPath>
    </svg>
  );
}

export function HexAvatar({ src, alt = "", className }: HexAvatarProps) {
  const rootClassName = [styles.wrap, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <span className={rootClassName}>
      <span className={styles.border}>
        <img className={styles.image} src={assetUrl(src)} alt={alt} />
      </span>
    </span>
  );
}
