describe('Bookmarks Functionality', () => {
  beforeEach(async () => {
    await page.goto(`moz-extension://${EXTENSION_ID}/popup/popup.html`);
  });

  test('Bookmarks page is enhanced with custom styles', async () => {
    const bookmarksView = await page.$('.bookmarks-view');
    expect(bookmarksView).not.toBeNull();
  });

  test('Bookmark items are displayed correctly', async () => {
    const bookmarkItems = await page.$$('.bookmark-item');
    expect(bookmarkItems.length).toBeGreaterThan(0);
  });

  test('Bookmark folders can be expanded and collapsed', async () => {
    const folderItem = await page.$('.bookmark-folder');
    expect(folderItem).not.toBeNull();

    await folderItem.click();
    const expandedChildren = await page.$('.bookmark-children.open');
    expect(expandedChildren).not.toBeNull();

    await folderItem.click();
    const collapsedChildren = await page.$('.bookmark-children:not(.open)');
    expect(collapsedChildren).not.toBeNull();
  });

  test('Can save all tabs', async () => {
    await page.evaluate(() => {
      window.browser = {
        tabs: {
          query: jest.fn().mockResolvedValue([
            { title: 'Tab 1', url: 'https://example.com/1' },
            { title: 'Tab 2', url: 'https://example.com/2' },
          ]),
        },
        bookmarks: {
          create: jest.fn().mockImplementation((bookmark) => {
            if (!bookmark.url) return Promise.resolve({ id: 'folder-id' });
            return Promise.resolve({ id: 'bookmark-id' });
          }),
        },
      };
      saveAllTabs();
    });

    const bookmarksFolderCreated = await page.evaluate(() => 
      browser.bookmarks.create.mock.calls.some(call => call[0].title.startsWith('Saved Tabs'))
    );
    expect(bookmarksFolderCreated).toBe(true);

    const bookmarksCreated = await page.evaluate(() => 
      browser.bookmarks.create.mock.calls.filter(call => call[0].url).length
    );
    expect(bookmarksCreated).toBe(2);
  });

  test('Search input filters bookmarks correctly', async () => {
    await page.evaluate(() => {
      window.browser.bookmarks.getTree = jest.fn().mockResolvedValue([{
        children: [
          { title: 'Bookmark 1', url: 'https://example.com/1' },
          { title: 'Bookmark 2', url: 'https://example.com/2' },
          { title: 'Different', url: 'https://example.com/3' },
        ]
      }]);
      renderBookmarks([{
        children: [
          { title: 'Bookmark 1', url: 'https://example.com/1' },
          { title: 'Bookmark 2', url: 'https://example.com/2' },
          { title: 'Different', url: 'https://example.com/3' },
        ]
      }], document.querySelector('.bookmarks-view'));
    });

    await page.type('#searchInput', 'Bookmark');

    const visibleBookmarks = await page.$$eval('.bookmark-item', items => 
      items.filter(item => item.style.display !== 'none').length
    );
    expect(visibleBookmarks).toBe(2);
  });
});