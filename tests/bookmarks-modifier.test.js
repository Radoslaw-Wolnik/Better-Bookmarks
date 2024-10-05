// File: test/bookmarks-modifier.test.js
describe('Bookmarks Modifier', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="PersonalToolbar">
          <div class="bookmark-item" label="Other Bookmarks"></div>
        </div>
      `;
      global.browser = {
        runtime: {
          getURL: jest.fn().mockReturnValue('mock-url')
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
      expect(iframe.src).toBe('mock-url');
  
      toggleSessionsPanel();
      iframe = document.getElementById('sessions-panel-iframe');
      expect(iframe).toBeNull();
    });
  });