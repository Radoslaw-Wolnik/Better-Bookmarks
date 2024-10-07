import { jest } from '@jest/globals';
import * as bookmarksModifier from '../src/content-scripts/bookmarks-modifier.js';

describe('Bookmarks Modifier', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="PersonalToolbar">
        <div class="bookmark-item" label="Other Bookmarks"></div>
      </div>
      <div id="chrome-like-bookmarks"></div>
    `;
    resetAllMocks();
  });

  test('createChromelikeUI creates correct structure', () => {
    bookmarksModifier.createChromelikeUI();
    const container = document.getElementById('chrome-like-bookmarks');
    expect(container).not.toBeNull();
    expect(container.querySelector('#bookmark-toolbar')).not.toBeNull();
    expect(container.querySelector('#add-bookmark')).not.toBeNull();
    expect(container.querySelector('#search-bookmarks')).not.toBeNull();
    expect(container.querySelector('#bookmarks-tree')).not.toBeNull();
  });

  test('loadBookmarks calls runtime.sendMessage and renders bookmarks', async () => {
    const mockBookmarks = [{
      children: [
        { title: 'Folder', children: [] },
        { title: 'Bookmark', url: 'https://example.com' }
      ]
    }];
    browser.runtime.sendMessage.mockResolvedValue(mockBookmarks);

    await bookmarksModifier.loadBookmarks();

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({action: "getBookmarks"});
    const treeContainer = document.getElementById('bookmarks-tree');
    expect(treeContainer.innerHTML).toContain('Folder');
    expect(treeContainer.innerHTML).toContain('Bookmark');
  });

  test('addBookmark creates a new bookmark', async () => {
    global.prompt = jest.fn()
      .mockReturnValueOnce('https://example.com')
      .mockReturnValueOnce('Example');
    
    await bookmarksModifier.addBookmark();

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'createBookmark',
      data: { url: 'https://example.com', title: 'Example' }
    });
  });

  test('searchBookmarks filters bookmarks correctly', () => {
    document.body.innerHTML = `
      <input id="search-bookmarks" value="test">
      <div id="bookmarks-tree">
        <div class="bookmark-item">Test Bookmark</div>
        <div class="bookmark-item">Another Bookmark</div>
      </div>
    `;

    bookmarksModifier.searchBookmarks();

    const bookmarkItems = document.querySelectorAll('.bookmark-item');
    expect(bookmarkItems[0].style.display).toBe('block');
    expect(bookmarkItems[1].style.display).toBe('none');
  });

  test('interceptCtrlB prevents default and toggles sidebar', () => {
    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
    const preventDefault = jest.spyOn(event, 'preventDefault');

    bookmarksModifier.interceptCtrlB(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({action: "toggleSidebar"});
  });
});