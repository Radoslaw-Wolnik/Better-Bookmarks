function mockFn() {
  return function mockConstructor() {
    return mockConstructor;
  };
}

global.browser = {
  runtime: {
    sendMessage: mockFn(),
    getURL: mockFn(path => `mocked-extension://${path}`),
    onMessage: {
      addListener: mockFn()
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