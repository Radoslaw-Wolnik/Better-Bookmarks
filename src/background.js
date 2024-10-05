// Optimization: Use object for action mapping instead of if-else
const actionHandlers = {
  getBookmarks: async () => {
    return browser.bookmarks.getTree();
  },
  getSessions: async () => {
    const result = await browser.storage.local.get('sessions');
    return result.sessions || [];
  },
  saveSession: async (session) => {
    const { sessions = [] } = await browser.storage.local.get('sessions');
    sessions.push(session);
    await browser.storage.local.set({ sessions });
    return { success: true };
  },
  loadSession: async (sessionId) => {
    const { sessions } = await browser.storage.local.get('sessions');
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      for (const tab of session.tabs) {
        await browser.tabs.create({ url: tab.url });
      }
      return { success: true };
    }
    return { success: false, error: 'Session not found' };
  },
  deleteSession: async (sessionId) => {
    const { sessions } = await browser.storage.local.get('sessions');
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    await browser.storage.local.set({ sessions: updatedSessions });
    return { success: true };
  }
};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, data } = message;
  if (action in actionHandlers) {
    actionHandlers[action](data).then(sendResponse);
    return true; // Indicates an asynchronous response
  }
});

// Handle "Save All Tabs" context menu item
browser.menus.create({
  id: "save-all-tabs",
  title: "Save All Tabs",
  contexts: ["bookmark"],
  onclick: saveAllTabs
});

async function saveAllTabs() {
  const tabs = await browser.tabs.query({currentWindow: true});
  const folderName = `Saved Tabs - ${new Date().toLocaleString()}`;
  const folder = await browser.bookmarks.create({title: folderName});
  
  // Optimization: Use Promise.all for parallel bookmark creation
  await Promise.all(tabs.map(tab => 
    browser.bookmarks.create({
      parentId: folder.id,
      title: tab.title,
      url: tab.url
    })
  ));
}