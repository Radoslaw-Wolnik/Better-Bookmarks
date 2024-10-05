describe('Session Management', () => {
  beforeEach(async () => {
    await page.goto(`moz-extension://${EXTENSION_ID}/sessions/sessions.html`);
  });

  test('Session management page loads correctly', async () => {
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Session Management');
  });

  test('Can save current session', async () => {
    await page.evaluate(() => {
      window.browser.tabs.query = jest.fn().mockResolvedValue([
        { title: 'Tab 1', url: 'https://example.com/1' },
        { title: 'Tab 2', url: 'https://example.com/2' },
      ]);
      window.browser.storage.local.get = jest.fn().mockResolvedValue({ sessions: [] });
      window.browser.storage.local.set = jest.fn();
      window.prompt = jest.fn().mockReturnValue('Test Session');
    });

    await page.click('#save-session');

    const sessionsSaved = await page.evaluate(() => {
      const savedSessions = browser.storage.local.set.mock.calls[0][0].sessions;
      return savedSessions.length === 1 && savedSessions[0].tabs.length === 2;
    });
    expect(sessionsSaved).toBe(true);
  });

  test('Prompts for overwrite when saving session with existing name', async () => {
    await page.evaluate(() => {
      window.browser.tabs.query = jest.fn().mockResolvedValue([
        { title: 'Tab 1', url: 'https://example.com/1' },
      ]);
      window.browser.storage.local.get = jest.fn().mockResolvedValue({ 
        sessions: [{ name: 'Test Session', tabs: [] }] 
      });
      window.browser.storage.local.set = jest.fn();
      window.prompt = jest.fn().mockReturnValue('Test Session');
      window.confirm = jest.fn().mockReturnValue(true);
    });

    await page.click('#save-session');

    const overwritePrompted = await page.evaluate(() => window.confirm.mock.calls.length === 1);
    expect(overwritePrompted).toBe(true);
  });

  test('Saved sessions are displayed correctly', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Session 1', tabs: [{ title: 'Tab 1', url: 'https://example.com/1' }] },
          { name: 'Session 2', tabs: [{ title: 'Tab 2', url: 'https://example.com/2' }] },
        ]
      });
      loadSessions();
    });

    await page.waitForSelector('.session-item');
    const sessionItems = await page.$$('.session-item');
    expect(sessionItems.length).toBe(2);
  });

  test('Can load a saved session by clicking on session name', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Test Session', tabs: [{ title: 'Test Tab', url: 'https://example.com' }] },
        ]
      });
      window.browser.tabs.create = jest.fn();
      loadSessions();
    });

    await page.waitForSelector('.session-name');
    await page.click('.session-name');

    const tabCreated = await page.evaluate(() => 
      browser.tabs.create.mock.calls.length === 1 &&
      browser.tabs.create.mock.calls[0][0].url === 'https://example.com'
    );
    expect(tabCreated).toBe(true);
  });

  test('Can toggle session tabs visibility', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Test Session', tabs: [{ title: 'Test Tab', url: 'https://example.com' }] },
        ]
      });
      loadSessions();
    });

    await page.waitForSelector('.folder-icon');
    await page.click('.folder-icon');

    const tabsListVisible = await page.$eval('.tabs-list', el => !el.classList.contains('hidden'));
    expect(tabsListVisible).toBe(true);
  });

  test('Can delete a tab from a session', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Test Session', tabs: [{ title: 'Test Tab', url: 'https://example.com' }] },
        ]
      });
      window.browser.storage.local.set = jest.fn();
      loadSessions();
    });

    await page.waitForSelector('.folder-icon');
    await page.click('.folder-icon');
    await page.waitForSelector('.delete-tab');
    await page.click('.delete-tab');

    const tabDeleted = await page.evaluate(() => {
      const updatedSessions = browser.storage.local.set.mock.calls[0][0].sessions;
      return updatedSessions[0].tabs.length === 0;
    });
    expect(tabDeleted).toBe(true);
  });

  test('Can add current tabs to an existing session', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Test Session', tabs: [{ title: 'Existing Tab', url: 'https://example.com/existing' }] },
        ]
      });
      window.browser.tabs.query = jest.fn().mockResolvedValue([
        { title: 'New Tab', url: 'https://example.com/new' },
      ]);
      window.browser.storage.local.set = jest.fn();
      loadSessions();
    });

    await page.waitForSelector('.add-tabs');
    await page.click('.add-tabs');

    const tabsAdded = await page.evaluate(() => {
      const updatedSessions = browser.storage.local.set.mock.calls[0][0].sessions;
      return updatedSessions[0].tabs.length === 2;
    });
    expect(tabsAdded).toBe(true);
  });

  test('Right-clicking a session shows context menu', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Test Session', tabs: [{ title: 'Test Tab', url: 'https://example.com' }] },
        ]
      });
      loadSessions();
    });

    await page.waitForSelector('.session-name');
    await page.click('.session-name', { button: 'right' });

    const contextMenuVisible = await page.$eval('.context-menu', el => el.style.display !== 'none');
    expect(contextMenuVisible).toBe(true);
  });

  test('Can delete a session from context menu', async () => {
    await page.evaluate(() => {
      window.browser.storage.local.get = jest.fn().mockResolvedValue({
        sessions: [
          { name: 'Test Session', tabs: [{ title: 'Test Tab', url: 'https://example.com' }] },
        ]
      });
      window.browser.storage.local.set = jest.fn();
      window.confirm = jest.fn().mockReturnValue(true);
      loadSessions();
    });

    await page.waitForSelector('.session-name');
    await page.click('.session-name', { button: 'right' });
    await page.waitForSelector('.context-menu-item[data-action="delete"]');
    await page.click('.context-menu-item[data-action="delete"]');

    const sessionDeleted = await page.evaluate(() => {
      const updatedSessions = browser.storage.local.set.mock.calls[0][0].sessions;
      return updatedSessions.length === 0;
    });
    expect(sessionDeleted).toBe(true);
  });
});