import { modifyBookmarksBar } from './content-scripts/bookmarks-modifier.js';
import { saveAllTabs } from './background.js';

// Initialize the bookmark manager
document.addEventListener('DOMContentLoaded', () => {
  modifyBookmarksBar();
  saveAllTabs();
});