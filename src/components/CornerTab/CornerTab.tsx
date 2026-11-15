import type { ReactNode } from "react";

import styles from "./CornerTab.module.css";

export interface CornerTabProps {
  children: ReactNode;
  /** "sm" is the compact size used by the Show Contacts toggle. */
  size?: "sm" | "md";
  /** "float": absolute below 992px, floated to the right from 992px up. */
  placement?: "overlay" | "float";
  className?: string;
}

export function CornerTab({
  children,
  className,
  placement = "overlay",
  size = "md",
}: CornerTabProps) {
  const sizeClass = size === "sm" ? styles.sm : styles.md;

  const placementClass = placement === "float" ? styles.float : undefined;

  const rootClassName = [
    styles.cornerTab,
    sizeClass,
    placementClass,
    className,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // No role and no aria-*: it is a visual container; names and states come
  // from its children.
  return (
    <div className={rootClassName} data-print-hide>
      {children}
    </div>
  );
}
