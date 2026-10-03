// LocaleProvider + useLocale + useCv (T10): contrato de foundations/i18n.md
// §LocaleProvider y spec.md §API. RF-6 (setLocale fija <html lang>, persiste
// cv:locale y expone t y useCv() del idioma activo) y RF-5 (storage que lanza
// no rompe: el estado cambia igual en memoria). El estado inicial NO se
// recalcula: lo dejó resuelto el script anti-flash en `<html lang>`
// (i18n.md → "Resolución del idioma inicial"), igual que ThemeProvider con
// `data-theme` (T5).

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

// D3: las únicas claves de storage del sitio son cv:theme y cv:locale.
const STORAGE_KEY = "cv:locale";

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Idioma ya resuelto por el anti-flash: solo se lee el atributo (i18n.md →
// "Resolución del idioma inicial"; el provider "toma su estado inicial de
// ahí", no recalcula storage ni navegador). Un valor ausente o fuera de
// LOCALES (no inyectó el script, p. ej. tests huérfanos) cae en
// DEFAULT_LOCALE: "Default si no se puede resolver: en" (i18n.md,
// Decisiones), replicando la caída segura de readInitialTheme (T5).
function readInitialLocale(): Locale {
  const lang = document.documentElement.lang;
  return LOCALES.find((candidate): boolean => candidate === lang) ?? DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: LocaleProviderProps): ReactNode {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  // setLocale: actualiza el estado y guarda la elección. Si storage lanza,
  // el cambio queda solo en memoria (RF-5), como setTheme en T5.
  const setLocale = useCallback((next: Locale): void => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage bloqueado: nada que persistir, el estado ya cambió
    }
  }, []);

  // Un único efecto sincroniza <html lang> con el estado, venga de la
  // inicial (idempotente: el anti-flash ya dejó el mismo valor) o de
  // setLocale (RF-6); así `lang` nunca queda desincronizado del idioma
  // activo, igual que data-theme en ThemeProvider.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // t: textos de interfaz del idioma activo (spec.md §API: `t: UiStrings`;
  // plan T10: uiEn/uiEs según locale).
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

// useCv(): CvData del idioma activo; reacciona a setLocale porque lee el
// contexto. Fuera del provider lanza su propio error descriptivo (Estados de
// la spec: "Providers sin wrapper"; spec.md §API: ambos hooks con error).
// Los componentes nunca eligen el idioma ni importan el contenido: las
// páginas obtienen los datos acá (i18n.md → Hooks).
export function useCv(): CvData {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error(
      "useCv() debe usarse dentro de <LocaleProvider>: envolvé el componente en el provider.",
    );
  }
  return cvByLocale[context.locale];
}
