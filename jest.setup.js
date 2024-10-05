import jest from 'jest-mock';

global.jest = jest;

function mockFn(implementation) {
  return jest.fn(implementation);
}

global.browser = {
  runtime: {
    sendMessage: mockFn(),
    getURL: mockFn((path) => `mocked-extension://${path}`),
    onMessage: {
      addListener: mockFn((listener) => {
        global.browser.runtime.onMessage.listener = listener;
      })
    }
  },
  bookmarks: {
    getTree: mockFn(),
    create: mockFn()
  },
  storage: {
    local: {
      get: mockFn(),
      set: mockFn()
    }
  },
  tabs: {
    query: mockFn(),
    create: mockFn()
  },
  menus: {
    create: mockFn()
  }
};