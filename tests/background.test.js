import { jest } from '@jest/globals';
import * as background from '../src/background.js';

describe('Background Script', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('actionHandlers', () => {
    test('getBookmarks returns bookmarks tree', async () => {
      const mockBookmarks = [{ id: '1', title: 'Test Bookmark' }];
      browser.bookmarks.getTree.mockResolvedValue(mockBookmarks);
      
      const result = await background.actionHandlers.getBookmarks();
      
      expect(browser.bookmarks.getTree).toHaveBeenCalled();
      expect(result).toEqual(mockBookmarks);
    });

    test('getSessions returns stored sessions', async () => {
      const mockSessions = [{ id: '1', name: 'Test Session' }];
      browser.storage.local.get.mockResolvedValue({ sessions: mockSessions });
      
      const result = await background.actionHandlers.getSessions();
      
      expect(browser.storage.local.get).toHaveBeenCalledWith('sessions');
      expect(result).toEqual(mockSessions);
    });

    test('saveSession adds a new session', async () => {
      const newSession = { id: '2', name: 'New Session' };
      browser.storage.local.get.mockResolvedValue({ sessions: [] });
      
      const result = await background.actionHandlers.saveSession(newSession);
      
      expect(browser.storage.local.set).toHaveBeenCalledWith({ sessions: [newSession] });
      expect(result).toEqual({ success: true });
    });

    test('loadSession creates tabs for session', async () => {
      const session = { id: '1', tabs: [{ url: 'https://example.com' }] };
      browser.storage.local.get.mockResolvedValue({ sessions: [session] });
      
      const result = await background.actionHandlers.loadSession('1');
      
      expect(browser.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
      expect(result).toEqual({ success: true });
    });

    test('deleteSession removes a session', async () => {
      const sessions = [{ id: '1' }, { id: '2' }];
      browser.storage.local.get.mockResolvedValue({ sessions });
      
      const result = await background.actionHandlers.deleteSession('1');
      
      expect(browser.storage.local.set).toHaveBeenCalledWith({ sessions: [{ id: '2' }] });
      expect(result).toEqual({ success: true });
    });

    test('saveAllTabs creates bookmarks for all tabs', async () => {
      const mockTabs = [
        { title: 'Tab 1', url: 'https://example.com' },
        { title: 'Tab 2', url: 'https://example.org' }
      ];
      browser.tabs.query.mockResolvedValue(mockTabs);
      browser.bookmarks.create.mockResolvedValue({ id: 'folder-id' });

      const result = await background.actionHandlers.saveAllTabs();

      expect(browser.tabs.query).toHaveBeenCalledWith({ currentWindow: true });
      expect(browser.bookmarks.create).toHaveBeenCalledTimes(3); // Once for folder, twice for tabs
      expect(result).toEqual({ success: true, message: 'All tabs saved successfully' });
    });

    test('toggleSidebar toggles sidebar state', async () => {
      background.sidebarOpen = false;

      const result = await background.actionHandlers.toggleSidebar();

      expect(browser.sidebarAction.open).toHaveBeenCalled();
      expect(result).toEqual({ success: true, isOpen: true });

      const secondResult = await background.actionHandlers.toggleSidebar();

      expect(browser.sidebarAction.close).toHaveBeenCalled();
      expect(secondResult).toEqual({ success: true, isOpen: false });
    });
  });

  test('menus.create is called with correct parameters', () => {
    background.initializeMenus();
    expect(browser.menus.create).toHaveBeenCalledWith({
      id: "save-all-tabs",
      title: "Save All Tabs",
      contexts: ["action"],
      onclick: expect.any(Function)
    });
  });

  test('commands.onCommand listener is set up correctly', () => {
    background.initializeCommands();
    expect(browser.commands.onCommand.addListener).toHaveBeenCalledWith(expect.any(Function));
  });
});