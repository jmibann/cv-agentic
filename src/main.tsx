// Entry de la app (T11): importa los tokens (única vez, por ruta relativa —
// spec.md §Estilos: no se copian a src/), la fuente autohosteada Poppins en
// los cuatro pesos de foundations/typography.md, los estilos base y monta
// ThemeProvider > LocaleProvider > App. index.html ya resolvió tema,
// theme-color e idioma antes del primer frame (script anti-flash, T4): los
// providers leen ese estado, no lo recalculan. Sin StrictMode: la spec no lo
// fija y agregarlo sería alcance nuevo.

import { createRoot } from "react-dom/client";

// Única importación de tokens.css del proyecto, por ruta relativa: el archivo
// vive fuera de src/ y no se copia (spec.md §Estilos y tokens).
import "../tokens/tokens.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "./styles/global.css";

import { App } from "./App";
import { LocaleProvider } from "./providers/LocaleProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

const rootElement = document.getElementById("root");
if (rootElement === null) {
  // El #root vive en index.html (T4): si falta, el documento no es el del
  // proyecto. No hay fallback posible: falla temprano y en español (L1).
  throw new Error("main.tsx: no existe el elemento #root en index.html.");
}

createRoot(rootElement).render(
  <ThemeProvider>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </ThemeProvider>,
);
