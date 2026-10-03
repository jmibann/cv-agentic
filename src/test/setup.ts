// Setup global de Vitest (T2), referenciado por `test.setupFiles` en
// vite.config.ts. Con `globals: false` (decisión #48) no hay API global: los
// hooks se registran importándolos explícitamente de "vitest".
//
// Qué se mockea y por qué (verificado contra jsdom 30.1.1, el de la tabla de
// dependencias): `window.matchMedia`, `ResizeObserver` y
// `Element.prototype.scrollTo` NO existen; `HTMLDialogElement` existe pero
// sin `showModal`/`close` en su prototipo. `matchMedia` se mockea siempre,
// incluso en versiones que la traigan: hace falta controlarla para disparar
// `change` (T5). Las demás solo se definen si faltan, para no pisar una
// implementación real si jsdom las agrega.

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Matchers de jest-dom (`toBeInTheDocument`, …) sobre el `expect` de Vitest;
// la variante "/vitest" es la específica para Vitest, no para jest.
import "@testing-library/jest-dom/vitest";

/* ------------------------------------------------------------------ *
 * matchMedia — mock propio con disparo controlado de `change`.
 * ------------------------------------------------------------------ */

type MediaQueryChangeListener = (event: {
  readonly matches: boolean;
  readonly media: string;
}) => void;

class MockMediaQueryList {
  readonly media: string;
  matches: boolean;
  private listeners: MediaQueryChangeListener[] = [];

  constructor(media: string) {
    this.media = media;
    // Sin hoja de estilos real en jsdom: default determinista, nada matchea.
    this.matches = false;
  }

  addEventListener(type: string, listener: MediaQueryChangeListener): void {
    if (type === "change") {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: MediaQueryChangeListener): void {
    if (type === "change") {
      this.listeners = this.listeners.filter((candidate) => candidate !== listener);
    }
  }

  emitChange(matches: boolean): void {
    this.matches = matches;
    for (const listener of [...this.listeners]) {
      listener({ matches, media: this.media });
    }
  }
}

// Cacheadas por query para que `simulateMediaChange` encuentre la instancia
// que el test obtuvo de `window.matchMedia`. Se vacía en el afterEach global:
// el `matches` de un test no filtra al siguiente (ver más abajo).
const mediaQueryLists = new Map<string, MockMediaQueryList>();

function mockMatchMedia(query: string): MockMediaQueryList {
  const existing = mediaQueryLists.get(query);
  if (existing) {
    return existing;
  }
  const created = new MockMediaQueryList(query);
  mediaQueryLists.set(query, created);
  return created;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: mockMatchMedia,
});

/**
 * Dispara `change` en la MediaQueryList de `query` (devuelta por una llamada
 * previa a `window.matchMedia`) y actualiza su `matches`. Es la puerta que
 * usa T5 para simular el cambio de `prefers-color-scheme` del sistema.
 */
export function simulateMediaChange(query: string, matches: boolean): void {
  const mql = mediaQueryLists.get(query);
  if (!mql) {
    throw new Error(
      `simulateMediaChange("${query}"): llamá primero a window.matchMedia("${query}")`,
    );
  }
  mql.emitChange(matches);
}

/* ------------------------------------------------------------------ *
 * ResizeObserver — ausente en jsdom 30. Mock no-op: no hay layout que
 * observar en jsdom; los componentes solo necesitan que exista.
 * ------------------------------------------------------------------ */

class ResizeObserverMock {
  observe(): void {
    // no-op deliberado (jsdom no renderiza)
  }
  unobserve(): void {
    // no-op deliberado
  }
  disconnect(): void {
    // no-op deliberado
  }
}

if (typeof window.ResizeObserver !== "function") {
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}

/* ------------------------------------------------------------------ *
 * Element.prototype.scrollTo — ausente en jsdom 30 (existe solo el de
 * window, y tampoco scrollea). No-op: el desplazamiento no es
 * observable en jsdom.
 * ------------------------------------------------------------------ */

if (typeof Element.prototype.scrollTo !== "function") {
  Object.defineProperty(Element.prototype, "scrollTo", {
    writable: true,
    configurable: true,
    value: (): void => {
      // no-op deliberado
    },
  });
}

/* ------------------------------------------------------------------ *
 * <dialog>: showModal/close — HTMLDialogElement existe en jsdom 30 pero
 * el prototipo no trae los métodos (medido). Mock mínimo que refleja el
 * atributo `open` (sin top layer real) y dispara `close`, lo que
 * necesitan los tests de diálogos de F3.
 * ------------------------------------------------------------------ */

if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    writable: true,
    configurable: true,
    value: function showModalMock(this: HTMLDialogElement): void {
      this.setAttribute("open", "");
    },
  });
}

if (typeof HTMLDialogElement.prototype.close !== "function") {
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    writable: true,
    configurable: true,
    value: function closeMock(this: HTMLDialogElement, returnValue?: string): void {
      if (returnValue !== undefined) {
        this.returnValue = returnValue;
      }
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    },
  });
}

/* ------------------------------------------------------------------ *
 * Cleanup y aislamiento entre tests
 * ------------------------------------------------------------------ */

afterEach(() => {
  // Con `globals: false`, RTL no registra su autolimpieza: sin esto, el DOM
  // de un test queda visible para el siguiente (ver setup.test.ts).
  cleanup();

  // Estado global que mutan los providers (T5/T10) y el hash de navegación:
  // cada test arranca con el documento y el storage limpios. El Map de
  // MediaQueryLists también se descarta: si no, un `emitChange` de un test
  // heredaría su `matches` al siguiente dentro del mismo archivo (T5).
  // Los listeners registrados por tests anteriores desaparecen con los
  // objetos; cada test vuelve a llamar a `window.matchMedia`.
  mediaQueryLists.clear();

  localStorage.clear();
  const html = document.documentElement;
  html.removeAttribute("data-theme");
  html.removeAttribute("lang");
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
});
