# Desktop Canvas (DTWallpaper)

> **Open-Source, Local-First Freeform Desktop Productivity Canvas**

Transform your desktop into a **temporary interactive productivity planner** that appears right on your OS desktop — alongside your real wallpaper and desktop icons — whenever you need it, and disappears cleanly when you're done.

---

## 🌟 Core Highlights

- **Temporary Desktop Planner Mode**: A custom trigger minimises all your windows to reveal the real OS desktop, then overlays your interactive productivity canvas on top — fully transparent, layered cleanly over your actual wallpaper.
- **Global Triggers**: Mouse-shake gesture (rapid left-right shake), `Ctrl+Space`, `Alt+Space`, or `F8` to summon/dismiss the canvas from anywhere.
- **Auto-Dismiss Timer**: Session auto-dismisses after a configurable duration (30s / 45s / 60s or pinned) — restoring all your previous windows exactly as they were.
- **Zero Cloud / Local-First**: 100% of your data, widgets, and layouts are stored locally.
- **Ultra-Lightweight**: Built on **Tauri 2 + Rust + React/TypeScript**. ~20 MB RAM idle, ~4 MB binary.
- **Freeform Spatial Canvas**: Infinite whiteboard with pan, zoom, drag, resize, multi-select, and snap.
- **Modular Widgets**: Clock, Countdown Timer, Pomodoro Focus, To-do List, and extensible Custom blocks.
- **Canva-Inspired 3-Panel Architecture**: Left navigation rail, contextual resource sidebar, main canvas workspace.

---

## 🎯 Temporary Desktop Planner – How It Works

### Normal Working Mode
You work normally with VS Code, Chrome, Terminal, and other apps open.

### Trigger Activation (any of these)
| Trigger | Method |
|---|---|
| **Mouse Shake** | Rapidly shake mouse left-right (4+ reversals within 400ms) |
| **Keyboard** | `Ctrl+Space` / `Alt+Space` / `F8` |
| **Tray Icon** | Click the Desktop Canvas system tray icon |

### What Happens
```
1. Capture current foreground window (saved for restore)
2. Invoke Windows "Show Desktop" (Win+D) to minimise all windows
3. Display the productivity canvas over your real desktop wallpaper
4. Session timer starts (default 45 seconds, configurable)
```

### Planner Session
You see your real desktop transformed into a productivity workspace — actual wallpaper, actual desktop icons, with your interactive canvas overlaid on top. All widgets are live: to-dos, Pomodoro, clock, notes.

### Session End
When the timer expires **or** you press `Esc` (or click Dismiss):
```
1. Save any pending widget changes
2. Hide the canvas overlay
3. Restore windows (Win+D again to un-minimise)
4. Restore focus to the previous foreground window
```
No apps are closed. No browser tabs lost. No work disrupted.

---

## 🎛️ Keyboard Shortcuts & Controls

| Shortcut / Control | Action |
|--------------------|--------|
| `Ctrl+Space` | Summon / dismiss the desktop canvas (global) |
| `Alt+Space` | Fallback summon / dismiss shortcut |
| `F8` | Fallback summon / dismiss shortcut |
| Mouse Shake (rapid L-R) | Summon / activate the planner session |
| `Esc` | Dismiss canvas & restore previous desktop |
| `E` | Toggle **View Mode** ↔ **Edit Mode** |
| **Middle Click Drag** or **Canvas Drag** | Pan the infinite canvas |
| **Mouse Wheel** | Zoom in / out (cursor-anchored) |
| **Widget Header Drag** | Reposition widget *(Edit Mode)* |
| **Widget Bottom-Right Corner** | Resize widget *(Edit Mode)* |

---

## 🔔 Session HUD

A floating HUD appears in the top-right of the canvas while your session is active:

- **Circular countdown ring**: Animated ring showing time remaining
- **30s / 45s / 60s quick buttons**: Change session duration mid-session
- **📌 Pin button**: Lock the planner open indefinitely (pauses timer)
- **✕ Dismiss button**: Manually end session and restore windows

---

## 🧩 Built-in Widgets

| Widget | Type Key | Description |
|---|---|---|
| **Clock & Date** | `clock` | Elegant local time display with weekday, date, monospace tabular font |
| **Countdown Timer** | `timer` | 1m/5m/10m/15m presets, live progress bar, pause/resume/reset |
| **Pomodoro Focus** | `pomodoro` | 25m focus, 5m short break, 15m long break, session count |
| **To-do List** | `todo-list` | Inline task creation, check-off, delete, persistent across sessions |
| **Custom Note Block** | `custom` | Free-form editable note, link, or markdown-style block |

---

## 🛠️ How to Build, Add & Upload Custom Widgets

The widget architecture is fully modular — any React component can become a canvas widget.

### Step 1: Create Your Widget Component

Create a new file in `src/widgets/` (e.g. `src/widgets/custom/MyWidget.tsx`):

```tsx
import React from "react";
import { Sparkles } from "lucide-react";

interface MyWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

export const MyWidget: React.FC<MyWidgetProps> = () => {
  return (
    <div className="flex flex-col justify-between h-full p-3.5 select-none text-white">
      <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider text-[10px]">My Custom Widget</span>
      </div>
      <div className="my-auto text-center text-xs text-white/70">
        Hello from my custom desktop canvas widget!
      </div>
    </div>
  );
};
```

