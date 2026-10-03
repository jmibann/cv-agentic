// Tests de `format` (T6): reemplazo de uno o varios `{placeholders}` y
// placeholder ausente que queda literal (spec §Tests esperados;
// foundations/i18n.md → "Textos de interfaz").
import { describe, expect, it } from "vitest";

import { format } from "./format";

describe("format", () => {
  it("replaces a single placeholder", () => {
    expect(format("Go to slide {n}", { n: "3" })).toBe("Go to slide 3");
  });

  it("replaces multiple placeholders, including numeric values", () => {
    expect(format("{current} of {total}", { current: 2, total: 5 })).toBe(
      "2 of 5",
    );
  });

  it("leaves a placeholder without a matching value as a literal", () => {
    // clave ausente con otras presentes: la presente se reemplaza, la
    // ausente queda literal (foundations/i18n.md)
    expect(format("{current} of {total} — {n}", { current: 2, total: 5 })).toBe(
      "2 of 5 — {n}",
    );
    expect(format("Read full testimonial from {author}", {})).toBe(
      "Read full testimonial from {author}",
    );
  });
});
