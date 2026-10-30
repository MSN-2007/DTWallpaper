# Desktop Canvas

> Open-source, local-first, customisable desktop productivity canvas.

## Vision

Your desktop becomes your personal productivity workspace. No separate apps, no cloud dependencies, no forced layouts.

Activate a freeform canvas overlay, place widgets anywhere, connect them together, and build your own productivity environment.

## Status

**Sprint 0** — Foundation (in progress)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Tauri 2 |
| Backend | Rust |
| Frontend | React + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Database | SQLite (Sprint 3) |
| Icons | Lucide |

## Development

### Prerequisites

- Rust ≥ 1.75
- Node.js ≥ 20
- npm or pnpm
- Tauri CLI v2

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
cargo tauri dev

# Build for production
cargo tauri build
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Toggle canvas visibility |
| `E` | Toggle view/edit mode |

## Architecture

```
DTWallpaper/
├── src-tauri/          # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs     # Entry point
│   │   ├── lib.rs      # App setup, shortcuts, plugins
│   │   └── commands/   # IPC command handlers
│   └── Cargo.toml
├── src/                # React frontend
│   ├── main.tsx        # React entry
│   ├── App.tsx         # Root component
│   ├── canvas/         # Canvas engine
│   ├── stores/         # Zustand state
│   ├── styles/         # CSS / Tailwind
│   └── types/          # TypeScript definitions
└── package.json
```

## License

MIT

