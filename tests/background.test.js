import { jest } from '@jest/globals';
import { actionHandlers, saveAllTabs } from '../src/background.js';

describe('Background Script', () => {
  let mockBrowser;

  beforeEach(() => {
    mockBrowser = global.browser;
    jest.clearAllMocks();
  });

  test('handles getBookmarks action', async () => {
    mockBrowser.bookmarks.getTree.mockResolvedValue([]);
    
    const result = await actionHandlers.getBookmarks();
    
    expect(mockBrowser.bookmarks.getTree).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('handles getSessions action', async () => {
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [] });
    
    const result = await actionHandlers.getSessions();
    
    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith('sessions');
    expect(result).toEqual([]);
  });

  test('handles saveSession action', async () => {
    const session = { id: '1', name: 'Test Session', tabs: [] };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [] });
    
    const result = await actionHandlers.saveSession(session);
    
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ sessions: [session] });
    expect(result).toEqual({ success: true });
  });

  test('handles loadSession action', async () => {
    const session = { id: '1', name: 'Test Session', tabs: [{ url: 'https://example.com' }] };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [session] });
    
    const result = await actionHandlers.loadSession('1');
    
    expect(mockBrowser.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
    expect(result).toEqual({ success: true });
  });

  test('handles deleteSession action', async () => {
    const session = { id: '1', name: 'Test Session', tabs: [] };
    mockBrowser.storage.local.get.mockResolvedValue({ sessions: [session] });
    
    const result = await actionHandlers.deleteSession('1');
    
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ sessions: [] });
    expect(result).toEqual({ success: true });
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

