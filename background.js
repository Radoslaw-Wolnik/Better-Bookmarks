let sidebarOpen = false; // Make sure this is globally available

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
  },
  saveAllTabs: async () => {
    try {
      const tabs = await browser.tabs.query({currentWindow: true});
      if (!tabs || tabs.length === 0) {
        return { success: false, error: 'No tabs found' };
      }
      const folderName = `Saved Tabs - ${new Date().toLocaleString()}`;
      const folder = await browser.bookmarks.create({title: folderName});
   
      await Promise.all(tabs.map(tab =>
        browser.bookmarks.create({
          parentId: folder.id,
          title: tab.title,
          url: tab.url
        })
      ));
      return { success: true, message: 'All tabs saved successfully' };
    } catch (error) {
      console.error('Error saving tabs:', error);
      return { success: false, error: error.message };
    }
  },
  toggleSidebar: async () => {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
      await browser.sidebarAction.open();
    } else {
      await browser.sidebarAction.close();
    }
    return { success: true, isOpen: sidebarOpen };
  },

};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, data } = message;
  if (action in actionHandlers) {
    actionHandlers[action](data)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});


browser.menus.create({
  id: "save-all-tabs",
  title: "Save All Tabs",
  contexts: ["action"],
  onclick: () => actionHandlers.saveAllTabs()
});


browser.action.onClicked.addListener(() => {
  console.log("icon clicked");
  actionHandlers.toggleSidebar();
});

browser.commands.onCommand.addListener((command) => {
  if (command === "_execute_sidebar_action") {
    actionHandlers.toggleSidebar();
  }
});
