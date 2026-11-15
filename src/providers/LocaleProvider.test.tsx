import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { cvByLocale } from "../content";

import { LocaleProvider, useCv, useLocale } from "./LocaleProvider";

// The first `about` paragraph differs between en and es in the real content,
// which proves that useCv() really switches.
function Probe(): ReactNode {
  const { locale, setLocale, t } = useLocale();
  const cv = useCv();
  return (
    <div>
      <p>{`locale: ${locale}`}</p>
      <p>{`t: ${t.resume.title}`}</p>
      <p>{`cv: ${cv.profile.about[0] ?? ""}`}</p>
      <button type="button" onClick={(): void => setLocale("es")}>
        set es
      </button>
      <button type="button" onClick={(): void => setLocale("en")}>
        set en
      </button>
    </div>
  );
}

// Simulates what the anti-flash script leaves: `lang` already on <html>.
function renderProbe(initialLang: string): void {
  document.documentElement.lang = initialLang;
  render(
    <LocaleProvider>
      <Probe />
    </LocaleProvider>,
  );
}

describe("LocaleProvider", () => {
  it("takes the initial locale from <html lang> without recomputing", () => {
    // A stored value the provider must not read: <html lang> wins.
    localStorage.setItem("cv:locale", "en");
    renderProbe("es");

    expect(screen.getByText("locale: es")).toBeInTheDocument();
    expect(screen.getByText("t: Currículum")).toBeInTheDocument();
    expect(
      screen.getByText(`cv: ${cvByLocale.es.profile.about[0] ?? ""}`),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "es");
  });

  it("setLocale changes lang, persists cv:locale and switches t and useCv() to the active locale", async () => {
    const user = userEvent.setup();
    renderProbe("en");
    expect(screen.getByText("t: Resume")).toBeInTheDocument();
    expect(
      screen.getByText(`cv: ${cvByLocale.en.profile.about[0] ?? ""}`),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "set es" }));
    expect(document.documentElement).toHaveAttribute("lang", "es");
    expect(localStorage.getItem("cv:locale")).toBe("es");
    expect(screen.getByText("locale: es")).toBeInTheDocument();
    expect(screen.getByText("t: Currículum")).toBeInTheDocument();
    expect(
      screen.getByText(`cv: ${cvByLocale.es.profile.about[0] ?? ""}`),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "set en" }));
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(localStorage.getItem("cv:locale")).toBe("en");
    expect(screen.getByText("locale: en")).toBeInTheDocument();
    expect(screen.getByText("t: Resume")).toBeInTheDocument();
    expect(
      screen.getByText(`cv: ${cvByLocale.en.profile.about[0] ?? ""}`),
    ).toBeInTheDocument();
  });

  it("changes the locale in memory when localStorage throws", async () => {
    const user = userEvent.setup();
    renderProbe("en");

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage blocked");
      });

    let clickError: unknown;
    try {
      await user.click(screen.getByRole("button", { name: "set es" }));
    } catch (error) {
      clickError = error;
    } finally {
      setItemSpy.mockRestore();
    }

    expect(clickError).toBeUndefined();
    expect(screen.getByText("locale: es")).toBeInTheDocument();
    expect(screen.getByText("t: Currículum")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "es");
  });

  it("throws a descriptive error when useLocale is used outside the provider", () => {
    // React logs the uncaught render error; the spy keeps the output clean.
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      function OrphanLocale(): null {
        useLocale();
        return null;
      }
      expect(() => render(<OrphanLocale />)).toThrowError(/useLocale.*LocaleProvider/);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("throws a descriptive error when useCv is used outside the provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      function OrphanCv(): null {
        useCv();
        return null;
      }
      expect(() => render(<OrphanCv />)).toThrowError(/useCv.*LocaleProvider/);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
