function handleLoadSession(sessionId) {
  browser.runtime.sendMessage({ action: 'loadSession', data: sessionId });
}

function handleDeleteSession(sessionId) {
  browser.runtime.sendMessage({ action: 'deleteSession', data: sessionId });
  loadSessions();
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const sessionsList = document.getElementById('sessions-list');
  if (sessionsList) {
    sessionsList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('load-session')) {
        handleLoadSession(e.target.dataset.sessionId);
      } else if (e.target.classList.contains('delete-session')) {
        handleDeleteSession(e.target.dataset.sessionId);
      }
    });
  }

  document.getElementById('save-session')?.addEventListener('click', saveCurrentSession);

  // Initial load
  loadSessions();
});

async function loadSessions() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'getSessions' });
    const sessions = Array.isArray(response) ? response : [];
    const sessionsList = document.getElementById('sessions-list');
    
    if (sessionsList) {
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
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}


async function saveCurrentSession() {
  try {
    const sessionName = prompt('Enter a name for this session:');
    if (sessionName) {
      const tabs = await browser.tabs.query({ currentWindow: true });
      const session = {
        id: Date.now().toString(),
        name: sessionName,
        tabs: tabs.map(tab => ({ title: tab.title, url: tab.url }))
      };
      await browser.runtime.sendMessage({ action: 'saveSession', data: session });
      await loadSessions();
    }
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export { loadSessions, saveCurrentSession, handleLoadSession, handleDeleteSession };