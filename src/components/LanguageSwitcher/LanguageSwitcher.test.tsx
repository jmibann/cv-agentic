import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { LocaleProvider } from "../../providers/LocaleProvider";
import type { LocaleContextValue } from "../../providers/LocaleProvider";
import type { Locale } from "@data/cv.types.generated";

import { LanguageSwitcher } from "./LanguageSwitcher";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./LanguageSwitcher.module.css";

// vi.hoisted runs before the imports, which vi.mock needs: its factory is
// evaluated while the file's static imports load.
type SetLocaleFn = LocaleContextValue["setLocale"];

interface LocaleHarness {
  active: boolean;
  locale: Locale;
  setLocale: Mock<SetLocaleFn>;
}

const localeHarness = vi.hoisted((): LocaleHarness => ({
  active: true,
  locale: "en",
  setLocale: vi.fn<SetLocaleFn>(),
}));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  const { uiEn } = await import("../../i18n/ui.en");
  const harnessValue = (): LocaleContextValue => ({
    locale: localeHarness.locale,
    setLocale: localeHarness.setLocale,
    t: uiEn,
  });
  return {
    ...actual,
    useLocale: () =>
      localeHarness.active ? harnessValue() : actual.useLocale(),
  };
});

beforeEach(() => {
  localeHarness.active = true;
  localeHarness.locale = "en";
  localeHarness.setLocale.mockReset();
});

const GROUP_LABEL = "Language";

const ENGLISH_LABEL = "English";
const SPANISH_LABEL = "Español";

const languageSwitcherClass = styles.languageSwitcher ?? "languageSwitcher";

describe("LanguageSwitcher group (T1: RF-4)", () => {
  it("renders a group named by the label prop containing two type=button options", () => {
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    const group = screen.getByRole("group", { name: GROUP_LABEL });
    const buttons = within(group).getAllByRole("button");

    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});

describe("LanguageSwitcher options order (T1: RF-1)", () => {
  it("shows one option per LOCALES entry, in order, with fixed visible text EN then ES", () => {
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual(["EN", "ES"]);
  });
});

describe("LanguageSwitcher option names and lang (T1: RF-4)", () => {
  it("gives each button its fixed aria-label and its own lang attribute", () => {
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    expect(screen.getByRole("button", { name: ENGLISH_LABEL })).toHaveAttribute(
      "lang",
      "en",
    );
    expect(screen.getByRole("button", { name: SPANISH_LABEL })).toHaveAttribute(
      "lang",
      "es",
    );
  });
});

describe("LanguageSwitcher className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root group", () => {
    const consumerClass = "controls-bar-language";

    render(<LanguageSwitcher label={GROUP_LABEL} className={consumerClass} />);

    const group = screen.getByRole("group", { name: GROUP_LABEL });
    expect(group).toHaveClass(languageSwitcherClass);
    expect(group).toHaveClass(consumerClass);
  });
});

describe("LanguageSwitcher active state (T2: RF-2, real LocaleProvider)", () => {
  beforeEach(() => {
    localeHarness.active = false;
  });

  it("marks the button of the seeded active locale as pressed and the other as not pressed", () => {
    // Seeds Spanish as the anti-flash script would. Without it the whole file
    // would start in the default locale.
    document.documentElement.lang = "es";

    render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});

describe("LanguageSwitcher locale change integration (T2: RF-2, real LocaleProvider, G-A)", () => {
  beforeEach(() => {
    localeHarness.active = false;
  });

  it("clicking the other locale toggles aria-pressed and updates html lang and cv:locale via the provider", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole("button", { name: SPANISH_LABEL }));

    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).toHaveAttribute("lang", "es");
    expect(localStorage.getItem("cv:locale")).toBe("es");
  });
});

describe("LanguageSwitcher setLocale call (T2: RF-2, mocked provider)", () => {
  it("calls setLocale once with the inactive locale when it is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    await user.click(screen.getByRole("button", { name: SPANISH_LABEL }));

    expect(localeHarness.setLocale).toHaveBeenCalledTimes(1);
    expect(localeHarness.setLocale).toHaveBeenCalledWith("es");
  });
});

describe("LanguageSwitcher guard on active locale (T2: RF-3, mocked provider)", () => {
  it("does not call setLocale when the already-active locale is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    const activeButton = screen.getByRole("button", { name: ENGLISH_LABEL });
    expect(activeButton).toHaveAttribute("aria-pressed", "true");

    await user.click(activeButton);

    expect(localeHarness.setLocale).not.toHaveBeenCalled();
  });
});

describe("LanguageSwitcher tab order (T2: RF-5)", () => {
  it("Tab focuses both buttons in LOCALES order (English then Español)", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher label={GROUP_LABEL} />);

    await user.tab();
    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveFocus();
  });
});

describe("LanguageSwitcher accessibility audit (T3: cierre, spec → Tests)", () => {
  beforeEach(() => {
    localeHarness.active = false;
  });

  it("has no accessibility violations with English active", async () => {
    const { container } = render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    expect(
      screen.getByRole("button", { name: ENGLISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with Español active", async () => {
    document.documentElement.lang = "es";

    const { container } = render(
      <LocaleProvider>
        <LanguageSwitcher label={GROUP_LABEL} />
      </LocaleProvider>,
    );

    expect(document.documentElement).toHaveAttribute("lang", "es");
    expect(
      screen.getByRole("button", { name: SPANISH_LABEL }),
    ).toHaveAttribute("aria-pressed", "true");

    await expectNoA11yViolations(container);
  });
});
