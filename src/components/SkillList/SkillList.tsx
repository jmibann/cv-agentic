import { Badge } from "../Badge";

import styles from "./SkillList.module.css";

// Exactly one accessible name is required: passing both or neither is a
// compile error.
type SkillListName =
  | { labelledBy: string; label?: never }
  | { label: string; labelledBy?: never };

export type SkillListProps = SkillListName & {
  skills: readonly string[];
  className?: string;
};

export function SkillList({
  skills,
  className,
  label,
  labelledBy,
}: SkillListProps) {
  // No skills: render nothing, not even the <ul>.
  if (skills.length === 0) {
    return null;
  }

  const rootClassName = [styles.skillList, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <ul className={rootClassName} aria-label={label} aria-labelledby={labelledBy}>
      {skills.map((skill, index) => (
        // Index plus value keeps keys unique even with duplicated skills.
        <Badge as="li" key={`skill-${index}-${skill}`}>
          {skill}
        </Badge>
      ))}
    </ul>
  );
}
