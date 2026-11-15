import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import type { IconName } from "../Icon";
import { SectionTitle } from "../SectionTitle";
import { Timeline } from "../Timeline";

import styles from "./ResumeSection.module.css";

export interface ResumeSectionProps {
  id: string;
  /** Forwarded as is to Timeline for its item ids (e.g. "edu", "exp"). */
  timelineIdPrefix: string;
  title: string;
  icon: IconName;
  entries: readonly TimelineEntry[];
  locale: Locale;
  presentLabel: string;
  className?: string;
}

export function ResumeSection({
  id,
  timelineIdPrefix,
  title,
  icon,
  entries,
  locale,
  presentLabel,
  className,
}: ResumeSectionProps) {
  // No entries: render nothing, not even the heading.
  if (entries.length === 0) {
    return null;
  }

  const titleId = `resume-${id}-title`;

  const rootClassName = [styles.resumeSection, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <section aria-labelledby={titleId} className={rootClassName}>
      <SectionTitle as="h2" id={titleId} icon={icon}>
        {title}
      </SectionTitle>
      <Timeline
        idPrefix={timelineIdPrefix}
        entries={entries}
        locale={locale}
        presentLabel={presentLabel}
      />
    </section>
  );
}
