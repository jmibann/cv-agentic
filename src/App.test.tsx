// Smoke del App provisorio (T11): "Tests esperados → Tooling (smoke)" de
// specs/foundation/Foundation/spec.md — "el render del App provisorio con el
// helper de axe". La spec no fija un wrapper de test propio, así que el test
// envuelve <App /> en los providers reales en el mismo orden que monta
// src/main.tsx (ThemeProvider > LocaleProvider > App): el smoke replica la
// composición real sin importar main.tsx (main ejecuta createRoot sobre el
// DOM y no es importable desde un test).

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";
import { LocaleProvider } from "./providers/LocaleProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { expectNoA11yViolations } from "./test/a11y";

describe("App placeholder", () => {
  it("renders an interface string from t and the profile name from useCv", async () => {
    const { container } = render(
      <ThemeProvider>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>,
    );

    // t.about.title → "About Me" (uiEn; sin <html lang> el provider cae en
    // DEFAULT_LOCALE "en") y cv.profile.name → "Alex Rivera" (contenido de
    // ejemplo validado en T9). Son los dos textos que exige la Anatomía:
    // "renderiza un texto de `t` y el nombre de `useCv()`".
    expect(screen.getByText("About Me")).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();

    // Accesibilidad (spec.md): el App provisorio debe pasar el helper de axe.
    await expectNoA11yViolations(container);
  });
});
