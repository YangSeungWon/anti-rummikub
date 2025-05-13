// This file is executed before each test file
import "@testing-library/jest-dom";

// Mock the environment variables
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
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

// Mock socket.io-client
jest.mock("socket.io-client", () => {
  const mockSocketOn = jest.fn();
  const mockSocketOff = jest.fn();
  const mockSocketEmit = jest.fn();
  const mockSocketDisconnect = jest.fn();

  return {
    io: jest.fn(() => ({
      on: mockSocketOn,
      off: mockSocketOff,
      emit: mockSocketEmit,
      disconnect: mockSocketDisconnect,
      connect: jest.fn(),
      connected: true,
    })),
  };
});
