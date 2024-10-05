// File: test/background.test.js
describe('Background Script', () => {
    beforeEach(() => {
      // Mock browser APIs
      global.browser = {
        runtime: {
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
    });
  
    test('handles getBookmarks action', async () => {
      const sendResponse = jest.fn();
      const message = { action: 'getBookmarks' };
      
      await browser.runtime.onMessage.addListener.mock.calls[0][0](message, {}, sendResponse);
      
      expect(browser.bookmarks.getTree).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalled();
    });
  
    test('handles getSessions action', async () => {
      const sendResponse = jest.fn();
      const message = { action: 'getSessions' };
      browser.storage.local.get.mockResolvedValue({ sessions: [] });
      
      await browser.runtime.onMessage.addListener.mock.calls[0][0](message, {}, sendResponse);
      
      expect(browser.storage.local.get).toHaveBeenCalledWith('sessions');
      expect(sendResponse).toHaveBeenCalledWith([]);
    });
  
    test('handles saveSession action', async () => {
      const sendResponse = jest.fn();
      const session = { id: '1', name: 'Test Session', tabs: [] };
      const message = { action: 'saveSession', data: session };
      browser.storage.local.get.mockResolvedValue({ sessions: [] });
      
      await browser.runtime.onMessage.addListener.mock.calls[0][0](message, {}, sendResponse);
      
      expect(browser.storage.local.set).toHaveBeenCalledWith({ sessions: [session] });
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('handles loadSession action', async () => {
      const sendResponse = jest.fn();
      const session = { id: '1', name: 'Test Session', tabs: [{ url: 'https://example.com' }] };
      const message = { action: 'loadSession', data: '1' };
      browser.storage.local.get.mockResolvedValue({ sessions: [session] });
      
      await browser.runtime.onMessage.addListener.mock.calls[0][0](message, {}, sendResponse);
      
      expect(browser.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('handles deleteSession action', async () => {
      const sendResponse = jest.fn();
      const session = { id: '1', name: 'Test Session', tabs: [] };
      const message = { action: 'deleteSession', data: '1' };
      browser.storage.local.get.mockResolvedValue({ sessions: [session] });
      
      await browser.runtime.onMessage.addListener.mock.calls[0][0](message, {}, sendResponse);
      
      expect(browser.storage.local.set).toHaveBeenCalledWith({ sessions: [] });
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });
  
    test('creates Save All Tabs menu item', () => {
      expect(browser.menus.create).toHaveBeenCalledWith({
        id: "save-all-tabs",
        title: "Save All Tabs",
        contexts: ["bookmark"],
        onclick: expect.any(Function)
      });
    });
  });
  