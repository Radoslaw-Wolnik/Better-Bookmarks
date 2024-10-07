document.addEventListener('DOMContentLoaded', () => {
    loadBookmarks();
    loadSessions();
    document.getElementById('save-session').addEventListener('click', saveCurrentSession);
    document.getElementById('toggle-bookmarks').addEventListener('click', () => toggleSection('bookmarks'));
    document.getElementById('toggle-sessions').addEventListener('click', () => toggleSection('sessions'));
    document.getElementById('search-input').addEventListener('input', handleSearch);
    restoreState();
});

function saveState() {
  const openFolders = Array.from(document.querySelectorAll('.folder-children[style*="display: block"]'))
      .map(el => el.previousElementSibling.querySelector('.folder-name').textContent);
  const scrollPosition = document.getElementById('bookmarks-list').scrollTop;
  const state = { openFolders, scrollPosition };
  browser.storage.local.set({ sidebarState: state });
}

async function restoreState() {
  const { sidebarState } = await browser.storage.local.get('sidebarState');
  if (sidebarState) {
      const { openFolders, scrollPosition } = sidebarState;
      openFolders.forEach(folderName => {
          const folderElement = Array.from(document.querySelectorAll('.folder-name'))
              .find(el => el.textContent === folderName);
          if (folderElement) {
              const childrenContainer = folderElement.closest('.bookmark-folder').nextElementSibling;
              childrenContainer.style.display = 'block';
              folderElement.closest('.bookmark-folder').querySelector('.folder-toggle').textContent = '▼';
          }
      });
      document.getElementById('bookmarks-list').scrollTop = scrollPosition;
  }
}

  
function toggleSection(section) {
  const bookmarksSection = document.getElementById('bookmarks-section');
  const sessionsSection = document.getElementById('sessions-section');
  const bookmarksButton = document.getElementById('toggle-bookmarks');
  const sessionsButton = document.getElementById('toggle-sessions');
  if (section === 'bookmarks') {
    bookmarksSection.style.display = 'block';
    sessionsSection.style.display = 'none';
    bookmarksButton.classList.add('active');
    sessionsButton.classList.remove('active');
  } else {
    bookmarksSection.style.display = 'none';
    sessionsSection.style.display = 'block';
    bookmarksButton.classList.remove('active');
    sessionsButton.classList.add('active');
  }    
}
  
async function loadBookmarks() {
  const bookmarks = await browser.runtime.sendMessage({action: "getBookmarks"});
  const container = document.getElementById('bookmarks-list');
  //renderBookmarks(bookmarks[0], container);
  container.innerHTML = ''; // Clear existing bookmarks
    
  // Render bookmarks toolbar first
  const toolbarFolder = bookmarks[0].children.find(child => child.id === "toolbar_____");
  if (toolbarFolder) {
    renderBookmarks(toolbarFolder, container);
  }
    
  // Render other bookmarks
  renderBookmarks(bookmarks[0], container);
}
  
function renderBookmarks(node, container, level = 0) {
  if (node.children) {
    const folderElement = document.createElement('div');
    folderElement.className = 'bookmark-folder';
    folderElement.style.paddingLeft = `${level * 20}px`;
    folderElement.innerHTML = `
      <span class="folder-icon">📁</span>
      <span class="folder-toggle">▶</span>
      <span class="folder-name">${node.title || 'Bookmarks'}</span>
    `;
    container.appendChild(folderElement);

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'folder-children';
    childrenContainer.style.display = 'none';
    container.appendChild(childrenContainer);

    folderElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('folder-toggle') || e.target.classList.contains('folder-name') || e.target.classList.contains('folder-icon')) {
        childrenContainer.style.display = childrenContainer.style.display === 'none' ? 'block' : 'none';
        folderElement.querySelector('.folder-toggle').textContent = childrenContainer.style.display === 'none' ? '▶' : '▼';
        saveState();
      }
    });

    node.children.forEach(child => renderBookmarks(child, childrenContainer, level + 1));
  } else {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.className = 'bookmark-item';
    bookmarkElement.style.paddingLeft = `${level * 20}px`;
    bookmarkElement.innerHTML = `
      <img src="https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}" alt="" class="favicon">
    `;
    const link = document.createElement('a');
    link.href = node.url;
    link.textContent = truncateText(node.title, 25);
    link.title = node.title; // Full title on hover
    link.addEventListener('click', (e) => {
      e.preventDefault();
      browser.tabs.create({ url: node.url });
    });
    bookmarkElement.appendChild(link);
    container.appendChild(bookmarkElement);
  }
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
  
async function loadSessions() {
  const sessions = await browser.runtime.sendMessage({action: "getSessions"});
  const sessionsList = document.getElementById('sessions-list');
  sessionsList.innerHTML = '';
  
  sessions.forEach(session => {
    const sessionElement = document.createElement('div');
    sessionElement.className = 'session-item';
    sessionElement.innerHTML = `
      <span class="session-icon">🔖</span>
      <span class="session-name">${truncateText(session.name, 25)}</span>
    `;
    sessionElement.title = session.name;
    sessionElement.addEventListener('click', () => loadSession(session.id));
    sessionsList.appendChild(sessionElement);
  });
}

function handleSearch() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const activeSection = document.querySelector('#toggle-container button.active').id;
  
  if (activeSection === 'toggle-bookmarks') {
      searchBookmarks(searchTerm);
  } else {
      searchSessions(searchTerm);
  }
}

function searchBookmarks(searchTerm) {
  const bookmarkItems = document.querySelectorAll('#bookmarks-list .bookmark-item');
  bookmarkItems.forEach(item => {
      const title = item.textContent.toLowerCase();
      item.style.display = title.includes(searchTerm) ? 'flex' : 'none';
  });
}

function searchSessions(searchTerm) {
  const sessionItems = document.querySelectorAll('#sessions-list .session-item');
  sessionItems.forEach(item => {
      const title = item.textContent.toLowerCase();
      item.style.display = title.includes(searchTerm) ? 'flex' : 'none';
  });
}


  
async function saveCurrentSession() {
  const sessionName = prompt('Enter a name for this session:');
  if (sessionName) {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const session = {
      id: Date.now().toString(),
      name: sessionName,
      tabs: tabs.map(tab => ({ title: tab.title, url: tab.url }))
    };
    await browser.runtime.sendMessage({ action: 'saveSession', data: session });
    loadSessions();
  }
}

// Add event listener for scroll
document.getElementById('bookmarks-list').addEventListener('scroll', () => {
  saveState();
});

function loadSession(sessionId) {
  browser.runtime.sendMessage({action: "loadSession", data: sessionId});
}

