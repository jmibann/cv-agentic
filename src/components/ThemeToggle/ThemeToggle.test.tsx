import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../../providers/ThemeProvider";
import { expectNoA11yViolations } from "../../test/a11y";

import { ThemeToggle } from "./ThemeToggle";

import styles from "./ThemeToggle.module.css";

const DARK_LABEL = "Dark mode";
const LIGHT_LABEL = "Light mode";

const themeToggleClass = styles.themeToggle ?? "themeToggle";

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle darkModeLabel={DARK_LABEL} lightModeLabel={LIGHT_LABEL} />
    </ThemeProvider>,
  );
}

describe("ThemeToggle light render (T1: RF-2, RF-3)", () => {
  it("shows an unpressed icon-only button labelled Dark mode with the moon glyph in light theme", () => {
    const { container } = renderToggle();

    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    expect(container.querySelector("svg")).toHaveClass("lucide-moon");
  });
});

describe("ThemeToggle toggle integration (T1: RF-1, RF-6)", () => {
  it("click calls toggleTheme: pressed true, label Light mode, sun glyph, data-theme and storage updated", async () => {
    const user = userEvent.setup();
    const { container } = renderToggle();

    await user.click(screen.getByRole("button", { name: DARK_LABEL }));

    const button = screen.getByRole("button", { name: LIGHT_LABEL });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("cv:theme")).toBe("dark");

    expect(container.querySelector("svg")).toHaveClass("lucide-sun");
  });

  it("second click returns to light: label, pressed, sun→moon, data-theme and storage back to light", async () => {
    const user = userEvent.setup();
    const { container } = renderToggle();

    await user.click(screen.getByRole("button", { name: DARK_LABEL }));
    await user.click(screen.getByRole("button", { name: LIGHT_LABEL }));

    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("cv:theme")).toBe("light");
    expect(container.querySelector("svg")).toHaveClass("lucide-moon");
  });
});

describe("ThemeToggle className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root button", () => {
    const consumerClass = "controls-bar-toggle";

    render(
      <ThemeProvider>
        <ThemeToggle
          darkModeLabel={DARK_LABEL}
          lightModeLabel={LIGHT_LABEL}
          className={consumerClass}
        />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveClass(themeToggleClass);
    expect(button).toHaveClass(consumerClass);
  });
});

describe("ThemeToggle keyboard operation (T2: RF-4)", () => {
  it("focuses with Tab and toggles with Space via native button activation", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.tab();
    const button = screen.getByRole("button", { name: DARK_LABEL });
    expect(button).toHaveFocus();

    await user.keyboard(" ");
    const pressedButton = screen.getByRole("button", { name: LIGHT_LABEL });
    expect(pressedButton).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("cv:theme")).toBe("dark");

    await user.keyboard(" ");
    const releasedButton = screen.getByRole("button", { name: DARK_LABEL });
    expect(releasedButton).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("cv:theme")).toBe("light");
  });
});

describe("ThemeToggle accessibility audit (T3: RF-4, RF-5)", () => {
  it("has no accessibility violations in the light branch (moon, Dark mode label)", async () => {
    const { container } = renderToggle();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations in the dark branch (sun, Light mode label)", async () => {
    // Seeds the dark theme as the anti-flash script would. Without it this case
    // would silently duplicate the light one.
    document.documentElement.dataset.theme = "dark";
    const { container } = renderToggle();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await expectNoA11yViolations(container);
  });
});
