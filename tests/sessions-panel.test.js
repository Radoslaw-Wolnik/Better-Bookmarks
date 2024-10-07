import { jest } from '@jest/globals';
import * as sessionsPanel from '../src/panels/sessions-panel.js';

describe('Sessions Panel', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sessions-container">
        <button id="save-session">Save Current Session</button>
        <div id="sessions-list"></div>
      </div>
    `;
    resetAllMocks();
  });

  test('loadSessions populates sessions list', async () => {
    const mockSessions = [
      { id: '1', name: 'Session 1' },
      { id: '2', name: 'Session 2' }
    ];
    browser.runtime.sendMessage.mockResolvedValue(mockSessions);

    await sessionsPanel.loadSessions();

    const sessionsList = document.getElementById('sessions-list');
    expect(sessionsList.children.length).toBe(2);
    expect(sessionsList.innerHTML).toContain('Session 1');
    expect(sessionsList.innerHTML).toContain('Session 2');
  });

  test('saveCurrentSession creates new session', async () => {
    global.prompt = jest.fn().mockReturnValue('New Session');
    browser.tabs.query.mockResolvedValue([{ title: 'Tab 1', url: 'https://example.com' }]);
    browser.runtime.sendMessage.mockResolvedValue({ success: true });

    await sessionsPanel.saveCurrentSession();

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'saveSession',
      data: expect.objectContaining({
        name: 'New Session',
        tabs: [{ title: 'Tab 1', url: 'https://example.com' }]
      })
    });
  });

  test('handleLoadSession sends correct message', () => {
    sessionsPanel.handleLoadSession('1');
    
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'loadSession',
      data: '1'
    });
  });

  test('handleDeleteSession sends correct message and reloads sessions', async () => {
    browser.runtime.sendMessage.mockResolvedValue({ success: true });

    await sessionsPanel.handleDeleteSession('1');

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'deleteSession',
      data: '1'
    });
    // Check if loadSessions was called after deletion
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({ action: 'getSessions' });
  });

  test('Event listeners are set up correctly', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    sessionsPanel.initializeEventListeners();

    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
    
    const saveSessionButton = document.getElementById('save-session');
    const clickEvent = new Event('click');
    saveSessionButton.dispatchEvent(clickEvent);

    expect(browser.tabs.query).toHaveBeenCalled();
  });
});