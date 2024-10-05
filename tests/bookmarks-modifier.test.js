// File: tests/bookmarks-modifier.test.js

import { modifyBookmarksBar, toggleSessionsPanel } from '../src/content-scripts/bookmarks-modifier';

describe('Bookmarks Modifier', () => {
  beforeEach(() => {
    // Set up the document body
    document.body.innerHTML = `
      <div id="PersonalToolbar">
        <div class="bookmark-item" label="Other Bookmarks"></div>
      </div>
    `;
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