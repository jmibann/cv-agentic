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
    // English capitalises the short month and Spanish does not; both come from
    // Intl.DateTimeFormat.
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
      expect(period.split(" — ")).toHaveLength(2);
    }
  });
});

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
      const closed = formatPeriod(
        { start: "2019-03", end: "2021-11" },
        locale,
        presentLabel,
      ).split(" — ");
      expect(formatPeriodEndpoint("2019-03", locale)).toBe(closed[0]);
      expect(formatPeriodEndpoint("2021-11", locale)).toBe(closed[1]);
      const open = formatPeriod(
        { start: "2015", end: null },
        locale,
        presentLabel,
      ).split(" — ");
      expect(formatPeriodEndpoint("2015", locale)).toBe(open[0]);
    }
  });
});
