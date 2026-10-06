// Formatea períodos de `education`/`experience` (foundations/i18n.md →
// "Fechas y períodos", RF-8). Función pura: sin React, sin DOM y sin
// depender de "hoy" (constitución C1); el texto del extremo abierto
// (`presentLabel`) entra por parámetro.
import { LOCALES } from "@data/constants";

// `Locale` = `"en" | "es"`. Se deriva de `LOCALES` (lista canónica de
// `@data/constants`): `schema.test.ts` (T8) garantiza que coincide con el
// `enum` del esquema, de donde saldrá el tipo generado en T8.
type Locale = (typeof LOCALES)[number];

/**
 * Devuelve `{start} — {end}` con el separador fijo `" — "`
 * (raya con espacios). `"YYYY"` se muestra tal cual; `"YYYY-MM"` se
 * formatea con `Intl.DateTimeFormat(locale, { month: "short",
 * year: "numeric" })` en cada extremo; `end: null` usa `presentLabel`.
 */
export function formatPeriod(
  period: { start: string; end: string | null },
  locale: Locale,
  presentLabel: string,
): string {
  const end = period.end === null ? presentLabel : formatPeriodEndpoint(period.end, locale);
  return `${formatPeriodEndpoint(period.start, locale)} — ${end}`;
}

/**
 * Formatea un extremo de un período (Cambio F3, decisión 12=a; lo consume
 * Timeline con `<time>` por extremo). `"YYYY"` se muestra tal cual;
 * `"YYYY-MM"` se formatea con `Intl.DateTimeFormat(locale, { month: "short",
 * year: "numeric" })`. `formatPeriod` usa esta misma función en ambos
 * extremos: no cambia firma ni comportamiento (los tests F1 de T7 siguen).
 */
export function formatPeriodEndpoint(value: string, locale: Locale): string {
  const [year, month] = value.split("-");
  if (year === undefined || month === undefined) {
    // "YYYY" sin mes: solo el año, sin formatear (así lo fija RF-8:
    // "2015 — Present"). La validez del formato la garantiza `data/cv.schema.json` (T9).
    return value;
  }
  // `new Date("2019-03")` se interpreta como UTC y en zonas horarias
  // negativas formatearía "Feb". Construir con componentes locales fija
  // que el mes mostrado sea siempre el del dato en cualquier zona.
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);
}
