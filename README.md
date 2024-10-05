# Better Bookmarks Manager

## Overview

Better Bookmarks is a Firefox add-on that improves upon the built-in bookmarks manager with advanced features and a more user-friendly interface. It offers upgraded bookmark management, session saving and restoration, and design improvements.

## Features

- Improved bookmark management interface
- "Save All Tabs" functionality
- Session management
  - Save current browsing session
  - Restore saved sessions
  - Edit saved sessions (add/remove tabs)
  - Overwrite existing sessions
- Search functionality for bookmarks
- Context menu for quick actions on sessions

## Installation

1. Download the latest release from the [Releases page](https://github.com/radoslaw-wolnik/better-bookmarks/releases).
2. Open Firefox and navigate to `about:addons`.
3. Click the gear icon and select "Install Add-on From File".
4. Select the downloaded `.xpi` file.

## Usage

### Bookmarks Management

- Access the better bookmarks manager by clicking on the add-on icon in the toolbar.
- Use the search bar to find specific bookmarks quickly.
- Click on folder icons to expand/collapse bookmark folders.
- Right-click on the bookmarks toolbar and select "Save All Tabs" to save all open tabs as bookmarks in a new folder.

### Session Management

- Click on the add-on icon and select "Sessions" to access the session management interface.
- To save the current session:
  1. Click "Save Current Session".
  2. Enter a name for the session when prompted.
- To restore a session:
  - Click on the session name to open all tabs in that session.
- To view tabs in a session:
  - Click the folder icon next to the session name.
- To edit a session:
  - Remove individual tabs by clicking the trash can icon next to the tab.
  - Add current tabs to an existing session by clicking "Add current tabs".
- To delete a session:
  - Right-click on the session name and select "Delete" from the context menu.

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/better-bookmarks.git
   ```
2. Navigate to the project directory:
   ```
   cd better-bookmarks
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Building

To build the add-on:

```
npm run build
```

This will create a `.xpi` file in the `dist` directory.

### Testing

To run the test suite:

```
npm test
```

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub Issues page](https://github.com/radoslaw-wolnik/better-bookmarks/issues).

## Roadmap

- [ ] Implement sync functionality
- [ ] Add import/export features
- [ ] Implement keyboard shortcuts

## Acknowledgements

- [Mozilla WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Jest](https://jestjs.io/) for testing
- [Puppeteer](https://pptr.dev/) for browser automation in testing