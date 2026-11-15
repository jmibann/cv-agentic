import type { ReactNode } from "react";

import styles from "./Box.module.css";

type BoxElement = "div" | "section" | "article" | "aside" | "header";

// Closed API: only these attributes reach the element. No role, tabIndex or
// rest props.
export interface BoxProps {
  variant?: "outer" | "inner";
  as?: BoxElement;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export function Box({
  as,
  variant,
  children,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: BoxProps) {
  const variantClass = variant === "inner" ? styles.inner : styles.outer;

  const rootClassName = [variantClass, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  const El = as ?? "div";

  return (
    <El
      className={rootClassName}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </El>
  );
}
