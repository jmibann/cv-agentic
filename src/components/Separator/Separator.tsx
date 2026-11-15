import styles from "./Separator.module.css";

export interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  const rootClassName = [styles.separator, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // A decorative <div>, deliberately neither an <hr> nor role="separator".
  return <div aria-hidden="true" className={rootClassName} />;
}
