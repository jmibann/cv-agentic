import { describe, expect, it } from "vitest";

import { LOCALES } from "@data/constants";

describe("single-project scaffolding", () => {
  it("resolves the @data/* alias and runs under jsdom", () => {
    expect(LOCALES).toEqual(["en", "es"]);
    expect(typeof window).toBe("object");
  });
});
