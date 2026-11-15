import type { ReactNode } from "react";

import { ResumeSection } from "../../components/ResumeSection";
import { SectionTitle } from "../../components/SectionTitle";
import { SkillList } from "../../components/SkillList";
import { useCv, useLocale } from "../../providers/LocaleProvider";

import styles from "./ResumePage.module.css";

export interface ResumePageProps {
  className?: string;
}

export function ResumePage({ className }: ResumePageProps): ReactNode {
  // `locale` is the active language from the provider, not cv.locale, which is
  // the language of the JSON file.
  const { t, locale } = useLocale();
  const cv = useCv();

  const rootClassName = [styles.page, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <div className={rootClassName}>
      <SectionTitle as="h1" decorated>
        {t.resume.title}
      </SectionTitle>

      {/* Each section is skipped when its collection is empty, and the container
          when all three are. */}
      {cv.experience.length > 0 ||
      cv.projects.length > 0 ||
      cv.education.length > 0 ? (
        <div className={styles.columns}>
          {cv.experience.length > 0 ? (
            <ResumeSection
              id="experience"
              title={t.resume.experience}
              icon="briefcase"
              entries={cv.experience}
              locale={locale}
              timelineIdPrefix="exp"
              presentLabel={t.timeline.present}
            />
          ) : null}
          {cv.projects.length > 0 ? (
            <ResumeSection
              id="projects"
              title={t.resume.projects}
              icon="code"
              entries={cv.projects}
              locale={locale}
              timelineIdPrefix="proj"
              presentLabel={t.timeline.present}
            />
          ) : null}
          {cv.education.length > 0 ? (
            <ResumeSection
              id="education"
              title={t.resume.education}
              icon="book-open"
              entries={cv.education}
              locale={locale}
              timelineIdPrefix="edu"
              presentLabel={t.timeline.present}
            />
          ) : null}
        </div>
      ) : null}

      {cv.skills.length > 0 ? (
        <section aria-labelledby="resume-skills-title">
          <SectionTitle as="h2" id="resume-skills-title">
            {t.resume.skills}
          </SectionTitle>
          <SkillList skills={cv.skills} labelledBy="resume-skills-title" />
        </section>
      ) : null}
    </div>
  );
}
