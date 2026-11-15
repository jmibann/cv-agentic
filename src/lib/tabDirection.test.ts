import { describe, expect, it } from "vitest";

import { getTabDirection } from "./tabDirection";

describe("getTabDirection", () => {
  it("returns 'from-right' when moving forward (about → resume)", () => {
    expect(getTabDirection(0, 1)).toBe("from-right");
  });

  it("returns 'from-left' when moving backward (resume → about)", () => {
    expect(getTabDirection(1, 0)).toBe("from-left");
  });

  it("returns null when there is no previous index (initial render)", () => {
    expect(getTabDirection(null, 0)).toBeNull();
  });

  it("returns null when the index does not change", () => {
    expect(getTabDirection(0, 0)).toBeNull();
  });
});
