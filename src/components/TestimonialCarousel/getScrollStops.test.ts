import { describe, expect, it } from "vitest";

import { getActiveStop, getScrollStops } from "./getScrollStops";

describe("getScrollStops", () => {
  it("clamps offsets to maxScroll and drops the duplicate stop", () => {
    expect(getScrollStops([0, 300, 600], 300)).toEqual([0, 300]);
  });

  it("keeps every offset when none exceeds maxScroll", () => {
    expect(getScrollStops([0, 300, 600], 600)).toEqual([0, 300, 600]);
  });

  it("collapses every offset to a single stop when maxScroll is 0", () => {
    expect(getScrollStops([0, 300], 0)).toEqual([0]);
  });

  // extra: the 1px tolerance is read as inclusive; the lower value is kept.
  it("treats a 1px distance as a duplicate under the inclusive tolerance", () => {
    expect(getScrollStops([0, 1, 600], 600)).toEqual([0, 600]);
  });

  // extra: follows from the clamp rule.
  it("returns a single stop at maxScroll when every offset exceeds it", () => {
    expect(getScrollStops([300, 600], 200)).toEqual([200]);
  });
});

describe("getActiveStop", () => {
  it("returns the index of the nearest stop", () => {
    expect(getActiveStop([0, 300], 140)).toBe(0);
    expect(getActiveStop([0, 300], 160)).toBe(1);
  });

  it("resolves a tie toward the lower index", () => {
    expect(getActiveStop([0, 300], 150)).toBe(0);
  });

  // extra: defensive guard of a total function.
  it("returns 0 for an empty stops array (defensive guard)", () => {
    expect(getActiveStop([], 0)).toBe(0);
  });
});
