import type { Service } from "@data/cv.types.generated";

import { Box } from "../Box";
import { Icon } from "../Icon";
import { SectionTitle } from "../SectionTitle";

import styles from "./ServiceCard.module.css";

export interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const titleId = `service-${service.id}-title`;

  // Joined before reaching Box, which accepts a single class string.
  const rootClassName = [styles.card, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <Box
      variant="inner"
      as="article"
      aria-labelledby={titleId}
      className={rootClassName}
    >
      <Icon name={service.icon} tone="gradient" className={styles.glyph} />
      <div>
        <SectionTitle as="h3" id={titleId}>
          {service.title}
        </SectionTitle>
        <p>{service.description}</p>
      </div>
    </Box>
  );
}
