import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import { formatPeriodEndpoint } from "../../i18n/formatPeriod";

import styles from "./Timeline.module.css";

export interface TimelineProps {
  entries: readonly TimelineEntry[];
  locale: Locale;
  presentLabel: string;
  /** Prefix for unique title ids (e.g. "edu", "exp"). */
  idPrefix: string;
  className?: string;
}

export function Timeline({
  entries,
  locale,
  presentLabel,
  idPrefix,
  className,
}: TimelineProps) {
  // No entries: render nothing, not even the <ol>.
  if (entries.length === 0) {
    return null;
  }

  const rootClassName = [styles.timeline, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // Explicit role: list-style: none drops the implicit one in Safari/VoiceOver.
    <ol className={rootClassName} role="list">
      {entries.map((entry) => {
        // The prefix keeps ids unique when two timelines share a page.
        const titleId = `${idPrefix}-${entry.id}-title`;
        return (
          <li key={entry.id} className={styles.item}>
            <article aria-labelledby={titleId}>
              <h3 id={titleId} className={styles.title}>
                {entry.title}
              </h3>
              {/* Both fields are required by the schema, so "missing" means empty: no
                  hollow paragraphs are rendered. */}
              {entry.organization ? (
                <p className={styles.organization}>{entry.organization}</p>
              ) : null}
              <p className={styles.period}>
                <time dateTime={entry.start}>
                  {formatPeriodEndpoint(entry.start, locale)}
                </time>
                {" — "}
                {entry.end === null ? (
                  presentLabel
                ) : (
                  <time dateTime={entry.end}>
                    {formatPeriodEndpoint(entry.end, locale)}
                  </time>
                )}
              </p>
              {entry.description ? (
                <p className={styles.description}>{entry.description}</p>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
