import styles from "./Badge.module.css";

type BadgeElement = "span" | "li";

export interface BadgeProps {
  /** Text only: chips do not nest elements or icons. */
  children: string;
  as?: BadgeElement;
  className?: string;
}

export function Badge({ as, children, className }: BadgeProps) {
  const El = as ?? "span";

  const rootClassName = [styles.badge, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return <El className={rootClassName}>{children}</El>;
}
