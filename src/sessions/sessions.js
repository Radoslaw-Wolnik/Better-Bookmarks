// sessions/sessions.js

document.getElementById('save-session').addEventListener('click', saveCurrentSession);

function saveCurrentSession() {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    const sessionName = prompt("Enter a name for this session:");
    if (sessionName) {
      const session = {
        name: sessionName,
        tabs: tabs.map(tab => ({title: tab.title, url: tab.url}))
      };
      browser.storage.local.get({sessions: []}).then((result) => {
        const sessions = result.sessions;
        const existingSessionIndex = sessions.findIndex(s => s.name === sessionName);
        if (existingSessionIndex !== -1) {
          if (confirm(`A session named "${sessionName}" already exists. Do you want to overwrite it?`)) {
            sessions[existingSessionIndex] = session;
          } else {
            return;
          }
        } else {
          sessions.push(session);
        }
        browser.storage.local.set({sessions}).then(() => {
          loadSessions();
        });
      });
    }
  });
}

function loadSessions() {
  const sessionsList = document.getElementById('sessions-list');
  sessionsList.innerHTML = '';
  browser.storage.local.get({sessions: []}).then((result) => {
    result.sessions.forEach((session, index) => {
      const sessionElement = document.createElement('div');
      sessionElement.className = 'session-item';
      sessionElement.innerHTML = `
        <button class="folder-icon" data-index="${index}">📁</button>
        <span class="session-name">${session.name}</span>
        <div class="session-actions">
          <button class="button add-tabs" data-index="${index}">Add current tabs</button>
        </div>
      `;
      sessionsList.appendChild(sessionElement);

      const tabsList = document.createElement('div');
      tabsList.className = 'tabs-list hidden';
      session.tabs.forEach((tab, tabIndex) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab-item';
        tabElement.innerHTML = `
          <span class="tab-title">${tab.title}</span>
          <button class="delete-tab" data-session-index="${index}" data-tab-index="${tabIndex}">🗑️</button>
        `;
        tabsList.appendChild(tabElement);
      });
      sessionsList.appendChild(tabsList);
    });
  });
}

document.getElementById('sessions-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('session-name')) {
    const sessionIndex = e.target.closest('.session-item').querySelector('.folder-icon').dataset.index;
    loadSession(parseInt(sessionIndex));
  } else if (e.target.classList.contains('folder-icon')) {
    const tabsList = e.target.closest('.session-item').nextElementSibling;
    tabsList.classList.toggle('hidden');
  } else if (e.target.classList.contains('delete-tab')) {
    const sessionIndex = parseInt(e.target.dataset.sessionIndex);
    const tabIndex = parseInt(e.target.dataset.tabIndex);
    deleteTabFromSession(sessionIndex, tabIndex);
  } else if (e.target.classList.contains('add-tabs')) {
    const sessionIndex = parseInt(e.target.dataset.index);
    addCurrentTabsToSession(sessionIndex);
  }
});

document.getElementById('sessions-list').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (e.target.classList.contains('session-name') || e.target.classList.contains('session-item')) {
    const sessionElement = e.target.closest('.session-item');
    const sessionIndex = sessionElement.querySelector('.folder-icon').dataset.index;
    showContextMenu(e.pageX, e.pageY, sessionIndex);
  }
});

function showContextMenu(x, y, sessionIndex) {
  const contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.innerHTML = `
    <button class="context-menu-item" data-action="open" data-index="${sessionIndex}">Open</button>
    <button class="context-menu-item" data-action="delete" data-index="${sessionIndex}">Delete</button>
  `;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  document.body.appendChild(contextMenu);

  contextMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('context-menu-item')) {
      const action = e.target.dataset.action;
      const index = parseInt(e.target.dataset.index);
      if (action === 'open') {
        loadSession(index);
      } else if (action === 'delete') {
        deleteSession(index);
      }
      contextMenu.remove();
    }
  });

  document.addEventListener('click', () => contextMenu.remove(), {once: true});
}

function loadSession(index) {
  browser.storage.local.get({sessions: []}).then((result) => {
    const session = result.sessions[index];
    session.tabs.forEach(tab => {
      browser.tabs.create({url: tab.url});
    });
  });
}

function deleteSession(index) {
  if (confirm('Are you sure you want to delete this session?')) {
    browser.storage.local.get({sessions: []}).then((result) => {
      const sessions = result.sessions;
      sessions.splice(index, 1);
      browser.storage.local.set({sessions}).then(() => {
        loadSessions();
      });
    });
  }
}

function deleteTabFromSession(sessionIndex, tabIndex) {
  browser.storage.local.get({sessions: []}).then((result) => {
    const sessions = result.sessions;
    sessions[sessionIndex].tabs.splice(tabIndex, 1);
    browser.storage.local.set({sessions}).then(() => {
      loadSessions();
    });
  });
}

function addCurrentTabsToSession(sessionIndex) {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    browser.storage.local.get({sessions: []}).then((result) => {
      const sessions = result.sessions;
      const newTabs = tabs.map(tab => ({title: tab.title, url: tab.url}));
      sessions[sessionIndex].tabs.push(...newTabs);
      browser.storage.local.set({sessions}).then(() => {
        loadSessions();
      });
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadSessions);