const actionHandlers = {
  getBookmarks: async () => {
    return await browser.bookmarks.getTree();
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
    actionHandlers[action](data)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error(`Error in ${action}:`, error);
        sendResponse({ success: false, error: error.message });
      });
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
  try {
    const tabs = await browser.tabs.query({currentWindow: true});
    if (!tabs || tabs.length === 0) {
      console.error('No tabs found');
      return;
    }
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
    console.log('All tabs saved successfully');
  } catch (error) {
    console.error('Error saving tabs:', error);
  }
}

export { actionHandlers, saveAllTabs };