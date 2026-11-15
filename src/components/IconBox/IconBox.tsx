import { Icon } from "../Icon";
import type { IconName } from "../Icon";

import styles from "./IconBox.module.css";

export interface IconBoxProps {
  icon: IconName;
  /** --icon-size set here does not reach the icon: the property does not inherit. */
  className?: string;
}

export function IconBox({ icon, className }: IconBoxProps) {
  // Always decorative: the meaning comes from the text next to it.
  const rootClassName = [styles.iconBox, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <span aria-hidden="true" className={rootClassName}>
      <Icon name={icon} tone="gradient" />
    </span>
  );
}
