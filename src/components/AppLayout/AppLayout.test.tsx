import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { LocaleProvider } from "../../providers/LocaleProvider";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { cvByLocale } from "../../content";
import { format } from "../../i18n/format";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";

import { AppLayout } from "./AppLayout";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./AppLayout.module.css";

const SIDEBAR_REGION = uiEn.sidebar.region;

const AVATAR_ALT_EN = format(uiEn.sidebar.avatarAlt, {
  name: cvByLocale.en.profile.name,
});
const AVATAR_ALT_ES = format(uiEs.sidebar.avatarAlt, {
  name: cvByLocale.es.profile.name,
});

const CONTAINER_CLASS = styles.container ?? "container";

function renderWithProviders(ui: ReactNode) {
  return render(
    <ThemeProvider>
      <LocaleProvider>
        {ui}
      </LocaleProvider>
    </ThemeProvider>,
  );
}

describe("AppLayout landmarks (T1: RF-1, Tests 1)", () => {
  it("renders banner, complementary and main landmarks with exactly one banner", () => {
    renderWithProviders(<AppLayout />);

    expect(screen.getAllByRole("banner")).toHaveLength(1);

    expect(
      screen.getByRole("complementary", { name: SIDEBAR_REGION }),
    ).toBeInTheDocument();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("AppLayout shared defs exactly once (T1: RF-6, Tests 7)", () => {
  it("exposes exactly one accent-gradient linearGradient and the two hex-avatar clipPaths in the document", () => {
    renderWithProviders(<AppLayout />);

    const gradient = document.getElementById("accent-gradient");
    expect(gradient).not.toBeNull();
    expect(gradient?.tagName).toBe("linearGradient");
    expect(document.querySelectorAll("linearGradient")).toHaveLength(1);

    const clipOuter = document.getElementById("hex-avatar-outer");
    const clipInner = document.getElementById("hex-avatar-inner");
    expect(clipOuter).not.toBeNull();
    expect(clipOuter?.tagName).toBe("clipPath");
    expect(clipInner).not.toBeNull();
    expect(clipInner?.tagName).toBe("clipPath");
    expect(document.querySelectorAll("clipPath")).toHaveLength(2);
  });
});

describe("AppLayout does not squat the tab ids (T1: spec → No hacer, Tests 9)", () => {
  it("renders no element with id about or resume anywhere in the document", () => {
    renderWithProviders(<AppLayout />);

    expect(document.getElementById("about")).toBeNull();
    expect(document.getElementById("resume")).toBeNull();
  });
});

describe("AppLayout starts on the About tab with no hash (T2: RF-2, Tests 2)", () => {
  it("mounts the About page in the tabpanel and marks the about tab selected with no URL hash", () => {
    renderWithProviders(<AppLayout />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("id", "main-panel");
    expect(panel).toContainElement(
      screen.getByRole("heading", { level: 1, name: uiEn.about.title }),
    );
    expect(
      screen.queryByRole("heading", { level: 1, name: uiEn.resume.title }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("tab", { name: uiEn.nav.about })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(panel).toHaveAttribute("aria-labelledby", "tab-about");

    expect(window.location.hash).toBe("");
  });
});

describe("AppLayout honors #resume before mounting (T2: RF-2, Tests 3)", () => {
  it("starts on Resume when location.hash is #resume prior to render", () => {
    window.history.replaceState(null, "", "#resume");

    renderWithProviders(<AppLayout />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toContainElement(
      screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
    );
    expect(
      screen.queryByRole("heading", { level: 1, name: uiEn.about.title }),
    ).not.toBeInTheDocument();
    expect(panel).toHaveAttribute("aria-labelledby", "tab-resume");
    expect(screen.getByRole("tab", { name: uiEn.nav.resume })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("AppLayout tab change swaps panel, labelledby and hash (T2: RF-3, Tests 4)", () => {
  it("clicking the Resume tab renders the Resume h1, relabels the panel and replaceState to #resume without pushState", async () => {
    const user = userEvent.setup();

    window.history.replaceState(null, "", "/");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");

    try {
      renderWithProviders(<AppLayout />);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

      await user.click(screen.getByRole("tab", { name: uiEn.nav.resume }));

      const panel = screen.getByRole("tabpanel");
      expect(panel).toContainElement(
        screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
      );

      expect(panel).toHaveAttribute("aria-labelledby", "tab-resume");

      // jsdom may resolve the URL to an absolute one, so the third argument is
      // matched with a regex.
      expect(replaceState).toHaveBeenCalledTimes(1);
      const firstCall = replaceState.mock.calls[0];
      if (firstCall === undefined) {
        throw new Error(
          "replaceState has no recorded calls (unexpected: toHaveBeenCalledTimes(1) already passed)",
        );
      }
      expect(firstCall[2]).toMatch(/#resume$/);
      expect(pushState).not.toHaveBeenCalled();
      expect(window.location.hash).toBe("#resume");

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    } finally {
      replaceState.mockRestore();
      pushState.mockRestore();
    }
  });
});

describe("AppLayout tablist invariant (T2: RF-5, Tests 11)", () => {
  it("keeps exactly two tabs in About→Resume order whose ids match the panel aria-labelledby before and after switching", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    const tablist = screen.getByRole("tablist", { name: uiEn.nav.label });
    const tabs = within(tablist).getAllByRole("tab");

    expect(tabs).toHaveLength(2);
    const firstTab = tabs[0];
    const secondTab = tabs[1];
    if (firstTab === undefined || secondTab === undefined) {
      throw new Error("the tablist must have exactly two tabs");
    }
    expect(tabs.map((tab) => tab.id)).toEqual(["tab-about", "tab-resume"]);
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      uiEn.nav.about,
      uiEn.nav.resume,
    ]);

    const panel = screen.getByRole("tabpanel");

    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(secondTab).toHaveAttribute("aria-selected", "false");
    expect(panel.getAttribute("aria-labelledby")).toBe(firstTab.id);
    expect(document.getElementById(firstTab.id)).toBe(firstTab);

    await user.click(secondTab);

    const tabsAfter = within(tablist).getAllByRole("tab");
    expect(tabsAfter).toHaveLength(2);
    expect(tabsAfter[0]).toHaveAttribute("aria-selected", "false");
    expect(tabsAfter[1]).toHaveAttribute("aria-selected", "true");
    expect(panel.getAttribute("aria-labelledby")).toBe(secondTab.id);
    expect(document.getElementById(secondTab.id)).toBe(secondTab);
  });
});

describe("AppLayout skip link focuses the panel without touching the hash (T3: RF-4, Tests 8)", () => {
  it("is the first focusable element and on click moves focus to #main-panel leaving location.hash untouched", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    const skipLink = screen.getByRole("link", { name: uiEn.skipToContent });
    expect(skipLink).toHaveAttribute("href", "#main-panel");
    expect(skipLink).toHaveAttribute("data-print-hide");

    await user.tab();
    expect(skipLink).toHaveFocus();

    const panel = screen.getByRole("tabpanel");
    expect(document.activeElement).not.toBe(panel);

    await user.click(skipLink);
    expect(document.activeElement).toBe(panel);
    expect(panel).toHaveAttribute("id", "main-panel");
    expect(window.location.hash).toBe("");

    skipLink.focus();
    expect(skipLink).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(panel);
    expect(window.location.hash).toBe("");
  });
});

const expectNoDuplicateIds = (): void => {
  const ids = Array.from(
    document.querySelectorAll<HTMLElement>("[id]"),
  ).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
};

describe("AppLayout re-renders in Spanish through the real switcher (T4: RF-7, Tests 5)", () => {
  it("clicking the LanguageSwitcher Español option retabs, retitles and retexts the content in es without reloading", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    await user.click(screen.getByRole("button", { name: "Español" }));

    expect(
      screen.getByRole("tab", { name: uiEs.nav.about }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: uiEs.nav.resume }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.about.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(cvByLocale.es.profile.about[0] ?? ""),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: uiEn.about.title }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(
      screen.getByRole("complementary", { name: uiEs.sidebar.region }),
    ).toBeInTheDocument();
  });
});

describe("AppLayout derives the avatar alt from profile.name (T9: Cambio 2026-11-10)", () => {
  it("names the sidebar avatar in English and keeps following the name after switching to Spanish", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    expect(
      screen.getByRole("img", { name: AVATAR_ALT_EN }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Español" }));

    expect(
      screen.getByRole("img", { name: AVATAR_ALT_ES }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: AVATAR_ALT_EN }),
    ).not.toBeInTheDocument();
  });
});

describe("AppLayout theme change reaches html data-theme (T4: RF-7, Tests 6)", () => {
  it("clicking the ThemeToggle sets data-theme=dark on <html> through the mounted provider path", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    expect(document.documentElement.dataset.theme).not.toBe("dark");
    await user.click(
      screen.getByRole("button", { name: uiEn.controls.darkMode }),
    );

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("AppLayout inactive page lives hidden outside the tabpanel (T4: RF-8, Tests 12)", () => {
  it("with about active, mounts Resume hidden in the data-print-only sibling with data-print-page=resume and a single accessible h1, no duplicate ids", () => {
    renderWithProviders(<AppLayout />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("data-print-page", "about");

    const printOnly = document.querySelector("[data-print-only]");
    if (printOnly === null) {
      throw new Error(
        "the sibling data-print-only block with the inactive page must exist",
      );
    }
    expect(printOnly.tagName).toBe("DIV");
    expect(printOnly.hasAttribute("hidden")).toBe(true);
    expect(printOnly).toHaveAttribute("data-print-page", "resume");

    expect(panel.contains(printOnly)).toBe(false);
    const stack = printOnly.parentElement;
    expect(stack).not.toBeNull();
    expect(stack?.hasAttribute("data-print-stack")).toBe(true);
    expect(stack?.firstElementChild).toBe(panel);
    expect(stack?.lastElementChild).toBe(printOnly);

    const hiddenResumeH1 = printOnly.querySelector("h1");
    expect(hiddenResumeH1).not.toBeNull();
    expect(hiddenResumeH1?.textContent).toBe(uiEn.resume.title);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEn.about.title }),
    ).toBeInTheDocument();

    expect(document.querySelectorAll("#about-services-title")).toHaveLength(1);
    expect(document.querySelectorAll("#resume-skills-title")).toHaveLength(1);
    expectNoDuplicateIds();
  });

  it("with resume active, mounts About hidden in the data-print-only sibling with data-print-page=about and a single accessible h1, no duplicate ids", () => {
    window.history.replaceState(null, "", "#resume");
    renderWithProviders(<AppLayout />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("data-print-page", "resume");

    const printOnly = document.querySelector("[data-print-only]");
    if (printOnly === null) {
      throw new Error(
        "the sibling data-print-only block with the inactive page must exist (symmetric case)",
      );
    }
    expect(printOnly.hasAttribute("hidden")).toBe(true);
    expect(printOnly).toHaveAttribute("data-print-page", "about");
    expect(panel.contains(printOnly)).toBe(false);

    const stack = printOnly.parentElement;
    expect(stack?.hasAttribute("data-print-stack")).toBe(true);
    expect(stack?.firstElementChild).toBe(panel);
    expect(stack?.lastElementChild).toBe(printOnly);

    const hiddenAboutH1 = printOnly.querySelector("h1");
    expect(hiddenAboutH1?.textContent).toBe(uiEn.about.title);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
    ).toBeInTheDocument();

    expect(document.querySelectorAll("#resume-skills-title")).toHaveLength(1);
    expect(document.querySelectorAll("#about-services-title")).toHaveLength(1);
    expectNoDuplicateIds();
  });
});

describe("AppLayout container className joining (T5: spec → API, G-B)", () => {
  it("joins an external className to the base .container class on the page container, coexisting", () => {
    const consumerClass = "app-shell-custom";

    renderWithProviders(<AppLayout className={consumerClass} />);

    const banner = screen.getByRole("banner");
    const containerDiv = banner.parentElement;
    if (containerDiv === null) {
      throw new Error("the banner must be a child of div.container");
    }
    expect(containerDiv.tagName).toBe("DIV");
    expect(containerDiv).toHaveClass(CONTAINER_CLASS);
    expect(containerDiv).toHaveClass(consumerClass);
  });
});

describe("AppLayout accessibility audit (T5: cierre, Tests 10)", () => {
  it("has no accessibility violations with About active in English", async () => {
    const { container } = renderWithProviders(<AppLayout />);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with Resume active in English", async () => {
    window.history.replaceState(null, "", "#resume");

    const { container } = renderWithProviders(<AppLayout />);

    // Guards the seeded branch: a silent fallback to "about" would audit the
    // same tree twice.
    expect(
      screen.getByRole("heading", { level: 1, name: uiEn.resume.title }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with About active in Spanish", async () => {
    document.documentElement.lang = "es";

    const { container } = renderWithProviders(<AppLayout />);

    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.about.title }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with Resume active in Spanish", async () => {
    document.documentElement.lang = "es";
    window.history.replaceState(null, "", "#resume");

    const { container } = renderWithProviders(<AppLayout />);

    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.resume.title }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });
});

describe("AppLayout entry wrapper marks the direction on tab change (T11: RF-9, Tests 13)", () => {
  it("sets from-right on About→Resume and from-left on Resume→About, and a fast double click remounts the wrapper leaving the old node out of the document", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AppLayout />);

    expect(container.querySelectorAll("[data-motion-panel]")).toHaveLength(1);

    await user.click(screen.getByRole("tab", { name: uiEn.nav.resume }));
    const fromRight =
      container.querySelector<HTMLElement>("[data-motion-panel]");
    if (fromRight === null) {
      throw new Error(
        "the data-motion-panel wrapper must exist inside the tabpanel",
      );
    }
    expect(fromRight).toHaveAttribute("data-motion-direction", "from-right");
    expect(screen.getByRole("tabpanel")).toContainElement(fromRight);

    await user.click(screen.getByRole("tab", { name: uiEn.nav.about }));
    const fromLeft = container.querySelector("[data-motion-panel]");
    if (fromLeft === null) {
      throw new Error("the data-motion-panel wrapper must persist across a tab change");
    }
    expect(fromLeft).toHaveAttribute("data-motion-direction", "from-left");

    await user.click(screen.getByRole("tab", { name: uiEn.nav.resume }));
    await user.click(screen.getByRole("tab", { name: uiEn.nav.about }));
    const finalWrapper = container.querySelector("[data-motion-panel]");
    if (finalWrapper === null) {
      throw new Error(
        "the data-motion-panel wrapper must exist after the rapid clicks",
      );
    }
    expect(finalWrapper).toHaveAttribute("data-motion-direction", "from-left");
    expect(container.contains(fromLeft)).toBe(false);
    expect(finalWrapper).not.toBe(fromLeft);
  });
});

describe("AppLayout entry wrapper has no direction on first render and keeps it across a language change (T11: RF-9, Tests 16)", () => {
  it("renders the wrapper without data-motion-direction initially and preserves from-right after switching to Spanish through the real switcher", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AppLayout />);

    const initial = container.querySelector("[data-motion-panel]");
    if (initial === null) {
      throw new Error(
        "the data-motion-panel wrapper must exist on the initial render",
      );
    }
    expect(initial).not.toHaveAttribute("data-motion-direction");

    await user.click(screen.getByRole("tab", { name: uiEn.nav.resume }));
    const wrapper = container.querySelector("[data-motion-panel]");
    if (wrapper === null) {
      throw new Error(
        "the data-motion-panel wrapper must exist after the tab change",
      );
    }
    expect(wrapper).toHaveAttribute("data-motion-direction", "from-right");

    await user.click(screen.getByRole("button", { name: "Español" }));
    const afterLanguage = container.querySelector("[data-motion-panel]");
    if (afterLanguage === null) {
      throw new Error(
        "the wrapper must survive the re-render caused by a language change",
      );
    }
    expect(afterLanguage).toHaveAttribute("data-motion-direction", "from-right");
    expect(afterLanguage).toBe(wrapper);
  });
});

describe("AppLayout resets the testimonials carousel to index zero across tab changes (T12: RF-9, Tests 14)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("advances the carousel in About, visits Resume and comes back with the first bullet active", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
      function (this: HTMLElement): number {
        const parent = this.parentElement;
        if (parent === null) {
          return 0;
        }
        const index = Array.from(parent.children).indexOf(this);
        return [0, 300, 600][index] ?? 0;
      },
    );
    vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(900);
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(600);
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback): number => {
        callback(0);
        return 1;
      },
    );

    const user = userEvent.setup();
    renderWithProviders(<AppLayout />);

    const bulletName = (n: number): string =>
      format(uiEn.testimonials.goToSlide, { n });
    const bullet1 = screen.getByRole("button", { name: bulletName(1) });
    const bullet2 = screen.getByRole("button", { name: bulletName(2) });

    expect(bullet1).toHaveAttribute("aria-current", "true");
    expect(bullet2).not.toHaveAttribute("aria-current");

    const track = screen
      .getByRole("group", {
        name: format(uiEn.testimonials.slideLabel, {
          current: 1,
          total: cvByLocale.en.testimonials.length,
        }),
      })
      .parentElement;
    if (track === null) {
      throw new Error("slide 1 must have a parent track in the DOM");
    }
    Object.defineProperty(track, "scrollLeft", {
      value: 300,
      configurable: true,
    });
    fireEvent.scroll(track);

    // Proves the carousel really advanced; otherwise the final assertion would
    // be trivially true.
    expect(bullet2).toHaveAttribute("aria-current", "true");
    expect(bullet1).not.toHaveAttribute("aria-current");

    await user.click(screen.getByRole("tab", { name: uiEn.nav.resume }));
    await user.click(screen.getByRole("tab", { name: uiEn.nav.about }));

    expect(
      screen.getByRole("button", { name: bulletName(1) }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: bulletName(2) }),
    ).not.toHaveAttribute("aria-current");
  });
});
