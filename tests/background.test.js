// File: tests/background.test.js

import { actionHandlers, saveAllTabs } from '../src/background';

describe('Background Script', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = {
      runtime: {
        onMessage: {
          addListener: jest.fn((listener) => {
            mockBrowser.runtime.onMessage.listener = listener;
          })
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

    global.browser = mockBrowser;
  });

  test('handles getBookmarks action', async () => {
    const sendResponse = jest.fn();
    const message = { action: 'getBookmarks' };
    
    await mockBrowser.runtime.onMessage.listener(message, {}, sendResponse);
    
    expect(mockBrowser.bookmarks.getTree).toHaveBeenCalled();
    expect(sendResponse).toHaveBeenCalled();
  });

  test('handles getSessions action', async () => {
    const sendResponse = jest.fn();
    const message = { action: 'getSessions' };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [] });
    
    await mockBrowser.runtime.onMessage.listener(message, {}, sendResponse);
    
    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith('sessions');
    expect(sendResponse).toHaveBeenCalledWith([]);
  });

  test('handles saveSession action', async () => {
    const sendResponse = jest.fn();
    const session = { id: '1', name: 'Test Session', tabs: [] };
    const message = { action: 'saveSession', data: session };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [] });
    
    await mockBrowser.runtime.onMessage.listener(message, {}, sendResponse);
    
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ sessions: [session] });
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });

  test('handles loadSession action', async () => {
    const sendResponse = jest.fn();
    const session = { id: '1', name: 'Test Session', tabs: [{ url: 'https://example.com' }] };
    const message = { action: 'loadSession', data: '1' };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [session] });
    
    await mockBrowser.runtime.onMessage.listener(message, {}, sendResponse);
    
    expect(mockBrowser.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });

  test('handles deleteSession action', async () => {
    const sendResponse = jest.fn();
    const session = { id: '1', name: 'Test Session', tabs: [] };
    const message = { action: 'deleteSession', data: '1' };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [session] });
    
    await mockBrowser.runtime.onMessage.listener(message, {}, sendResponse);
    
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ sessions: [] });
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
  });

  test('creates Save All Tabs menu item', () => {
    expect(mockBrowser.menus.create).toHaveBeenCalledWith({
      id: "save-all-tabs",
      title: "Save All Tabs",
      contexts: ["bookmark"],
      onclick: expect.any(Function)
    });
  });
});