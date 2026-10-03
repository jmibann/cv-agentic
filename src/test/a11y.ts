import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe-core against `container` and fails the test if there are any
 * a11y violations. The failure message lists each violation as
 * `id (impact): targets`.
 *
 * Disabled rules (jsdom limitations, see foundations spec):
 * - `color-contrast`: jsdom does not compute styles (contrast is covered by
 *   `docs/tokens/contrast.md` and the visual QA).
 * - `region`: components are tested isolated, outside page landmarks.
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
