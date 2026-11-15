import type { Testimonial } from "@data/cv.types.generated";

import { Box } from "../Box";
import { HexAvatar } from "../HexAvatar";
import { Icon } from "../Icon";

import styles from "./TestimonialCard.module.css";

export interface TestimonialCardProps {
  testimonial: Testimonial;
  /** Already interpolated, e.g. "Read full testimonial from {author}". */
  openLabel: string;
  onOpen: (id: string) => void;
  className?: string;
}

export function TestimonialCard({
  testimonial,
  openLabel,
  onOpen,
  className,
}: TestimonialCardProps) {
  const nameId = `testimonial-${testimonial.id}-name`;

  const rootClassName = [styles.card, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    // No top margin here: the room for the protruding avatar is reserved by the
    // container.
    <Box
      variant="inner"
      as="article"
      aria-labelledby={nameId}
      className={rootClassName}
    >
      <div className={styles.header}>
        <HexAvatar src={testimonial.avatar.src} className={styles.avatar} />
        <div className={styles.identity}>
          <h3 id={nameId} className={styles.name}>
            {testimonial.author}
          </h3>
          <p className={styles.role}>{testimonial.role}</p>
        </div>
      </div>
      <p className={styles.excerpt}>{testimonial.text}</p>
      <Icon name="quote" tone="gradient" className={styles.quote} />
      {/* Stretched button: last child with no text of its own; the aria-label is
          its only name. */}
      <button
        type="button"
        aria-label={openLabel}
        className={styles.stretched}
        onClick={() => onOpen(testimonial.id)}
      />
    </Box>
  );
}
