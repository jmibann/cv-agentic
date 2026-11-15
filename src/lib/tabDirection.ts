export type MotionDirection = "from-left" | "from-right";

/** Returns null on the first render or when the index does not change. */
export function getTabDirection(
  prev: number | null,
  next: number,
): MotionDirection | null {
  if (prev === null || prev === next) {
    return null;
  }
  return next > prev ? "from-right" : "from-left";
}
