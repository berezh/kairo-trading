import "@testing-library/jest-dom";

// Ant Design batches form watchers through MessageChannel, which jsdom lacks.
Object.defineProperty(globalThis, "MessageChannel", {
  writable: true,
  value: class {
    port1 = { onmessage: () => {} };
    port2 = {
      postMessage: () => setTimeout(() => this.port1.onmessage(), 0),
    };
  },
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
