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
        folderElement.textContent = truncateText(node.title || 'Bookmarks', 25);
        folderElement.title = node.title || 'Bookmarks'; // Full title on hover
        container.appendChild(folderElement);

        node.children.forEach(child => renderBookmarks(child, container, level + 1));
    } else {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark-item';
        bookmarkElement.style.marginLeft = `${level * 20}px`;
        const link = document.createElement('a');
        link.href = node.url;
        link.textContent = truncateText(node.title, 25);
        link.title = node.title;
        link.target = '_blank';
        bookmarkElement.appendChild(link);
        container.appendChild(bookmarkElement);
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