### Step 2: Register the Widget

Open [`src/widgets/registry.ts`](src/widgets/registry.ts) and add your widget to `WIDGET_REGISTRY`:

```ts
import { MyWidget } from "./custom/MyWidget";

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // ... existing widgets ...
  "my-widget": {
    type: "my-widget",
    name: "My Widget",
    category: "custom",   // "productivity" | "information" | "scheduling" | "custom"
    defaultWidth: 280,
    defaultHeight: 180,
    description: "My custom desktop canvas widget",
    component: MyWidget,
  },
};
```

### Step 3: Use Your Widget

1. Run the app (`cargo tauri dev`).
2. Press `E` to enter **Edit Mode**.
3. Open the **Widgets** panel in the left navigation rail.
4. Find your widget and click **Add to Canvas**.
5. Drag, resize, and arrange it anywhere.

### Step 4: Share / Submit Your Widget

```bash
git add src/widgets/custom/MyWidget.tsx src/widgets/registry.ts
git commit -m "feat(widget): add MyWidget"
git push origin main
# Then open a PR at https://github.com/MSN-2007/DTWallpaper
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Desktop Framework** | Tauri 2 (Rust) |
| **Frontend UI** | React 18 + TypeScript |
| **Bundler** | Vite |
| **Styling** | Tailwind CSS v4 |
| **State Management** | Zustand (local-persistent) |
| **Icons** | Lucide React |
| **Windows Native APIs** | `windows-rs` crate (`Win32::UI::Input::KeyboardAndMouse`, `Win32::UI::WindowsAndMessaging`) |

---

## 🚀 Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Rust & Cargo](https://rustup.rs/) v1.75+
- Tauri CLI v2 (`cargo install tauri-cli`)

### Quickstart

```bash
# Clone the repository
git clone https://github.com/MSN-2007/DTWallpaper.git
cd DTWallpaper

# Install frontend dependencies
npm install

# Run frontend only (browser dev mode)
npm run dev

# Run full native desktop app (Rust + React)
cargo tauri dev

# Build production binary
cargo tauri build --no-bundle
```

The compiled binary is at `src-tauri/target/release/desktop-canvas.exe`.

> **Note on `npm tauri dev`**: This is incorrect. Use `cargo tauri dev` (Tauri CLI is a Cargo binary, not an npm script — unless you add `"tauri": "tauri"` to `package.json` scripts, which is optional).

---

## 📁 Repository Structure

```
DTWallpaper/
├── src-tauri/                  # Rust backend (Tauri 2)
│   ├── src/
│   │   ├── main.rs             # App entrypoint
│   │   ├── lib.rs              # IPC commands, global shortcuts, session setup
│   │   ├── session/
│   │   │   ├── mod.rs          # Session module exports
│   │   │   ├── controller.rs   # Desktop Session state machine (IDLE → PLANNER_ACTIVE → IDLE)
│   │   │   └── mouse_hook.rs   # Low-level WH_MOUSE_LL mouse shake detector (Windows)
│   │   └── platform/           # OS-specific wallpaper & desktop icon queries
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                        # React frontend
│   ├── canvas/
│   │   ├── Canvas.tsx          # Main canvas: pan/zoom, header HUD, keyboard shortcuts
│   │   ├── WidgetContainer.tsx # Drag, resize, selection chrome
│   │   └── DesktopIconsLayer.tsx # Optional desktop icon overlay
│   ├── components/
│   │   ├── navigation/NavigationRail.tsx   # 68px left nav rail (8 tabs)
│   │   ├── sidebar/ResourceSidebar.tsx     # Contextual resource panels
│   │   └── session/SessionHUD.tsx          # Session timer HUD with pin/dismiss
│   ├── widgets/
│   │   ├── information/        # Clock widget
│   │   ├── productivity/       # Timer, Pomodoro, Todo widgets
│   │   ├── analytics/          # Productivity analytics widget
│   │   ├── system/             # System monitor widget
│   │   ├── custom/             # Custom note/block widget
│   │   └── registry.ts         # Central widget type registry
│   ├── templates/templates.ts  # Workspace template definitions
│   ├── themes/themes.ts        # Theme definitions (Obsidian, Jade, etc.)
│   ├── stores/                 # Zustand stores with local persistence
│   ├── types/                  # TypeScript interfaces
│   ├── App.tsx                 # App root
│   └── main.tsx                # Entry script
└── package.json
```

---

## 🔧 Session Controller IPC Commands

These Tauri IPC commands are available from the frontend:

| Command | Description |
|---|---|
| `start_planner_session` | Activate planner (Show Desktop + overlay canvas) |
| `dismiss_planner_session` | Dismiss planner (hide canvas + restore windows) |
| `toggle_planner_session` | Toggle current session state |
| `get_session_state` | Returns current `SessionState` enum value |
| `set_session_pinned(pinned: bool)` | Pin/unpin the session (pauses auto-dismiss) |
| `is_session_pinned` | Returns current pin state |
| `set_session_duration(seconds: u64)` | Set auto-dismiss countdown duration |
| `get_session_duration` | Returns configured session duration |

---

## 📜 License

[MIT](LICENSE)
