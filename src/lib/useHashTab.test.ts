// Tests 1–3 de specs/hooks/useHashTab/spec.md (T1, RF-1): estado inicial del
// tab a partir de location.hash en el momento del montaje.
//
// Control del hash: se fija con el `history.replaceState` real ANTES de crear
// el spy, de modo que el spy de `replaceState` (test 3) mida solo las llamadas
// del hook. El afterEach global de src/test/setup.ts ya limpia el hash entre
// tests; `setHash` lo deja determinista dentro del archivo.

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderHook } from "@testing-library/react";

import { useHashTab } from "./useHashTab";

const IDS = ["about", "resume"] as const;
const DEFAULT_ID = "about";

/** Fija el hash de la URL ("" lo quita) conservando pathname y search. */
function setHash(hash: string): void {
  const { pathname, search } = window.location;
  const url = hash ? `${pathname}${search}${hash}` : `${pathname}${search}`;
  window.history.replaceState(null, "", url);
}

describe("useHashTab initial state from location.hash", () => {
  it("returns defaultId when there is no hash", () => {
    setHash("");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe(DEFAULT_ID);
  });

  it("returns 'resume' when the URL has #resume before mount", () => {
    setHash("#resume");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe("resume");
  });

  it("returns defaultId for an invalid hash and does not rewrite the URL", () => {
    setHash("#foo");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe(DEFAULT_ID);
    // RF-1: hash inválido → defaultId sin reescribir la URL.
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

// Tests 4, 5 y 9 de la spec (T2, RF-2): setActiveId actualiza el estado con
// history.replaceState (nunca pushState), no hace nada si el id ya es el
// activo y conserva pathname y search de la URL.
describe("useHashTab setActiveId", () => {
  afterEach(() => {
    // Red de seguridad: si un test falla antes de sus mockRestore(), el spy
    // no puede quedar instalado y contaminar las llamadas del test siguiente.
    vi.restoreAllMocks();
    // Reparación menor de T2 (movido desde el cuerpo del test 9): devuelve la
    // URL base. El afterEach global solo limpia el hash, no el pathname, y
    // setHash() (T1) usa el pathname vigente.
    window.history.replaceState(null, "", "/");
  });

  it("setActiveId('resume') sets the state and calls replaceState with a URL ending in #resume, never pushState", () => {
    setHash("");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    act(() => {
      result.current[1]("resume");
    });
    expect(result.current[0]).toBe("resume");
    expect(replaceState).toHaveBeenCalledTimes(1);
    const calls = replaceState.mock.calls;
    // Tercer argumento de replaceState: la URL terminada en #resume (puede ser
    // la relativa "#" + id del plan; ambas resuelven a #resume).
    expect(calls[0]?.[2] ?? "").toMatch(/#resume$/);
    expect(pushState).not.toHaveBeenCalled();
    replaceState.mockRestore();
    pushState.mockRestore();
  });

  it("setActiveId with the already active id does not call replaceState", () => {
    setHash("#about");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    // Spy creado después del montaje y de setHash: mide solo llamadas del hook.
    const replaceState = vi.spyOn(window.history, "replaceState");
    act(() => {
      result.current[1]("about");
    });
    expect(result.current[0]).toBe("about");
    // RF-2: id ya activo → ni estado ni replaceState.
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });

  it("setActiveId preserves pathname and search, changing only the hash", () => {
    // URL base con pathname y search no vacíos (replaceState real, antes del
    // spy, para que el spy mida solo las llamadas del hook).
    window.history.replaceState(null, "", "/cv/2026?lang=es#about");
    const pathname = window.location.pathname;
    const search = window.location.search;
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    act(() => {
      result.current[1]("resume");
    });
    expect(replaceState).toHaveBeenCalledTimes(1);
    // El spy ejecuta la implementación real: la URL resultante debe conservar
    // pathname y search y cambiar solo el hash (RF-2, test 9 de la spec).
    expect(window.location.pathname).toBe(pathname);
    expect(window.location.search).toBe(search);
    expect(window.location.hash).toBe("#resume");
    replaceState.mockRestore();
  });
});

// Tests 6, 7 y 8 de la spec (T3, RF-3 y RF-4): el listener de hashchange
// actualiza el tab con hash válido, ignora el inválido y se quita al desmontar
// con la misma referencia de handler. Disparo del evento: fireEvent(window,
// new HashChangeEvent("hashchange")) tras fijar el hash (estrategia del plan;
// replaceState real no dispara el evento por sí solo).
describe("useHashTab hashchange listener", () => {
  afterEach(() => {
    // Red de seguridad (mismo criterio que en T2): si un test falla antes de
    // sus mockRestore(), los spies de window no pueden quedar instalados.
    vi.restoreAllMocks();
  });

  it("updates the active tab on hashchange with a valid hash", () => {
    setHash("");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    expect(result.current[0]).toBe("about");
    act(() => {
      setHash("#resume");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    // RF-3: hashchange con hash válido actualiza el tab activo.
    expect(result.current[0]).toBe("resume");
  });

  it("keeps the previous value on hashchange with an invalid hash", () => {
    setHash("");
    const { result } = renderHook(() => useHashTab(IDS, DEFAULT_ID));
    // Precondition: a valid hashchange moves the tab to "resume".
    act(() => {
      setHash("#resume");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe("resume");
    act(() => {
      setHash("#foo");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    // RF-3: hash inválido → se ignora; queda el tab actual (el del último
    // hashchange válido, no el valor de montaje ni defaultId).
    expect(result.current[0]).toBe("resume");
  });

  it("registers hashchange on mount, removes the same handler on unmount and stops updating after unmount", () => {
    setHash("");
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const { result, unmount } = renderHook(() => useHashTab(IDS, DEFAULT_ID));

    // RF-4: al montar se registra "hashchange". La referencia capturada acá es
    // el discriminante de la identidad (plan: cleanup con la MISMA referencia;
    // alternativa descartada: AbortController, que no hace observable
    // removeEventListener).
    const registration = addEventListener.mock.calls.find(
      (call) => call[0] === "hashchange",
    );
    expect(registration).toBeDefined();
    const handler = registration?.[1] ?? null;
    expect(handler).not.toBeNull();

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("hashchange", handler);

    // hashchange post-desmontaje: sin actualizaciones observables.
    act(() => {
      setHash("#resume");
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe("about");
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });
});
