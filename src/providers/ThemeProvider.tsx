// ThemeProvider + useTheme (T5): contrato de foundations/theming.md §ThemeProvider.
// RF-2 (toggle alterna data-theme + persiste), RF-3 (segue al sistema sin
// preferencia), RF-4 (meta theme-color sincronizado), RF-5 (storage que lanza
// no rompe). El estado inicial NO se recalcula: lo dejó resuelto el script
// anti-flash en `data-theme` (index.html).
// T16 (Cambio motion #106) agrega RF-9: supresión de transiciones durante el
// cambio de tema (data-theme-switching + doble requestAnimationFrame).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  // setTheme no tiene RF propio (Clarificación F1 #2, opción A): es la vía
  // explícita de setTheme/toggleTheme, que sí persiste.
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}

// D3: las únicas claves de storage del sitio son cv:theme y cv:locale.
const STORAGE_KEY = "cv:theme";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Tema ya resuelto por el anti-flash: solo se lee el atributo. Un valor
// ausente o inválido (no inyectó el script, p. ej. tests huérfanos) cae en
// "light", el default de la resolución de theming.md.
function readInitialTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// Preferencia guardada, con lectura segura (RF-5): null si no hay o si
// storage lanza (modo privado); en ese último caso seguir al sistema es el
// fallback coherente con "no hay preferencia".
function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: ThemeProviderProps): ReactNode {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  // RF-9: distingue el montaje inicial de los cambios interactivos
  // (plan #106 §decisión 1). El primer paint ya lo resolvió el anti-flash,
  // así que ahí no se suprime nada; el flag se levanta en el primer efecto.
  const mountedRef = useRef(false);

  // setTheme: actualiza el estado y guarda la elección (fin del seguimiento
  // del sistema, RF-3). Si storage lanza, el cambio queda solo en memoria (RF-5).
  const setTheme = useCallback((next: Theme): void => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage bloqueado: nada que persistir, el estado ya cambió
    }
  }, []);

  const toggleTheme = useCallback((): void => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  // Un ÚNICO efecto aplica el tema resuelto, venga del toggle o de un cambio
  // de prefers-color-scheme (theming.md): fija data-theme en <html> y luego
  // sincroniza <meta name="theme-color"> con --color-bg leído después de
  // aplicar data-theme. Así el meta nunca queda desincronizado (RF-4).
  // RF-9 (plan #106 §decisión 1): es useLayoutEffect y en el MISMO commit
  // agrega `data-theme-switching` ANTES de escribir el nuevo data-theme, para
  // que la regla global de src/styles/global.css (`:root[data-theme-switching]
  // *`, (0,2,0), sin `!important`) corte las transiciones de color del cambio.
  // La remoción va tras doble requestAnimationFrame (§decisión 2); el cleanup
  // corre al desmontar Y al re-entrar el efecto (segundo cambio rápido):
  // cancela el frame pendiente y remueve el atributo sin dejar estado huérfano.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const interactive = mountedRef.current;
    mountedRef.current = true;
    let frameId: number | null = null;

    if (interactive) {
      root.dataset.themeSwitching = "";
    }

    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta !== null) {
      meta.setAttribute(
        "content",
        window.getComputedStyle(root).getPropertyValue("--color-bg"),
      );
    }

    if (interactive) {
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(() => {
          frameId = null;
          root.removeAttribute("data-theme-switching");
        });
      });
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      root.removeAttribute("data-theme-switching");
    };
  }, [theme]);

  // RF-3: mientras no exista preferencia guardada, los cambios del sistema
  // se aplican en vivo; con preferencia, se ignoran.
  useEffect(() => {
    const mediaQueryList = window.matchMedia(DARK_SCHEME_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
      if (readStoredTheme() !== null) {
        return;
      }
      setThemeState(event.matches ? "dark" : "light");
    };
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, []);

  const value: ThemeContextValue = { theme, setTheme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error(
      "useTheme() debe usarse dentro de <ThemeProvider>: envolvé el componente en el provider.",
    );
  }
  return context;
}
