import { LOCALES } from "@data/constants";

type Locale = (typeof LOCALES)[number];

/** The open-ended label is a parameter, so the result never depends on today. */
export function formatPeriod(
  period: { start: string; end: string | null },
  locale: Locale,
  presentLabel: string,
): string {
  const end = period.end === null ? presentLabel : formatPeriodEndpoint(period.end, locale);
  return `${formatPeriodEndpoint(period.start, locale)} — ${end}`;
}

export function formatPeriodEndpoint(value: string, locale: Locale): string {
  const [year, month] = value.split("-");
  if (year === undefined || month === undefined) {
    return value;
  }
  // new Date("2019-03") is parsed as UTC and would show the previous month in
  // negative time zones. Local components keep the month stable everywhere.
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);
}
