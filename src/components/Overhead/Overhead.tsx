import type { ReactNode } from "react";

import styles from "./Overhead.module.css";

type OverheadElement = "span" | "dt";

export interface OverheadProps {
  children: ReactNode;
  as?: OverheadElement;
  className?: string;
}

export function Overhead({ as, children, className }: OverheadProps) {
  // Rendered as written: uppercase is applied in CSS only, so the DOM keeps the
  // normal capitalisation.
  const El = as ?? "span";

  const rootClassName = [styles.overhead, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return <El className={rootClassName}>{children}</El>;
}
