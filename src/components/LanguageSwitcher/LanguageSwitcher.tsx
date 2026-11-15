import { LOCALES } from "@data/constants";
import type { Locale } from "@data/cv.types.generated";

import { useLocale } from "../../providers/LocaleProvider";

import styles from "./LanguageSwitcher.module.css";

export interface LanguageSwitcherProps {
  label: string;
  className?: string;
}

// Fixed names, never translated. Record<Locale, …> forces an entry for every
// locale the schema adds.
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
  // Reads the locale context: the same deliberate exception as ThemeToggle.
  const { locale, setLocale } = useLocale();

  const rootClassName = [styles.languageSwitcher, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // Each button carries its own `lang` so the name is pronounced correctly.
  return (
    <div role="group" aria-label={label} className={rootClassName}>
      {LOCALES.map((code) => {
        const option = LOCALE_OPTIONS[code];
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            className={styles.option}
            lang={option.lang}
            aria-label={option.ariaLabel}
            aria-pressed={isActive}
            onClick={() => {
              // Choosing the language that is already active does nothing.
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
