import { modifyBookmarksBar, toggleSessionsPanel } from '../src/content-scripts/bookmarks-modifier.js';

describe('Bookmarks Modifier', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="PersonalToolbar">
        <div class="bookmark-item" label="Other Bookmarks"></div>
      </div>
    `;
    global.browser = {
      runtime: {
        getURL: jest.fn((path) => `mocked-extension://${path}`)
      }
    };
  });

  test('modifyBookmarksBar replaces Other Bookmarks with Sessions button', () => {
    modifyBookmarksBar();
    const sessionsButton = document.getElementById('sessions-button');
    expect(sessionsButton).not.toBeNull();
    expect(sessionsButton.getAttribute('label')).toBe('Sessions');
  });

  test('toggleSessionsPanel creates and removes iframe', () => {
    toggleSessionsPanel();
    let iframe = document.getElementById('sessions-panel-iframe');
    expect(iframe).not.toBeNull();
    expect(iframe.src).toBe('mocked-extension://panels/sessions-panel.html');

    toggleSessionsPanel();
    iframe = document.getElementById('sessions-panel-iframe');
    expect(iframe).toBeNull();
  });
});