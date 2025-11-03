import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.test for unit tests
config({ path: resolve(process.cwd(), ".env.test") });

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // deprecated
    },
    removeListener: () => {
      // deprecated
    },
    addEventListener: () => {
      // no-op
    },
    removeEventListener: () => {
      // no-op
    },
    dispatchEvent: () => false,
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];

  observe() {
    // no-op
  }
  disconnect() {
    // no-op
  }
  unobserve() {
    // no-op
  }
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    // no-op
  }
  disconnect() {
    // no-op
  }
  unobserve() {
    // no-op
  }
};
