# YouTrack Helper 🚀

A cross-platform desktop utility for YouTrack - A Spotlight/Raycast-like quick launcher for searching and managing YouTrack tickets.

## Features

✨ **Lightning-Fast Search** - Fuzzy search through your YouTrack tickets in milliseconds

🎯 **Global Hotkey** - Quick access to your ticket search (configurable)

📋 **Multi-Project Support** - Search across multiple YouTrack projects simultaneously

🎨 **Beautiful UI** - Modern, dark-themed interface built with React and Tailwind CSS

🔐 **Secure** - API tokens stored securely in OS Keychain (Windows/macOS) or encrypted locally (Linux)

🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux

## Tech Stack

- **Backend**: Go with Wails v2
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn UI
- **Search**: CMDk for command palette interface
- **Security**: OS Keyring integration for token storage
- **Build**: GitHub Actions for cross-platform builds

## Installation

### Windows

Download the latest `.exe` from [Releases](https://github.com/zwoabier/youtrack-helper/releases)

### macOS

Download the latest `.dmg` from [Releases](https://github.com/zwoabier/youtrack-helper/releases)

### Linux

Download the latest `.AppImage` from [Releases](https://github.com/zwoabier/youtrack-helper/releases)

```bash
chmod +x youtrack-helper*.AppImage
./youtrack-helper*.AppImage
```

## Getting Started

### Prerequisites

1. **Go 1.21** or later
2. **Node.js 18** or later
3. **npm** or **yarn**

### For macOS/Linux (additional dependencies):

```bash
# macOS
brew install pkg-config

# Ubuntu/Debian
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.1-dev build-essential pkg-config
```

### Building from Source

1. Clone the repository:

```bash
git clone https://github.com/zwoabier/youtrack-helper.git
cd youtrack-helper
```

2. Install Wails:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

3. Build the project:

```bash
wails build
```

The compiled binary will be in the `build/bin` directory.

## Development

### Running in Development Mode

```bash
wails dev
```

This will start both the Go backend and React frontend with hot-reload.

### Building the Frontend Only

```bash
cd frontend
npm install
npm run build
```

## Configuration

On first run, YouTrack Helper will guide you through a setup wizard:

1. **YouTrack Base URL** - Your YouTrack instance URL (e.g., `https://myorg.youtrack.cloud`)
2. **API Token** - Generate a permanent token in YouTrack settings
3. **Projects** - Select which projects to include in search
4. **Window Position** - Choose where the search window appears

Configuration is stored in:
- **Windows**: `%APPDATA%/youtrack-helper/config.json`
- **macOS/Linux**: `~/.config/youtrack-helper/config.json`

API tokens are stored securely in your OS keychain.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑/↓` | Navigate results |
| `Enter` | Copy ticket URL to clipboard |
| `Shift+Enter` | Open ticket in browser |
| `Esc` | Close window |
| `Click away` | Hide window |

## Architecture

### Backend (Go)

- REST API client for YouTrack
- Ticket caching and background sync
- Config and token management
- Runtime integration (clipboard, browser, window management)

### Frontend (React)

- Command palette UI for searching
- Real-time fuzzy search
- Keyboard navigation
- Responsive ticket display

## Roadmap

- [ ] Global hotkey configuration
- [ ] Quick actions (assign, change priority, add comment)
- [ ] Ticket preview panel
- [ ] Custom filters and saved searches
- [ ] Dark/Light theme toggle
- [ ] Plugins/Extensions support

## Troubleshooting

### "Not Configured" on first run

This is expected! Follow the setup wizard to configure your YouTrack instance.

### API Token not working

Ensure your YouTrack token is:
- A **permanent token** (not a session token)
- Has appropriate permissions
- Your YouTrack instance is accessible from your network

### Tickets not syncing

- Check your internet connection
- Verify API token validity in YouTrack settings
- Check the logs (if available in dev mode)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/zwoabier/youtrack-helper/issues)
- Check [Discussions](https://github.com/zwoabier/youtrack-helper/discussions)
