import type { ReactNode } from "react";

import { TestimonialCarousel } from "../../components/TestimonialCarousel";
import type { TestimonialCarouselLabels } from "../../components/TestimonialCarousel";
import { ServiceCard } from "../../components/ServiceCard";
import { SectionTitle } from "../../components/SectionTitle";
import { useCv, useLocale } from "../../providers/LocaleProvider";

import styles from "./AboutPage.module.css";

export interface AboutPageProps {
  className?: string;
}

export function AboutPage({ className }: AboutPageProps): ReactNode {
  // Pages are the only components allowed to read content and UI texts from
  // the providers.
  const { t } = useLocale();
  const cv = useCv();

  // Raw templates: the carousel interpolates the placeholders, not the page.
  const carouselLabels: TestimonialCarouselLabels = {
    carousel: t.testimonials.carouselLabel,
    slide: t.testimonials.slideLabel,
    goToSlide: t.testimonials.goToSlide,
    readMore: t.testimonials.readMore,
    close: t.testimonials.close,
  };

  const rootClassName = [styles.page, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <div className={rootClassName}>
      <SectionTitle as="h1" decorated>
        {t.about.title}
      </SectionTitle>

      {cv.profile.about.length > 0 ? (
        <div className={styles.intro}>
          {cv.profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {cv.services.length > 0 ? (
        <section aria-labelledby="about-services-title">
          <SectionTitle as="h2" id="about-services-title">
            {t.about.services}
          </SectionTitle>
          <ul className={styles.services}>
            {cv.services.map((service) => (
              <li key={service.id}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* The heading and the carousel are direct siblings: the carousel owns its
          own <section>, named through labelledBy. */}
      {cv.testimonials.length > 0 ? (
        <>
          <SectionTitle as="h2" id="about-testimonials-title">
            {t.about.testimonials}
          </SectionTitle>
          <TestimonialCarousel
            testimonials={cv.testimonials}
            labels={carouselLabels}
            labelledBy="about-testimonials-title"
            className={styles.testimonials}
          />
        </>
      ) : null}
    </div>
  );
}
