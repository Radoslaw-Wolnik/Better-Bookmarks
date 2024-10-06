# Better Bookmarks

## Overview

Better Bookmarks is a Firefox add-on that enhances the built-in bookmarks functionality with improved UI and session management capabilities. It seamlessly integrates with Firefox's native bookmarks bar, providing a more intuitive and powerful bookmarking experience.

## Features

- Enhanced bookmarks UI integrated into Firefox's native bookmarks bar
- Session management
  - Save current browsing session
  - Restore saved sessions
  - Edit and delete saved sessions
- "Save All Tabs" functionality via context menu

## Installation

1. Clone this repository or download the source code.
2. Open Firefox and navigate to `about:debugging`.
3. Click "This Firefox" in the left sidebar.
4. Click "Load Temporary Add-on" and select any file from the project directory.

## Usage

### Bookmarks Management

- The enhanced bookmarks UI replaces the "Other Bookmarks" button in the Firefox bookmarks bar with a "Sessions" button.
- Click on the "Sessions" button to open the sessions management panel.

### Session Management

- To save the current session:
  1. Click the "Sessions" button in the bookmarks bar.
  2. Click "Save Current Session" in the panel that appears.
  3. Enter a name for the session when prompted.
- To restore a session:
  - Click on the session name in the sessions panel.
- To delete a session:
  - Click the delete button next to the session name.

### Save All Tabs

- Right-click on any bookmark in the bookmarks bar.
- Select "Save All Tabs" from the context menu.

## Project Structure

```
better-bookmarks/
├── src/
│   ├── background.js
│   ├── content-scripts/
│   │   ├── bookmarks-modifier.js
│   │   └── bookmarks-modifier.css
│   ├── panels/
│   │   ├── sessions-panel.html
│   │   ├── sessions-panel.js
│   │   └── sessions-panel.css
│   └── manifest.json
├── test/
│   ├── background.test.js
│   ├── bookmarks-modifier.test.js
│   └── sessions-panel.test.js
├── README.md
└── CONTRIBUTING.md
```

## Development

### Prerequisites

- Firefox Browser
- Node.js and npm (for running tests)

### Testing

To run the test suite:

```
npm test
```

## ToDo:
 - [ ] browser.bookmarks.openInTabClosesMenu set to false should make it so the toolbar doesn't close after opening a bookmark in a tab. (ctrl + click does not close the bookmarks folder)
 - [ ] restoring and backuping sessions 
 - [ ] same open/closed folders as before closing the sidebar (persisting state and not blank each time opened - or opened tollbar dir as defualt)
 - [ ] na bok otwierjące się foldery albo okienka - nie w dół
 - [ ] can i make custom toolbar (ctrl+Shift+B thingy)
 - [ ] eneble scrolling lol
## Contributing

While this is primarily a personal project, contributions or suggestions are welcome. Please see the [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License.