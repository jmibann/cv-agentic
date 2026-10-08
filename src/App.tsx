// App (AppLayout T6): reemplazo del provisorio de F1 — autorizado por la spec
// de Foundation (spec.md → Anatomía: "App provisorio… lo reemplaza el
// integrator en F4") y documentado en specs/layout/AppLayout/plan.md →
// Decisiones ("Reemplazo de App.tsx y adaptación de App.test.tsx (T6)") junto
// con la adaptación de su smoke. App sin contenido propio: renderiza
// <AppLayout /> (import por barrel ./components/AppLayout, la superficie
// pública de la pieza), sin props, sin CSS ni markup: todo el layout, los
// landmarks y los textos viven en AppLayout y sus hijos.
// Providers: ThemeProvider > LocaleProvider siguen montándose POR ENCIMA de
// App en src/main.tsx (contrato de sus specs y de AppLayout → API: "Requiere
// ThemeProvider y LocaleProvider por encima (los monta main.tsx)"); el script
// anti-flash de index.html ya resolvió tema e idioma antes del primer frame y
// los providers lo leen, no lo recalculan.

import type { ReactNode } from "react";

import { AppLayout } from "./components/AppLayout";

export function App(): ReactNode {
  return <AppLayout />;
}
