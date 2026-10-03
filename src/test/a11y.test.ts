import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "./a11y";

describe("expectNoA11yViolations", () => {
  it("fails on an <img> without alt, listing id (impact): targets", async () => {
    const { container } = render('<img src="/pixel.png" />');

    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /image-alt \([^)]*\): .*img/,
    );
  });

  it("passes on a button with accessible text", async () => {
    const { container } = render("<button>Save changes</button>");

    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
  });

  it("ignores the region rule for isolated components", async () => {
    // Content outside any landmark: the `region` rule would flag it if enabled.
    const { container } = render("<p>Standalone paragraph, no landmark needed.</p>");

    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();
  });
});
