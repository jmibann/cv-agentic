import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { CvData, Locale } from "@data/cv.types.generated";
import { DEFAULT_LOCALE, LOCALES } from "@data/constants";

import { cvByLocale } from "../content";
import { uiEn, type UiStrings } from "../i18n/ui.en";
import { uiEs } from "../i18n/ui.es";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: UiStrings;
}

export interface LocaleProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "cv:locale";

const LocaleContext = createContext<LocaleContextValue | null>(null);

// The anti-flash script already resolved the language; this only reads
// <html lang> and falls back to the default when it is missing or invalid.
function readInitialLocale(): Locale {
  const lang = document.documentElement.lang;
  return LOCALES.find((candidate): boolean => candidate === lang) ?? DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: LocaleProviderProps): ReactNode {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = useCallback((next: Locale): void => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is blocked: nothing to persist, the state already changed.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t: UiStrings = locale === "es" ? uiEs : uiEn;
  const value: LocaleContextValue = { locale, setLocale, t };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error(
      "useLocale() debe usarse dentro de <LocaleProvider>: envolvé el componente en el provider.",
    );
  }
  return context;
}

/** Pages read the content here; components never import it or pick the language. */
export function useCv(): CvData {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error(
      "useCv() debe usarse dentro de <LocaleProvider>: envolvé el componente en el provider.",
    );
  }
  return cvByLocale[context.locale];
}
