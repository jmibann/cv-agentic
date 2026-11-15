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

    expect(screen.getByRole("banner")).toBeInTheDocument();

    // The inactive page's h1 sits under `hidden`, so only one is accessible.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

    expect(screen.getByRole("tablist")).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });
});
