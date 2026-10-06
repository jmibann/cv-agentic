// Tests de `formatPeriod` (T7): RF-8 y spec §Tests esperados
// (años sueltos, año-mes en ambos extremos, `end: null`, ambos idiomas).
// Casos fijados en foundations/i18n.md → "Fechas y períodos".
import { describe, expect, it } from "vitest";

import { formatPeriod, formatPeriodEndpoint } from "./formatPeriod";

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

// T12 (Cambio F3): la privada `formatEndpoint` se exporta como
// `formatPeriodEndpoint` (la consume Timeline con `<time>` por extremo).
// Casos de spec §Tests esperados: año suelto tal cual; `"YYYY-MM"` → mes
// abreviado + año en en/es; coincidencia con cada extremo de `formatPeriod`.
describe("formatPeriodEndpoint", () => {
  it("returns a bare year unchanged in both locales", () => {
    expect(formatPeriodEndpoint("2015", "en")).toBe("2015");
    expect(formatPeriodEndpoint("2015", "es")).toBe("2015");
  });

  it("formats a month-year value with Intl in both locales", () => {
    expect(formatPeriodEndpoint("2019-03", "en")).toBe("Mar 2019");
    expect(formatPeriodEndpoint("2019-03", "es")).toBe("mar 2019");
  });

  it("matches each endpoint of formatPeriod over the same data", () => {
    for (const locale of ["en", "es"] as const) {
      const presentLabel = locale === "en" ? "Present" : "Actualidad";
      // período cerrado: ambos extremos del resultado vienen de la misma función
      const closed = formatPeriod(
        { start: "2019-03", end: "2021-11" },
        locale,
        presentLabel,
      ).split(" — ");
      expect(formatPeriodEndpoint("2019-03", locale)).toBe(closed[0]);
      expect(formatPeriodEndpoint("2021-11", locale)).toBe(closed[1]);
      // período abierto: el extremo de inicio sigue coincidiendo
      const open = formatPeriod(
        { start: "2015", end: null },
        locale,
        presentLabel,
      ).split(" — ");
      expect(formatPeriodEndpoint("2015", locale)).toBe(open[0]);
    }
  });
});
