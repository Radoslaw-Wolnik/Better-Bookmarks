// jest.setup.js

import { jest } from '@jest/globals';

const createMockListener = () => {
  const listeners = [];
  return {
    addListener: jest.fn((listener) => listeners.push(listener)),
    removeListener: jest.fn((listener) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }),
    hasListener: jest.fn((listener) => listeners.includes(listener)),
    trigger: (...args) => listeners.forEach(listener => listener(...args)),
  };
};

global.browser = {
  runtime: {
    sendMessage: jest.fn(),
    getURL: jest.fn((path) => `mocked-extension://${path}`),
    onMessage: createMockListener(),
  },
  bookmarks: {
    getTree: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    move: jest.fn(),
    getSubTree: jest.fn(),
    onCreated: createMockListener(),
    onRemoved: createMockListener(),
    onChanged: createMockListener(),
    onMoved: createMockListener(),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    onChanged: createMockListener(),
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    sendMessage: jest.fn(),
    onCreated: createMockListener(),
    onUpdated: createMockListener(),
    onRemoved: createMockListener(),
  },
  menus: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    onClicked: createMockListener(),
  },
  sidebarAction: {
    open: jest.fn(),
    close: jest.fn(),
    toggle: jest.fn(),
  },
  commands: {
    getAll: jest.fn(),
    onCommand: createMockListener(),
  },
  windows: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    getCurrent: jest.fn(),
    onCreated: createMockListener(),
    onRemoved: createMockListener(),
    onFocusChanged: createMockListener(),
  },
  browserAction: {
    setIcon: jest.fn(),
    setTitle: jest.fn(),
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
};

// Helper function to reset all mocks
global.resetAllMocks = () => {
  for (const api in global.browser) {
    for (const method in global.browser[api]) {
      if (typeof global.browser[api][method].mockReset === 'function') {
        global.browser[api][method].mockReset();
      }
    }
  }
};

// Add any other global mocks or setup here

// Mock the chrome object if you're also targeting Chrome extensions
global.chrome = global.browser;

// Mock window.alert and window.confirm
global.alert = jest.fn();
global.confirm = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Ensure fetch is available in the test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
  })
);

// If you're using setTimeout in your code, you might want to mock it
jest.useFakeTimers();

// Setup for testing async operations
jest.setTimeout(10000); // Increase timeout for async tests if needed