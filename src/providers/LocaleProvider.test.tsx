// Tests de LocaleProvider (T10): RF-5 (storage que lanza no rompe) y RF-6
// (setLocale fija lang + persiste + conmuta t/useCv) de
// specs/foundation/Foundation/spec.md, y la sección "LocaleProvider" de
// "Tests esperados" (spec.md y foundations/i18n.md).
// 5 tests, en el orden literal de tasks.md → T10.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { cvByLocale } from "../content";

import { LocaleProvider, useCv, useLocale } from "./LocaleProvider";

// Sonda de test: expone el idioma del contexto, un texto de `t` y el primer
// párrafo de `perfil.about` de `useCv()` como texto, y dos botones que llaman
// `setLocale` (queries por rol y nombre accesible). Ese párrafo difiere entre
// en y es en el contenido real, así que prueba que useCv() conmuta de verdad.
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

// Simula el estado que deja el script anti-flash: `lang` resuelto en <html>
// antes de montar el provider (foundations/i18n.md → "Resolución del idioma
// inicial": el provider toma su estado inicial de ahí).
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
    // lang="es" sin cv:locale guardado: un provider que recalculera
    // (navigator → default "en") terminaría en "en". Debe tomar el valor ya
    // resuelto por el anti-flash, y servir t y useCv() en ese idioma.
    localStorage.setItem("cv:locale", "en"); // el provider NO debe leerlo: gana <html lang>
    renderProbe("es");

    expect(screen.getByText("locale: es")).toBeInTheDocument();
    expect(screen.getByText("t: Currículum")).toBeInTheDocument();
    expect(
      screen.getByText(`cv: ${cvByLocale.es.profile.about[0] ?? ""}`),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "es");
  });

  it("setLocale changes lang, persists cv:locale and switches t and useCv() to the active locale", async () => {
    // RF-6 en las dos direcciones: en → es → en.
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
    // RF-5: modo privado / storage bloqueado. El spy lanza en setItem y el
    // provider sigue: el estado, lang, t y useCv() cambian, sin error hacia
    // afuera (mismo mecanismo que el test equivalente de T5).
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
    // Estados de la spec: "Providers sin wrapper" (spec.md ~186): useLocale
    // fuera del provider lanza error descriptivo. Spy de console.error como
    // en T5: React registra el error no capturado del render; el assert lo
    // hace toThrowError.
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
    // Idem, para useCv (spec.md ~186: ambos hooks con error descriptivo).
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
