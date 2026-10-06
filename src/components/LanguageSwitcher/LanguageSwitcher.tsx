// LanguageSwitcher — control segmentado de idioma del sitio (EN / ES)
// (specs/controls/LanguageSwitcher/spec.md). T1 hecha: el grupo con una opción
// por cada valor de `LOCALES` de `@data/constants`, en ese orden (RF-1) y
// RF-4: `div role="group"` con `aria-label={label}` y un
// `<button type="button">` por locale con su `aria-label` fijo ("English" /
// "Español") y su atributo `lang` propio; la `className` del consumidor va
// UNIDA a la clase base del raíz (G-B, #99). T2 hecha: `useLocale()` (excepción
// C2 documentada, igual que ThemeToggle con `useTheme`), `aria-pressed={locale
// === code}` del idioma activo (RF-2, spec → Estados) y `onClick` →
// `setLocale(code)` SOLO si el idioma no está activo (guard RF-3, decisión
// 2=a del plan; spec → "No hacer"); RF-5 no pide código: ambos `<button>` son
// tab stops consecutivos NATIVOS (no es radiogroup: sin roles de grupo, sin
// manejo de flechas). T3 hará: estilos por tokens en el módulo, `index.ts` y
// cierre a11y de los tests.
// G-A / "No hacer" (spec): este componente NO lee ni escribe
// `localStorage["cv:locale"]` ni toca `document.documentElement.lang`: la
// aplicación del cambio y la persistencia son del LocaleProvider. "No hacer":
// no es radiogroup (dos botones simples, tab stops consecutivos) y los nombres
// de idioma NO se traducen (sale de `LOCALES`, nunca de una lista propia).

import { LOCALES } from "@data/constants";
import type { Locale } from "@data/cv.types.generated";

import { useLocale } from "../../providers/LocaleProvider";

import styles from "./LanguageSwitcher.module.css";

// API (spec → API): el label del grupo llega traducido por prop (C3: nada
// hardcodeado; ControlsBar lo pasa desde useLocale().t). La lectura de
// `useLocale()` (T2) acá es la excepción documentada a "props en, eventos
// fuera" (specs/README.md → excepciones de C2, misma que ThemeToggle).
export interface LanguageSwitcherProps {
  /** Label del grupo, ya traducido. Ej: "Language" / "Idioma". */
  label: string;
  /** Se une a la clase base del `role="group"` raíz (G-B). */
  className?: string;
}

// Nombres fijos, NO traducidos (spec → API, tabla "Nombres fijos"): mapa
// locale → (texto visible, aria-label, lang). RF-1/"No hacer": la lista de
// idiomas recorre `LOCALES` (@data/constants), este mapa solo fija los nombres
// por locale; si el esquema creciera, `Record<Locale, …>` obliga a completar
// (tsc) — criterio espejo del exhaustivo de BrandIcon sobre SOCIAL_NETWORKS.
// Constante LOCAL del módulo: el plan la deja sin exportar (plan → Funciones
// puras: "por defecto quedan sin exportar"; sin mandato de #100 no entra a
// `allowExportNames`).
const LOCALE_OPTIONS: Record<
  Locale,
  { text: string; ariaLabel: string; lang: string }
> = {
  en: { text: "EN", ariaLabel: "English", lang: "en" },
  es: { text: "ES", ariaLabel: "Español", lang: "es" },
};

export function LanguageSwitcher({
  label,
  className,
}: LanguageSwitcherProps) {
  // RF-2 (T2): el estado activo y el cambio vienen del contexto de idioma
  // (spec → API: "Consume useLocale()"), la excepción C2 documentada en
  // specs/README.md, misma que ThemeToggle. El componente NO lee ni escribe
  // storage ni DOM global (G-A): solo invoca setLocale(code) y deja que el
  // LocaleProvider aplique `<html lang>` y `cv:locale`.
  const { locale, setLocale } = useLocale();

  // T1 (G-B, unión canónica #99): la clase base va primera y se le UNE la
  // externa (no la reemplaza). Mismo mecanismo aprobado en
  // Box/Icon/BrandIcon/Badge/IconBox/ThemeToggle: array + filtro de undefined
  // + join, sin librerías; así no queda una clase vacía cuando `className` no
  // se pasa. `styles.languageSwitcher` es `string | undefined` bajo
  // noUncheckedIndexedAccess.
  const rootClassName = [styles.languageSwitcher, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // RF-1: un botón por `LOCALES`, EN ESE ORDEN (map sobre la lista, nunca
  // JSX fijo por idioma). RF-4: `type="button"` (botón de acción, no submit),
  // `aria-label` fijo por locale y `lang` propio para pronunciación (spec →
  // Accesibilidad). T2: `aria-pressed={isActive}` (RF-2 / Estados: activa con
  // "true", inactiva con "false") y `onClick` con el guard RF-3 (decisión 2=a:
  // click en el activo NO invoca setLocale). RF-5: sin código — dos botones
  // nativos son tab stops consecutivos; "No hacer": cero patrón radiogroup.
  return (
    <div role="group" aria-label={label} className={rootClassName}>
      {LOCALES.map((code) => {
        const option = LOCALE_OPTIONS[code];
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            lang={option.lang}
            aria-label={option.ariaLabel}
            aria-pressed={isActive}
            onClick={() => {
              // Guard RF-3: elegir el idioma ya activo no invoca setLocale
              // (spec → Accesibilidad: "Hacer click en el idioma activo no
              // hace nada (sigue presionado)"; "No hacer").
              if (!isActive) {
                setLocale(code);
              }
            }}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}
