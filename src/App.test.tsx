// Smoke de integración (AppLayout T6): REEMPLAZO autorizado del smoke del App
// provisorio de F1 — no es debilitamiento: la spec de Foundation
// (specs/foundation/Foundation/spec.md → Anatomía) declara el App "provisorio:
// renderiza un texto de `t` y el nombre de `useCv()`; **lo reemplaza el
// integrator en F4**", y `specs/layout/AppLayout/plan.md` → Decisiones fija
// textualmente "Reemplazo de App.tsx y adaptación de App.test.tsx (T6): borrar
// las aserciones del placeholder NO es debilitar un test vigente — es el
// reemplazo autorizado… El test adaptado hace smoke: render(<App/>) → banner +
// h1 + tablist existen". Es el único caso en que un `test(<Name>): Tn` toca un
// archivo de test ajeno a la pieza, y está cubierto por esa doble
// documentación (precedente de update dentro de tarea aprobado en la puerta:
// F3/TestimonialCarousel T5, citado por el propio plan).
//
// Wrapper: replica el envoltorio EXACTO de src/main.tsx (ThemeProvider >
// LocaleProvider > App) — mismo criterio que el smoke anterior; main.tsx no es
// importable desde un test (ejecuta `createRoot` sobre el DOM).
//
// Verde on-arrival declarado (#101, criterio de la pieza T2–T4): el smoke pasa
// contra la implementación existente en cuanto `App.tsx` renderiza AppLayout
// (T5 cerró la pieza componible); en el commit de tests, sin embargo, nace
// ROJO real porque el `.tsx` aún es el provisorio de F1 (sin banner/h1/
// tablist). Discrimen: si `App` dejara de montar `<AppLayout />` (o los
// providers se movieran por debajo de App rompiendo el contrato de sus specs),
// `banner`, `h1` y `tablist` desaparecen → rojo; el cierre axe sobre el
// documento completo es la capa integrada del test 10 de AppLayout (que cubre
// las 4 combinaciones tab×idioma dentro de su propio archivo — acá se audita
// una vez, a través del componente de entrada real).

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";
import { LocaleProvider } from "./providers/LocaleProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { expectNoA11yViolations } from "./test/a11y";

describe("App integration smoke (AppLayout T6: App renders AppLayout)", () => {
  it("renders the composed page through the entry providers: banner, unique h1 and tablist present, no a11y violations", async () => {
    const { container } = render(
      <ThemeProvider>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>,
    );

    // Los tres elementos que fija el plan → Decisiones T6 ("banner + h1 +
    // tablist existen"), por rol canónico:
    // banner: el <header> único de ControlsBar dentro del container.
    expect(screen.getByRole("banner")).toBeInTheDocument();

    // h1 del panel: presente y ÚNICO accesible (criterio RF-1 de AppLayout:
    // el h1 de la página inactiva vive bajo `hidden` y queda excluido).
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

    // tablist de NavTabs (la navegación que AppLayout cablea con useHashTab).
    expect(screen.getByRole("tablist")).toBeInTheDocument();

    // Cierre a11y del documento integrado (constitución T4; helpers del kit
    // con color-contrast/region desactivados — limitaciones jsdom).
    await expectNoA11yViolations(container);
  });
});
