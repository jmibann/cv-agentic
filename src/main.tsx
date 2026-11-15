import { createRoot } from "react-dom/client";

// The only import of tokens.css: the file lives outside src/ and is not copied.
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
  throw new Error("main.tsx: no existe el elemento #root en index.html.");
}

createRoot(rootElement).render(
  <ThemeProvider>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </ThemeProvider>,
);
