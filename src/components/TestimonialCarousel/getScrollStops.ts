// Two values at most 1px apart are the same stop.
const DEDUPE_TOLERANCE_PX = 1;

/** Reachable scroll positions: capped at maxScroll, deduplicated, ascending. */
export function getScrollStops(
  slideOffsets: readonly number[],
  maxScroll: number,
): number[] {
  const clamped = slideOffsets
    .map((offset) => Math.min(offset, maxScroll))
    .sort((a, b) => a - b);
  const stops: number[] = [];
  for (const value of clamped) {
    const last = stops[stops.length - 1];
    // Measured against the last kept stop, not the previous input value, so a
    // run of sub-pixel deltas cannot chain into drift.
    if (last === undefined || value - last > DEDUPE_TOLERANCE_PX) {
      stops.push(value);
    }
  }
  return stops;
}

/** Index of the stop closest to scrollLeft; on a tie the lower index wins. */
export function getActiveStop(
  stops: readonly number[],
  scrollLeft: number,
): number {
  // With no stops this returns 0 instead of throwing.
  let activeIndex = 0;
  let activeDistance = Number.POSITIVE_INFINITY;
  for (const [index, stop] of stops.entries()) {
    const distance = Math.abs(stop - scrollLeft);
    if (distance < activeDistance) {
      activeIndex = index;
      activeDistance = distance;
    }
  }
  return activeIndex;
}
