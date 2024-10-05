// Optimization: Use event delegation for session list
document.getElementById('sessions-list').addEventListener('click', async (e) => {
    if (e.target.classList.contains('load-session')) {
      const sessionId = e.target.dataset.sessionId;
      await browser.runtime.sendMessage({ action: 'loadSession', data: sessionId });
    } else if (e.target.classList.contains('delete-session')) {
      const sessionId = e.target.dataset.sessionId;
      await browser.runtime.sendMessage({ action: 'deleteSession', data: sessionId });
      loadSessions();
    }
  });
  
  document.getElementById('save-session').addEventListener('click', saveCurrentSession);
  
  async function loadSessions() {
    const sessions = await browser.runtime.sendMessage({ action: 'getSessions' });
    const sessionsList = document.getElementById('sessions-list');
    
    // Optimization: Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    sessions.forEach(session => {
      const sessionElement = document.createElement('div');
      sessionElement.className = 'session-item';
      sessionElement.innerHTML = `
        <span>${session.name}</span>
        <button class="load-session" data-session-id="${session.id}">Load</button>
        <button class="delete-session" data-session-id="${session.id}">Delete</button>
      `;
      fragment.appendChild(sessionElement);
    });
    
    sessionsList.innerHTML = '';
    sessionsList.appendChild(fragment);
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
  
  // Initial load
  loadSessions();

  export { loadSessions, saveCurrentSession };