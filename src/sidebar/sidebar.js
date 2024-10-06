document.addEventListener('DOMContentLoaded', () => {
    loadBookmarks();
    loadSessions();
    document.getElementById('save-session').addEventListener('click', saveCurrentSession);
});

async function loadBookmarks() {
    const bookmarks = await browser.bookmarks.getTree();
    const container = document.getElementById('bookmarks-list');
    renderBookmarks(bookmarks[0], container);
}

function renderBookmarks(node, container) {
    if (node.children) {
        node.children.forEach(child => renderBookmarks(child, container));
    } else {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark-item';
        const link = document.createElement('a');
        link.href = node.url;
        link.textContent = node.title;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            browser.tabs.create({ url: node.url });
        });
        bookmarkElement.appendChild(link);
        container.appendChild(bookmarkElement);
    }
}

async function loadSessions() {
    const sessions = await browser.runtime.sendMessage({action: "getSessions"});
    const sessionsList = document.getElementById('sessions-list');
    sessionsList.innerHTML = '';
    
    sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'session-item';
        sessionElement.textContent = session.name;
        sessionElement.addEventListener('click', () => loadSession(session.id));
        sessionsList.appendChild(sessionElement);
    });
}

async function saveCurrentSession() {
    const sessionName = prompt('Enter a name for this session:');
    if (sessionName) {
        await browser.runtime.sendMessage({
            action: "saveSession",
            data: { name: sessionName, id: Date.now().toString(), timestamp: Date.now() }
        });
        loadSessions();
    }
}

function loadSession(sessionId) {
    browser.runtime.sendMessage({action: "loadSession", data: sessionId});
}