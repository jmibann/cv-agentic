// Tests de `formatPeriod` (T7): RF-8 y spec §Tests esperados
// (años sueltos, año-mes en ambos extremos, `end: null`, ambos idiomas).
// Casos fijados en foundations/i18n.md → "Fechas y períodos".
import { describe, expect, it } from "vitest";

import { formatPeriod } from "./formatPeriod";

describe("formatPeriod", () => {
  it("renders an open-ended period with the present label in English", () => {
    expect(formatPeriod({ start: "2015", end: null }, "en", "Present")).toBe(
      "2015 — Present",
    );
  });

  it("renders an open-ended period with the present label in Spanish", () => {
    expect(formatPeriod({ start: "2015", end: null }, "es", "Actualidad")).toBe(
      "2015 — Actualidad",
    );
  });

  it("formats month-year endpoints with Intl in both locales", () => {
    // en capitaliza el mes abreviado; es lo deja en minúscula: ambos
    // salen de Intl.DateTimeFormat(locale, { month: "short", year: "numeric" })
    expect(
      formatPeriod({ start: "2019-03", end: "2021-11" }, "en", "Present"),
    ).toBe("Mar 2019 — Nov 2021");
    expect(
      formatPeriod({ start: "2019-03", end: "2021-11" }, "es", "Actualidad"),
    ).toBe("mar 2019 — nov 2021");
  });

  it("joins both endpoints with the em-dash separator in every case", () => {
    const periods = [
      formatPeriod({ start: "2015", end: null }, "en", "Present"),
      formatPeriod({ start: "2015", end: null }, "es", "Actualidad"),
      formatPeriod({ start: "2019-03", end: "2021-11" }, "en", "Present"),
      formatPeriod({ start: "2019-03", end: "2021-11" }, "es", "Actualidad"),
    ];
    for (const period of periods) {
      // separador exacto " — " (raya con espacios): dos partes y nada más
      expect(period.split(" — ")).toHaveLength(2);
    }
  });
});
