import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "../../providers/LocaleProvider";
import { ThemeProvider } from "../../providers/ThemeProvider";

import { ControlsBar } from "./ControlsBar";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./ControlsBar.module.css";

const GROUP_LABEL_EN = "Display settings";
const GROUP_LABEL_ES = "Ajustes de visualización";
const DARK_MODE_LABEL_EN = "Dark mode";
const DARK_MODE_LABEL_ES = "Modo oscuro";
const LS_GROUP_LABEL_EN = "Language";
const LS_GROUP_LABEL_ES = "Idioma";

const ENGLISH_LABEL = "English";
const SPANISH_LABEL = "Español";

const controlsBarClass = styles.controlsBar ?? "controlsBar";
const groupClass = styles.group ?? "group";

function renderBar() {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <ControlsBar />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

describe("ControlsBar banner with named group (T1: RF-2)", () => {
  it("renders a banner containing a Display settings group with both controls inside", () => {
    renderBar();

    const banner = screen.getByRole("banner");
    const group = within(banner).getByRole("group", { name: GROUP_LABEL_EN });

    within(group).getByRole("button", { name: DARK_MODE_LABEL_EN });

    const switcher = within(group).getByRole("group", {
      name: LS_GROUP_LABEL_EN,
    });
    within(switcher).getByRole("button", { name: ENGLISH_LABEL });
    within(switcher).getByRole("button", { name: SPANISH_LABEL });
  });
});

describe("ControlsBar translated child labels on locale change (T1: RF-3)", () => {
  it("switching to Español renames the group and the ThemeToggle label while option names stay fixed", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(screen.getByRole("button", { name: SPANISH_LABEL }));

    expect(
      screen.getByRole("group", { name: GROUP_LABEL_ES }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: GROUP_LABEL_EN }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: DARK_MODE_LABEL_ES }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("group", { name: LS_GROUP_LABEL_ES }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: LS_GROUP_LABEL_ES })).getByRole(
        "button",
        { name: ENGLISH_LABEL },
      ),
    ).toBeInTheDocument();
  });
});

describe("ControlsBar className joining (T1: spec → API, G-B)", () => {
  // extra: the API requires joining the className; the expected tests omit it.
  it("joins an external className to the base class on the root banner header", () => {
    const consumerClass = "app-layout-controls";

    render(
      <ThemeProvider>
        <LocaleProvider>
          <ControlsBar className={consumerClass} />
        </LocaleProvider>
      </ThemeProvider>,
    );

    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass(controlsBarClass);
    expect(banner).toHaveClass(consumerClass);
  });
});

describe("ControlsBar print hook on the root banner (T3: RF-6)", () => {
  it("renders data-print-hide on the root banner header", () => {
    renderBar();

    expect(screen.getByRole("banner")).toHaveAttribute("data-print-hide");
  });
});

describe("ControlsBar controls group flex container (T4: RF-1, RF-6)", () => {
  // extra: structural regression guard for the inner flex container.
  it("applies the group class to the inner named group", () => {
    renderBar();

    const group = screen.getByRole("group", { name: GROUP_LABEL_EN });
    expect(group).toHaveClass(groupClass);
  });
});

describe("ControlsBar accessibility audit (T2: cierre, spec → Tests)", () => {
  it("has no accessibility violations with the default English/light branch", async () => {
    const { container } = renderBar();

    expect(
      screen.getByRole("group", { name: GROUP_LABEL_EN }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });
});
