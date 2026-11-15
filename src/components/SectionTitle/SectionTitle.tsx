import type { ReactNode } from "react";

import { IconBox } from "../IconBox";
import type { IconName } from "../Icon";

import styles from "./SectionTitle.module.css";

// The heading level is required and comes from the context; it is never
// inferred from the size.
export interface SectionTitleProps {
  as: "h1" | "h2" | "h3";
  children: ReactNode;
  decorated?: boolean;
  icon?: IconName;
  /** For the section's aria-labelledby. */
  id?: string;
  className?: string;
}

export function SectionTitle({
  as,
  children,
  id,
  decorated,
  icon,
  className,
}: SectionTitleProps) {
  const El = as;

  const rootClassName = [
    styles[as],
    decorated ? styles.decorated : undefined,
    icon ? styles.withIcon : undefined,
    className,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // The icon box is aria-hidden, so the heading's accessible name is its text.
  return (
    <El id={id} className={rootClassName}>
      {icon ? <IconBox icon={icon} /> : null}
      {children}
    </El>
  );
}
