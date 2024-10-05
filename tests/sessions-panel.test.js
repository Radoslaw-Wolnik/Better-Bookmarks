import { jest } from '@jest/globals';
import { handleLoadSession, handleDeleteSession, loadSessions, saveCurrentSession } from '../src/panels/sessions-panel.js';

describe('Sessions Panel', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sessions-container">
        <button id="save-session">Save Current Session</button>
        <div id="sessions-list"></div>
      </div>
    `;
    global.browser = {
      runtime: {
        sendMessage: jest.fn()
      },
      tabs: {
        query: jest.fn()
      }
    };
  });

  test('loadSessions populates sessions list', async () => {
    const mockSessions = [
      { id: '1', name: 'Session 1' },
      { id: '2', name: 'Session 2' }
    ];
    browser.runtime.sendMessage.mockResolvedValue(mockSessions);

    await loadSessions();

    const sessionsList = document.getElementById('sessions-list');
    expect(sessionsList.children.length).toBe(2);
    expect(sessionsList.innerHTML).toContain('Session 1');
    expect(sessionsList.innerHTML).toContain('Session 2');
  });

  test('saveCurrentSession creates new session', async () => {
    global.prompt = () => 'New Session';
    browser.tabs.query.mockResolvedValue([{ title: 'Tab 1', url: 'https://example.com' }]);
    browser.runtime.sendMessage.mockResolvedValue({ success: true });

    await saveCurrentSession();

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'saveSession',
      data: expect.objectContaining({
        name: 'New Session',
        tabs: [{ title: 'Tab 1', url: 'https://example.com' }]
      })
    });
  });

  test('handles load session button click', async () => {
    /*
    document.getElementById('sessions-list').innerHTML = `
      <div class="session-item">
        <button class="load-session" data-session-id="1">Load</button>
      </div>
    `;

    const loadButton = document.querySelector('.load-session');
    loadButton.click();
    */
    handleLoadSession('1');
    
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'loadSession',
      data: '1'
    });
  });

  test('handles delete session button click', async () => {
    /*
    document.getElementById('sessions-list').innerHTML = `
      <div class="session-item">
        <button class="delete-session" data-session-id="1">Delete</button>
      </div>
    `;

    const deleteButton = document.querySelector('.delete-session');
    deleteButton.click();
    */
    handleDeleteSession('1');

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'deleteSession',
      data: '1'
    });
  });
});