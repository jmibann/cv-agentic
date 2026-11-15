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
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}

// The site only ever writes two storage keys: cv:theme and cv:locale.
const STORAGE_KEY = "cv:theme";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | null>(null);

// The anti-flash script in index.html already resolved the theme; this only
// reads it. Falls back to "light" when the attribute is missing (e.g. tests).
function readInitialTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// null when nothing is stored or when storage throws (private mode): both
// mean "follow the system".
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

  // Tells the first mount from interactive changes: the first paint was already
  // resolved by the anti-flash script, so nothing is suppressed there.
  const mountedRef = useRef(false);

  const setTheme = useCallback((next: Theme): void => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is blocked: nothing to persist, the state already changed.
    }
  }, []);

  const toggleTheme = useCallback((): void => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  // A single effect applies the theme and then syncs <meta name="theme-color">
  // with --color-bg, read after data-theme is set, so the two never drift.
  // It is a layout effect because the switching attribute must be added in the
  // same commit, before the new data-theme is written, for the global rule to
  // cut the color transitions. It is removed two animation frames later.
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

  // System changes apply live only while there is no stored preference.
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
      "useTheme() must be used within <ThemeProvider>: wrap the component in the provider.",
    );
  }
  return context;
}
