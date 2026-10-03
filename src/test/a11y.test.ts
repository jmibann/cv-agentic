import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "./a11y";

describe("expectNoA11yViolations", () => {
  it("fails on an <img> without alt, listing id (impact): targets", async () => {
    const { container } = render(createElement("img", { src: "/pixel.png" }));

    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /image-alt \([^)]*\): .*img/,
    );
  });

  it("passes on a button with accessible text", async () => {
    const { container } = render(
      createElement("button", null, "Save changes"),
    );

    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
  });

  it("ignores the region rule for isolated components", async () => {
    // Contenido fuera de cualquier landmark: la regla `region` lo marcaría
    // si estuviera habilitada.
    const { container } = render(
      createElement("p", null, "Standalone paragraph, no landmark needed."),
    );

    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();
  });
});
