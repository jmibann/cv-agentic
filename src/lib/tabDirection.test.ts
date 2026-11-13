// Test 15 de specs/layout/AppLayout/spec.md (T10, RF-9): getTabDirection pura
// en src/lib/tabDirection.ts. Query directa a la función: sin React ni DOM.
// Casos literales de la spec: (0, 1) → "from-right"; (1, 0) → "from-left";
// (null, 0) → null (sin índice previo = primer render); (0, 0) → null
// (mismo índice).

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
