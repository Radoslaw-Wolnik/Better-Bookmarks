function createBookmarkElement(bookmark) {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  
  const icon = document.createElement('img');
  icon.src = bookmark.url ? `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}` : 'icons/folder.png';
  
  const title = document.createElement('a');
  title.className = 'bookmark-item-title';
  title.textContent = bookmark.title;
  
  if (bookmark.url) {
    title.href = bookmark.url;
  } else {
    title.classList.add('bookmark-folder');
    title.addEventListener('click', (e) => {
      e.preventDefault();
      title.classList.toggle('open');
      const childrenContainer = item.nextElementSibling;
      if (childrenContainer) {
        childrenContainer.classList.toggle('open');
      }
    });
  }
  
  item.appendChild(icon);
  item.appendChild(title);
  
  return item;
}

function renderBookmarks(bookmarkItems, container) {
  bookmarkItems.forEach((bookmark) => {
    const bookmarkElement = createBookmarkElement(bookmark);
    container.appendChild(bookmarkElement);
    
    if (bookmark.children) {
      const childContainer = document.createElement('div');
      childContainer.className = 'bookmark-children';
      container.appendChild(childContainer);
      renderBookmarks(bookmark.children, childContainer);
    }
  });
}

function initBookmarksManager() {
  const bookmarksContainer = document.createElement('div');
  bookmarksContainer.className = 'bookmarks-view';
  document.body.appendChild(bookmarksContainer);

  browser.runtime.sendMessage({action: "getBookmarks"}).then((response) => {
    renderBookmarks(response.bookmarks, bookmarksContainer);
  });
}

// Initialize the bookmarks manager when the page loads
document.addEventListener('DOMContentLoaded', initBookmarksManager);