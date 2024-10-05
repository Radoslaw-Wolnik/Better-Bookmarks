function modifyBookmarksBar() {
  const bookmarksBar = document.getElementById('PersonalToolbar');
  if (bookmarksBar) {
    const otherBookmarks = bookmarksBar.querySelector('.bookmark-item[label="Other Bookmarks"]');
    if (otherBookmarks) {
      const sessionsButton = document.createElement('toolbarbutton');
      sessionsButton.id = 'sessions-button';
      sessionsButton.setAttribute('label', 'Sessions');
      sessionsButton.setAttribute('tooltiptext', 'Manage Sessions');
      sessionsButton.addEventListener('click', toggleSessionsPanel);
      otherBookmarks.parentNode.replaceChild(sessionsButton, otherBookmarks);
    }
  }
}
  
function toggleSessionsPanel() {
  const existingPanel = document.getElementById('sessions-panel-iframe');
  if (existingPanel) {
    existingPanel.remove();
  } else {
    const iframe = document.createElement('iframe');
    iframe.id = 'sessions-panel-iframe';
    iframe.src = browser.runtime.getURL('panels/sessions-panel.html');
    document.body.appendChild(iframe);
  }
}
  
// Optimization: Use MutationObserver to wait for bookmarks bar to be available
const observer = new MutationObserver((mutations, obs) => {
  const bookmarksBar = document.getElementById('PersonalToolbar');
  if (bookmarksBar) {
    modifyBookmarksBar();
    obs.disconnect();
  }
});
  
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

export { modifyBookmarksBar, toggleSessionsPanel };