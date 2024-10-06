document.addEventListener('DOMContentLoaded', () => {
    loadBookmarks();
});

async function loadBookmarks() {
    const bookmarks = await browser.runtime.sendMessage({action: "getBookmarks"});
    const container = document.getElementById('bookmarks-list');
    renderBookmarks(bookmarks[0], container);
}

function renderBookmarks(node, container, level = 0) {
    if (node.children) {
        const folderElement = document.createElement('div');
        folderElement.className = 'bookmark-folder';
        folderElement.style.marginLeft = `${level * 20}px`;
        folderElement.textContent = node.title || 'Bookmarks';
        container.appendChild(folderElement);

        node.children.forEach(child => renderBookmarks(child, container, level + 1));
    } else {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark-item';
        bookmarkElement.style.marginLeft = `${level * 20}px`;
        const link = document.createElement('a');
        link.href = node.url;
        link.textContent = node.title;
        link.target = '_blank';
        bookmarkElement.appendChild(link);
        container.appendChild(bookmarkElement);
    }
}