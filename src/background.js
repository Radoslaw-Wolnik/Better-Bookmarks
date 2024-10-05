// Add "Save All Tabs" to the bookmarks menu
browser.menus.create({
  id: "save-all-tabs",
  title: "Save All Tabs",
  contexts: ["bookmark"],
  onclick: saveAllTabs
});

function saveAllTabs() {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    const folderName = `Saved Tabs - ${new Date().toLocaleString()}`;
    browser.bookmarks.create({title: folderName}).then((folder) => {
      tabs.forEach((tab) => {
        browser.bookmarks.create({
          parentId: folder.id,
          title: tab.title,
          url: tab.url
        });
      });
    });
  });
}

// Open sessions page when clicking the browser action icon
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({url: "/sessions/sessions.html"});
});

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getBookmarks") {
    browser.bookmarks.getTree().then((bookmarkItems) => {
      sendResponse({bookmarks: bookmarkItems});
    });
    return true; // Indicates we will send a response asynchronously
  }
});