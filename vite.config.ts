// Config única de Vite y de Vitest (decisión 1 del plan de Foundation):
// el bloque `test` vive acá, no en un `vitest.config.ts` separado.
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  base: process.env.DEPLOY_TARGET === "gh-pages" ? "/cv-agentic/" : "/",
  resolve: {
    // Alias @data/* → data/* (decisión #42), el mismo de tsconfig.json;
    // también lo usa Vitest.
    alias: {
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // `globals: false` (decisión #48): los tests importan describe/it/expect
    // desde "vitest".
    globals: false,
    // Setup global de los tests (T2): jest-dom, afterEach(cleanup) explícito,
    // mocks de matchMedia/ResizeObserver/scrollTo/dialog y limpieza de
    // localStorage, data-theme, lang y hash entre tests.
    setupFiles: ["./src/test/setup.ts"],
  },
});
