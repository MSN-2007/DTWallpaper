# Desktop Canvas (DTWallpaper)

> **Open-Source, Local-First Freeform Desktop Productivity Canvas**

Transform your desktop into your personal productivity workspace. Rather than forcing you into rigid dashboards or separate web applications, Desktop Canvas runs natively on your desktop with an infinite, hardware-accelerated spatial canvas. Place modular widgets anywhere, pan & zoom, resize, and tailor your setup with total freedom.

---

## 🌟 Core Highlights

- **Desktop Overlay**: Summon or hide your personal canvas instantly using `Ctrl+Space`.
- **Zero Cloud / Local-First**: 100% of your data, widgets, and layouts are stored locally on your machine.
- **Ultra-Lightweight**: Built on **Tauri 2 + Rust + React/TypeScript**. Uses ~20 MB RAM at idle with a ~4 MB compiled release binary.
- **Freeform Spatial Canvas**: Viewport panning, cursor-anchored zooming, and customizable widget positioning.
- **Modular Widgets**: Includes built-in Clock, Countdown Timer, Pomodoro Focus, To-do List, and Custom Extensible blocks.

---

## 🎛️ Keyboard Shortcuts & Controls

| Shortcut / Control | Action |
|--------------------|--------|
| <kbd>Ctrl</kbd> + <kbd>Space</kbd> | Global shortcut to summon / hide the desktop canvas overlay |
| <kbd>E</kbd> | Toggle between **Viewing Mode** and **Editing Mode** |
| <kbd>Esc</kbd> | Dismiss canvas overlay |
| **Middle Click Drag** or **Canvas Drag** | Pan around the infinite canvas |
| **Mouse Wheel** | Zoom in / out centered on cursor position |
| **Widget Header Drag** | Reposition widget (*in Edit Mode*) |
| **Widget Bottom-Right Corner** | Resize widget dimensions (*in Edit Mode*) |
| **Add Widget Button** | Open the widget catalog (*in Edit Mode*) |

---

## 🧩 Built-in Widgets

1. **Clock & Date (`clock`)**: Elegant local time display with tabular monospace numbers, weekday, and date.
2. **Countdown Timer (`timer`)**: Precise timer with 1m, 5m, 10m, and 15m presets, live progress bar, pause/resume, and reset.
3. **Pomodoro Focus (`pomodoro`)**: Focus (25m), Short Break (5m), and Long Break (15m) cycles with completed session tracking.
4. **To-do List (`todo-list`)**: Interactive task manager supporting inline task creation, check-off toggles, and deletion.
5. **Custom Note / Block (`custom`)**: User-editable block for custom notes, links, and markdown snippets.

---

## 🛠️ How to Build, Add & Upload Custom Widgets

The Desktop Canvas widget architecture is built to be completely modular and extensible. Any React component can become a canvas widget.

### Step 1: Create Your Widget Component

Create a new file in `src/widgets/` (for example, `src/widgets/custom/MyWidget.tsx`):

```tsx
import React from "react";
import { Sparkles } from "lucide-react";

interface MyWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

export const MyWidget: React.FC<MyWidgetProps> = ({ settings, onUpdateSettings }) => {
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

### Step 2: Register the Widget in the Registry

Open [`src/widgets/registry.ts`](file:///c:/work/DTWallpaper/src/widgets/registry.ts) and add your widget definition to `WIDGET_REGISTRY`:

```tsx
import { MyWidget } from "./custom/MyWidget";

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // ... other widgets
  "my-widget": {
    type: "my-widget",
    name: "My Widget",
    category: "custom", // "productivity" | "information" | "scheduling" | "system-monitor" | "custom"
    defaultWidth: 280,
    defaultHeight: 180,
    description: "My custom desktop canvas widget",
    component: MyWidget,
  },
};
```

### Step 3: Use Your Widget on the Canvas

1. Run the app (`npm run dev` or launch the Tauri executable).
2. Press <kbd>E</kbd> to enter **Editing Mode**.
3. Click the **+ Add Widget** button in the top navigation bar.
4. Select your widget from the modal to place it on the canvas.
5. Drag, resize, and position it wherever you prefer.

### Step 4: Share / Upload Your Widget

1. **Commit your widget files**:
   ```bash
   git add src/widgets/custom/MyWidget.tsx src/widgets/registry.ts
   git commit -m "feat(widget): add MyWidget"
   git push origin main
   ```
2. **Submit a Pull Request**:
   - Push to your fork or branch on GitHub: [https://github.com/MSN-2007/DTWallpaper](https://github.com/MSN-2007/DTWallpaper)
   - Open a PR describing your widget and its category.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Framework** | Tauri 2 (Rust) |
| **Frontend UI** | React 18 + TypeScript |
| **Bundler** | Vite |
| **Styling** | Tailwind CSS (Obsidian Theme) |
| **State Management** | Zustand (Local Persistence) |
| **Icons** | Lucide React |

---

## 🚀 Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Rust & Cargo](https://rustup.rs/) (v1.75+)
- Tauri CLI v2 (`npm run tauri` or `@tauri-apps/cli`)

### Quickstart

```bash
# Clone the repository
git clone https://github.com/MSN-2007/DTWallpaper.git
cd DTWallpaper

# Install dependencies
npm install

# Run frontend in browser dev mode
npm run dev

# Run native desktop app in dev mode
npx tauri dev

# Build production binary
npx tauri build --no-bundle
```

The compiled native executable will be located in:
`src-tauri/target/release/desktop-canvas.exe` (or `desktop-canvas` on Linux).

---

## 📁 Repository Structure

```
DTWallpaper/
├── src-tauri/                 # Rust backend (Tauri 2)
│   ├── src/
│   │   ├── main.rs            # Application entrypoint
│   │   ├── lib.rs             # IPC handlers, global shortcuts, events
│   │   └── platform/          # OS-specific capability detection (Linux/Win/macOS)
│   ├── Cargo.toml             # Rust configuration & optimizations
│   └── tauri.conf.json        # Window & capability permissions
├── src/                       # React frontend
│   ├── canvas/
│   │   ├── Canvas.tsx         # Freeform canvas HUD & viewport transform
│   │   ├── WidgetContainer.tsx# Drag, resize, and selection handles
│   │   └── AddWidgetModal.tsx # Widget catalog modal
│   ├── widgets/
│   │   ├── information/       # Clock & Date widget
│   │   ├── productivity/      # Timer, Pomodoro, and Todo widgets
│   │   ├── custom/            # Custom note/block widget
│   │   └── registry.ts        # Central widget registry & types
│   ├── stores/                # Zustand stores with persistent storage
│   ├── styles/                # Tailwind CSS globals
│   ├── types/                 # Canvas & Widget TypeScript interfaces
│   ├── App.tsx                # App root & native window listener
│   └── main.tsx               # Entry script
└── package.json
```

---

## 📜 License

[MIT](LICENSE)
