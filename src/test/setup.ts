// Vitest runs with `globals: false`, so hooks are imported explicitly.
// jsdom 30 lacks matchMedia, ResizeObserver, Element.prototype.scrollTo and the
// dialog's showModal/close. matchMedia is always mocked, even if present,
// because tests need to fire its `change` event.

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// The "/vitest" entry registers the matchers on Vitest's expect.
import "@testing-library/jest-dom/vitest";

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
    // jsdom has no real stylesheet: nothing matches by default.
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

// Cached per query so simulateMediaChange finds the instance a test got from
// window.matchMedia.
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

/** Fires `change` on the MediaQueryList previously returned for `query`. */
export function simulateMediaChange(query: string, matches: boolean): void {
  const mql = mediaQueryLists.get(query);
  if (!mql) {
    throw new Error(
      `simulateMediaChange("${query}"): call window.matchMedia("${query}") first`,
    );
  }
  mql.emitChange(matches);
}

// jsdom does no layout: components only need the class to exist.
class ResizeObserverMock {
  observe(): void {
    // Intentionally empty.
  }
  unobserve(): void {
    // Intentionally empty.
  }
  disconnect(): void {
    // Intentionally empty.
  }
}

if (typeof window.ResizeObserver !== "function") {
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}

if (typeof Element.prototype.scrollTo !== "function") {
  Object.defineProperty(Element.prototype, "scrollTo", {
    writable: true,
    configurable: true,
    value: (): void => {
      // Intentionally empty: scrolling is not observable in jsdom.
    },
  });
}

// jsdom has HTMLDialogElement but not these methods. The mock only reflects
// the `open` attribute and fires `close`; there is no real top layer.
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

afterEach(() => {
  // With `globals: false`, Testing Library does not register its own cleanup.
  cleanup();

  // Otherwise a `matches` value set by one test would leak into the next one.
  mediaQueryLists.clear();

  localStorage.clear();
  const html = document.documentElement;
  html.removeAttribute("data-theme");
  html.removeAttribute("lang");
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
});
