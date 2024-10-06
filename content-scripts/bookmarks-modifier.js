function createChromelikeUI() {
    const container = document.createElement('div');
    container.id = 'chrome-like-bookmarks';
    container.innerHTML = `
      <div id="bookmark-toolbar">
        <button id="add-bookmark">Add bookmark</button>
        <input type="text" id="search-bookmarks" placeholder="Search bookmarks">
      </div>
      <div id="bookmarks-tree"></div>
    `;
    document.body.appendChild(container);
  
    document.getElementById('add-bookmark').addEventListener('click', addBookmark);
    document.getElementById('search-bookmarks').addEventListener('input', searchBookmarks);
  
    loadBookmarks();
  }
  
  async function loadBookmarks() {
    const bookmarks = await browser.runtime.sendMessage({action: "getBookmarks"});
    const treeContainer = document.getElementById('bookmarks-tree');
    renderBookmarkTree(bookmarks[0], treeContainer);
  }
  
  function renderBookmarkTree(node, container, level = 0) {
    if (node.children) {
      const folderElement = document.createElement('div');
      folderElement.className = 'bookmark-folder';
      folderElement.style.paddingLeft = `${level * 20}px`;
      folderElement.innerHTML = `
        <span class="folder-icon">📁</span>
        <span class="folder-name">${node.title || 'Bookmarks'}</span>
      `;
      container.appendChild(folderElement);
  
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'folder-children';
      container.appendChild(childrenContainer);
  
      node.children.forEach(child => renderBookmarkTree(child, childrenContainer, level + 1));
    } else {
      const bookmarkElement = document.createElement('div');
      bookmarkElement.className = 'bookmark-item';
      bookmarkElement.style.paddingLeft = `${level * 20}px`;
      bookmarkElement.innerHTML = `
        <span class="bookmark-icon">🔖</span>
        <a href="${node.url}" target="_blank">${node.title}</a>
      `;
      container.appendChild(bookmarkElement);
    }
  }
  
  function addBookmark() {
    const url = prompt('Enter the URL of the bookmark:');
    const title = prompt('Enter the title of the bookmark:');
    if (url && title) {
      browser.runtime.sendMessage({
        action: 'createBookmark',
        data: { url, title }
      }).then(() => loadBookmarks());
    }
  }
  
  function searchBookmarks() {
    const searchTerm = document.getElementById('search-bookmarks').value.toLowerCase();
    const bookmarkItems = document.querySelectorAll('.bookmark-item');
    bookmarkItems.forEach(item => {
      const title = item.textContent.toLowerCase();
      item.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
  }
  
  function interceptCtrlB(event) {
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      browser.runtime.sendMessage({action: "toggleSidebar"});
    }
  }
  
  document.addEventListener('keydown', interceptCtrlB);
  
  if (window.location.href.startsWith("about:")) {
    createChromelikeUI();
  }