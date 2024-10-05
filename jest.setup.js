global.browser = {
    runtime: {
      sendMessage: jest.fn(),
      getURL: jest.fn(),
      onMessage: {
        addListener: jest.fn()
      }
    },
    bookmarks: {
      getTree: jest.fn(),
      create: jest.fn()
    },
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn()
      }
    },
    tabs: {
      query: jest.fn(),
      create: jest.fn()
    },
    menus: {
      create: jest.fn()
    }
  };
  
  // Mock the browser.runtime.getURL function
  global.browser.runtime.getURL = jest.fn(path => `mocked-extension://${path}`);