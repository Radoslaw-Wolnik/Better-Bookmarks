import { jest } from '@jest/globals';
import { actionHandlers, saveAllTabs } from '../src/background.js';

describe('Background Script', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = global.browser;
    jest.clearAllMocks();
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

  test('saveAllTabs creates bookmarks for all tabs', async () => {
    const mockTabs = [
      { title: 'Tab 1', url: 'https://example.com' },
      { title: 'Tab 2', url: 'https://example.org' }
    ];
    mockBrowser.tabs.query.mockResolvedValue(mockTabs);
    mockBrowser.bookmarks.create.mockResolvedValue({ id: 'folder-id' });

    await saveAllTabs();

    expect(mockBrowser.tabs.query).toHaveBeenCalledWith({currentWindow: true});
    expect(mockBrowser.bookmarks.create).toHaveBeenCalledTimes(3); // Once for folder, twice for tabs
    expect(mockBrowser.bookmarks.create).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining('Saved Tabs')
    }));
    mockTabs.forEach(tab => {
      expect(mockBrowser.bookmarks.create).toHaveBeenCalledWith({
        parentId: 'folder-id',
        title: tab.title,
        url: tab.url
      });
    });
  });
});
