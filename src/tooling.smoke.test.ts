// Test de humo del andamiaje (T1): verifica que el runner (Vitest con jsdom,
// `globals: false`), el alias `@data/*` y la config de TypeScript resuelven
// antes de que exista cualquier código de la app.
import { describe, expect, it } from "vitest";

import { LOCALES } from "@data/constants";

describe("andamiaje del proyecto único", () => {
  it("resuelve el alias @data/* y ejecuta bajo jsdom", () => {
    expect(LOCALES).toEqual(["en", "es"]);
    // entorno jsdom activo (config `test.environment` de vite.config.ts)
    expect(typeof window).toBe("object");
  });
});
