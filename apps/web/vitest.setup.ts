import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";


afterEach(() => {
  cleanup();
});


class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as any;


class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = "";
  thresholds = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = IntersectionObserverMock as any;


class XMLHttpRequestMock {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  onreadystatechange: (() => void) | null = null;
  responseText = '{"data": []}';
  response = { data: [] };
  readyState = 4;
  status = 200;
  statusText = "OK";
  timeout = 0;
  withCredentials = false;

  open() {}
  send() {
    setTimeout(() => {
      if (this.onreadystatechange) {
        this.onreadystatechange();
      }
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
  abort() {}
  setRequestHeader() {}
  getResponseHeader() {
    return "";
  }
  getAllResponseHeaders() {
    return "";
  }
}

global.XMLHttpRequest = XMLHttpRequestMock as any;


vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");

  return {
    ...actual,
    useNavigation: () => ({ state: "idle" }),
    useParams: () => ({}),
    useRouteError: () => undefined,
    useRouteLoaderData: () => ({}),
    createMemoryHistory: vi.fn(),
    createRouter: vi.fn(),
  };
});


Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});


const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
