import { modifyBookmarksBar } from './content-scripts/bookmarks-modifier.js';
import { saveAllTabs } from './background.js';

function initBookmarkManager() {
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

  saveAllTabs();
}

// Ensure the DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookmarkManager);
} else {
  initBookmarkManager();
}