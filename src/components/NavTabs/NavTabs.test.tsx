import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getTabId, NavTabs } from "./NavTabs";
import type { NavTabItem, NavTabsProps } from "./NavTabs";

import { expectNoA11yViolations } from "../../test/a11y";

import cornerTabStyles from "../CornerTab/CornerTab.module.css";

const cornerTabBaseClass = cornerTabStyles.cornerTab ?? "cornerTab";

const TAB_ITEMS: readonly NavTabItem[] = [
  { id: "about", label: "About" },
  { id: "resume", label: "Resume" },
];
const PANEL_ID = "main-panel";
const LABEL = "Sections";

function renderNavTabs(overrides: Partial<NavTabsProps> = {}) {
  const props: NavTabsProps = {
    items: TAB_ITEMS,
    activeId: "about",
    onChange: vi.fn(),
    panelId: PANEL_ID,
    label: LABEL,
    ...overrides,
  };
  return render(<NavTabs {...props} />);
}

describe("NavTabs tablist, roving tabindex and empty state (T1: RF-1, RF-2, RF-7)", () => {
  it("renders a named horizontal tablist with one tab per item in order", () => {
    renderNavTabs();

    const tablist = screen.getByRole("tablist", { name: LABEL });
    expect(tablist).toHaveAttribute("aria-orientation", "horizontal");

    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(TAB_ITEMS.length);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["About", "Resume"]);

    expect(screen.getByRole("tab", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resume" })).toBeInTheDocument();
  });

  it("gives each tab its getTabId id and points every tab to the same panelId", () => {
    renderNavTabs();

    for (const item of TAB_ITEMS) {
      const tab = screen.getByRole("tab", { name: item.label });
      expect(tab).toHaveAttribute("id", getTabId(item.id));
      expect(tab).toHaveAttribute("aria-controls", PANEL_ID);
    }
  });

  it("sets aria-selected and roving tabIndex only on the active tab", () => {
    renderNavTabs();

    const activeTab = screen.getByRole("tab", { name: "About" });
    const inactiveTab = screen.getByRole("tab", { name: "Resume" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(activeTab).toHaveAttribute("tabindex", "0");
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");
    expect(inactiveTab).toHaveAttribute("tabindex", "-1");
  });

  it("renders nothing when items is empty", () => {
    const { container } = renderNavTabs({ items: [] });

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("maps item ids to tab element ids with the tab- prefix", () => {
    expect(getTabId("about")).toBe("tab-about");
    expect(getTabId("resume")).toBe("tab-resume");
  });

  // extra: the className reaches the root. Coexistence is asserted, not order.
  it("transmits an external className to the piece root, joined with the CornerTab base class", () => {
    const consumerClass = "nav-tabs-external";

    renderNavTabs({ className: consumerClass });

    const root = screen.getByRole("tablist").parentElement;
    expect(root).not.toBeNull();
    expect(root).toHaveClass(consumerClass);
    expect(root).toHaveClass(cornerTabBaseClass);
  });
});

describe("NavTabs click activation and active-tab guard (T2: RF-3)", () => {
  it("calls onChange once with the item id when an inactive tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    await user.click(screen.getByRole("tab", { name: "Resume" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
  });

  it("does not call onChange when the already-active tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    const activeTab = screen.getByRole("tab", { name: "About" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    await user.click(activeTab);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("NavTabs keyboard roving and Space activation (T3: RF-4)", () => {
  it("wraps ArrowRight from the last focused tab to the first, focusing and emitting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ activeId: "resume", onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("about");
  });

  it("wraps ArrowLeft from the first focused tab to the last, focusing and emitting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");

    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
  });

  it("Home from the focused last tab moves focus to the first and emits its onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ activeId: "resume", onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();

    await user.keyboard("{Home}");

    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("about");
  });

  it("End from the focused first tab moves focus to the last and emits its onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    await user.tab();
    expect(screen.getByRole("tab", { name: "About" })).toHaveFocus();

    await user.keyboard("{End}");

    expect(screen.getByRole("tab", { name: "Resume" })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
  });

  it("keeps focus on the only tab and emits nothing when arrows are pressed with a single item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ items: [{ id: "about", label: "About" }], onChange });

    await user.tab();
    const onlyTab = screen.getByRole("tab", { name: "About" });
    expect(onlyTab).toHaveAttribute("aria-selected", "true");
    expect(onlyTab).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(onlyTab).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(onlyTab).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("prevents the default on Space over a focused inactive tab and emits exactly once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    const inactiveTab = screen.getByRole("tab", { name: "Resume" });
    // Direct focus on the inactive tab: the pure keyboard path, without a click.
    inactiveTab.focus();
    expect(inactiveTab).toHaveFocus();

    const keydownEvents: KeyboardEvent[] = [];
    inactiveTab.addEventListener("keydown", (event) => {
      keydownEvents.push(event);
    });

    await user.keyboard(" ");

    expect(keydownEvents).toHaveLength(1);
    expect(keydownEvents[0]?.defaultPrevented).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("resume");
    expect(inactiveTab).toHaveFocus();
  });

  it("prevents the default on Space over the already-active tab without emitting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ onChange });

    const activeTab = screen.getByRole("tab", { name: "About" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    await user.tab();
    expect(activeTab).toHaveFocus();

    const keydownEvents: KeyboardEvent[] = [];
    activeTab.addEventListener("keydown", (event) => {
      keydownEvents.push(event);
    });

    await user.keyboard(" ");

    expect(keydownEvents).toHaveLength(1);
    expect(keydownEvents[0]?.defaultPrevented).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(activeTab).toHaveFocus();
  });

  it("leaves ArrowUp and ArrowDown without effect on a focused tab (horizontal tablist)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderNavTabs({ activeId: "resume", onChange });

    await user.tab();
    const focusedTab = screen.getByRole("tab", { name: "Resume" });
    expect(focusedTab).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(focusedTab).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{ArrowDown}");
    expect(focusedTab).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("NavTabs renders no menu button (T4: RF-6)", () => {
  it("has no button named like a menu with the regular items", () => {
    renderNavTabs();

    expect(screen.queryByRole("button", { name: /menu|menú/i })).toBeNull();
  });
});

describe("NavTabs accessibility audit with tabpanel scaffold (T4: RF-5, RF-6)", () => {
  it("has no accessibility violations rendering the tablist together with its controlled tabpanel", async () => {
    const { container } = render(
      <>
        <NavTabs
          items={TAB_ITEMS}
          activeId="about"
          onChange={vi.fn()}
          panelId={PANEL_ID}
          label={LABEL}
        />
        <div
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={getTabId("about")}
          tabIndex={0}
        >
          Panel content.
        </div>
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
