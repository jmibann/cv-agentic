import { useCallback, useEffect, useRef, useState } from "react";

import type { Testimonial } from "@data/cv.types.generated";

import { format } from "../../i18n/format";

import { TestimonialCard } from "../TestimonialCard";
import { TestimonialDialog } from "../TestimonialDialog";

import { getActiveStop, getScrollStops } from "./getScrollStops";

import styles from "./TestimonialCarousel.module.css";

export interface TestimonialCarouselLabels {
  carousel: string;
  /** e.g. "{current} of {total}". */
  slide: string;
  /** e.g. "Go to slide {n}". */
  goToSlide: string;
  /** e.g. "Read full testimonial from {author}". */
  readMore: string;
  close: string;
}

export interface TestimonialCarouselProps {
  testimonials: readonly Testimonial[];
  labels: TestimonialCarouselLabels;
  labelledBy?: string;
  className?: string;
}

// The same 1px as the dedupe tolerance in getScrollStops: two readings of the
// same measured layout, not two independent thresholds.
const STOP_MATCH_TOLERANCE_PX = 1;

// A bullet is named after the first testimonial whose offsetLeft is at or
// past its stop.
function bulletNumber(stop: number, slideOffsets: readonly number[]): number {
  return (
    slideOffsets.findIndex(
      (offset) => offset >= stop - STOP_MATCH_TOLERANCE_PX,
    ) + 1
  );
}

// Offsets and stops live in one state: each bullet's name is computed from
// the offsets of the same measurement as its stop.
interface CarouselLayout {
  slideOffsets: readonly number[];
  stops: readonly number[];
}

const EMPTY_LAYOUT: CarouselLayout = { slideOffsets: [], stops: [] };

export function TestimonialCarousel({
  testimonials,
  labels,
  labelledBy,
  className,
}: TestimonialCarouselProps) {
  // Stored by id, never the object: the dialog's testimonial is looked up in
  // the current list, so it follows a language change.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [layout, setLayout] = useState<CarouselLayout>(EMPTY_LAYOUT);
  const [activeStop, setActiveStop] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  // Mirrors the layout state so the rAF callback reads the current stops; a
  // re-measure between the scroll and the frame would leave the closure stale.
  const layoutRef = useRef<CarouselLayout>(EMPTY_LAYOUT);
  const framePendingRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);

  const measure = useCallback((): void => {
    const track = trackRef.current;
    if (track === null) {
      return;
    }
    const slideOffsets = Array.from(
      track.querySelectorAll<HTMLElement>(":scope > div"),
    ).map((slide) => slide.offsetLeft);
    const maxScroll = track.scrollWidth - track.clientWidth;
    const stops = getScrollStops(slideOffsets, maxScroll);
    const measured: CarouselLayout = { slideOffsets, stops };
    layoutRef.current = measured;
    setLayout(measured);
    setActiveStop(getActiveStop(stops, track.scrollLeft));
  }, []);

  // Re-measures when the set of slides changes without unmounting (another
  // language) and, through ResizeObserver, whenever the track is resized.
  useEffect(() => {
    if (testimonials.length === 0) {
      return;
    }
    measure();
    const track = trackRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (track !== null) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(track);
    }
    return () => {
      resizeObserver?.disconnect();
      const frameId = frameIdRef.current;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameIdRef.current = null;
        framePendingRef.current = false;
      }
    };
  }, [testimonials, measure]);

  // One calculation per frame: scroll events are ignored while a frame is
  // pending, and the callback reads the node's real scrollLeft.
  const handleScroll = (): void => {
    if (framePendingRef.current) {
      return;
    }
    framePendingRef.current = true;
    const frameId = requestAnimationFrame(() => {
      framePendingRef.current = false;
      frameIdRef.current = null;
      const track = trackRef.current;
      if (track === null) {
        return;
      }
      setActiveStop(getActiveStop(layoutRef.current.stops, track.scrollLeft));
    });
    // With a synchronous callback (test mocks) the flag is already false: there
    // is no pending frame left to cancel.
    frameIdRef.current = framePendingRef.current ? frameId : null;
  };

  // Reduced motion is read at click time, so no live state or change listener
  // is needed.
  const handleBulletClick = (stop: number): void => {
    const track = trackRef.current;
    if (track === null) {
      return;
    }
    track.scrollTo({
      left: stop,
      behavior: window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches
        ? "smooth"
        : "auto",
    });
  };

  // No testimonials: no region, no track and no dialog.
  if (testimonials.length === 0) {
    return null;
  }

  const rootClassName = [styles.carousel, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  const selected =
    testimonials.find((testimonial) => testimonial.id === selectedId) ?? null;

  // A single stop needs no pagination.
  const showBullets = layout.stops.length > 1;

  return (
    // The accessible name is either labelledBy or the label, never both.
    <section
      className={rootClassName}
      aria-roledescription="carousel"
      {...(labelledBy
        ? { "aria-labelledby": labelledBy }
        : { "aria-label": labels.carousel })}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={handleScroll}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={format(labels.slide, {
              current: index + 1,
              total: testimonials.length,
            })}
          >
            <TestimonialCard
              testimonial={testimonial}
              openLabel={format(labels.readMore, {
                author: testimonial.author,
              })}
              onOpen={setSelectedId}
            />
          </div>
        ))}
      </div>
      {showBullets && (
        <div className={styles.pagination}>
          {layout.stops.map((stop, index) => (
            <button
              // Stops are deduplicated, so the value is a unique key.
              key={stop}
              type="button"
              className={styles.bullet}
              onClick={() => handleBulletClick(stop)}
              aria-label={format(labels.goToSlide, {
                n: bulletNumber(stop, layout.slideOffsets),
              })}
              aria-current={index === activeStop ? "true" : undefined}
            />
          ))}
        </div>
      )}
      {/* A single dialog, always mounted; its testimonial is null when closed. */}
      <TestimonialDialog
        testimonial={selected}
        onClose={() => setSelectedId(null)}
        closeLabel={labels.close}
      />
    </section>
  );
}
