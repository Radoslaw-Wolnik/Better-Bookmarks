function injectCustomUI() {
    const toolbar = document.createElement('div');
    toolbar.id = 'enhanced-toolbar';
    toolbar.innerHTML = `
      <button id="sessions-button">Sessions</button>
      <div id="sessions-panel" style="display:none;">
        <button id="save-session">Save Current Session</button>
        <div id="sessions-list"></div>
      </div>
    `;
    document.body.insertBefore(toolbar, document.body.firstChild);
  
    document.getElementById('sessions-button').addEventListener('click', toggleSessionsPanel);
    document.getElementById('save-session').addEventListener('click', saveCurrentSession);
  
    loadSessions();
  }
  
  function toggleSessionsPanel() {
    const panel = document.getElementById('sessions-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
  
  async function loadSessions() {
    const sessions = await browser.runtime.sendMessage({action: "getSessions"});
    const sessionsList = document.getElementById('sessions-list');
    sessionsList.innerHTML = '';
    
    sessions.forEach(session => {
      const sessionElement = document.createElement('div');
      sessionElement.textContent = session.name;
      sessionElement.addEventListener('click', () => loadSession(session.id));
      sessionsList.appendChild(sessionElement);
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
  
  function loadSession(sessionId) {
    browser.runtime.sendMessage({action: "loadSession", data: sessionId});
  }
  
  function modifyBookmarksUI() {
    document.body.style.backgroundColor = '#f0f0f0';
    const bookmarkItems = document.querySelectorAll('.bookmark-item');
    bookmarkItems.forEach(item => {
      item.style.borderRadius = '5px';
      item.style.margin = '5px 0';
      item.style.padding = '10px';
      item.style.backgroundColor = 'white';
    });
  }
  
  if (window.location.href === "about:blank?bookmarksManager") {
    injectCustomUI();
  }
  
  modifyBookmarksUI();