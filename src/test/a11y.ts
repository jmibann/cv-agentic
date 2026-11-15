import axe from "axe-core";
import { expect } from "vitest";

/**
 * Disabled rules, both jsdom limitations: `color-contrast` (jsdom computes no
 * styles) and `region` (components are tested outside the page landmarks).
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
