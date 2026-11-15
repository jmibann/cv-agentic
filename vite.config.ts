// Single config for Vite and Vitest: the `test` block lives here.

import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  base: process.env.DEPLOY_TARGET === "gh-pages" ? "/cv-agentic/" : "/",
  resolve: {
    // Same alias as tsconfig.json; Vitest uses it too.
    alias: {
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // Tests import describe/it/expect from "vitest" explicitly.
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
  },
});
