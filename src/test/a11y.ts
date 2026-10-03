import axe from "axe-core";
import { expect } from "vitest";

/**
 * Ejecuta axe-core sobre `container` y falla el test si hay violaciones de
 * accesibilidad. El mensaje de fallo lista cada violación como
 * `id (impact): targets`.
 *
 * Reglas deshabilitadas (limitaciones de jsdom, ver la spec de foundation):
 * - `color-contrast`: jsdom no calcula estilos (el contraste lo cubren
 *   `docs/tokens/contrast.md` y la QA visual).
 * - `region`: los componentes se prueban aislados, fuera de los landmarks
 *   de la página.
 */
export async function expectNoA11yViolations(
  container: Element,
): Promise<void> {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });

  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact ?? "?"}): ${v.nodes
        .map((n) => n.target.join(" "))
        .join(", ")}`,
  );

  expect(summary, "axe violations").toEqual([]);
}
