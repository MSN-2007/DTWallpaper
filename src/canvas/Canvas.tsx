import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/stores";
import {
  Layers,
  Edit3,
  Eye,
  Minimize2,
  Command,
  Cpu,
  Monitor,
} from "lucide-react";

interface AppInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
}

interface PlatformCapabilities {
  global_shortcuts: boolean;
  transparency: boolean;
  system_tray: boolean;
  display_protocol: string;
  desktop_environment: string;
}

/**
 * Freeform canvas component.
 *
 * Sprint 0: Renders the infinite blank Obsidian canvas with coordinate grid,
 * mode switching, native window controls, and platform status.
 *
 * Architectural principles:
 * - CSS transform-based viewport (zoom and pan)
 * - Canvas coordinates separated from screen coordinates
 * - Lightweight render footprint (< 0.1% CPU idle)
 */
export function Canvas() {
  const viewport = useCanvasStore((s) => s.viewport);
  const widgets = useCanvasStore((s) => s.widgets);
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [capabilities, setCapabilities] =
    useState<PlatformCapabilities | null>(null);

  // Fetch app info and platform capabilities on mount
  useEffect(() => {
    async function loadInfo() {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const info = await invoke<AppInfo>("get_app_info");
        const caps = await invoke<PlatformCapabilities>(
          "get_platform_capabilities"
        );
        setAppInfo(info);
        setCapabilities(caps);
      } catch {
        // Dev fallback in browser
        setAppInfo({
          name: "Desktop Canvas",
          version: "0.1.0",
          platform: "development",
          arch: "x64",
        });
        setCapabilities({
          global_shortcuts: true,
          transparency: true,
          system_tray: true,
          display_protocol: "web",
          desktop_environment: "browser",
        });
      }
    }
    loadInfo();
  }, []);

  // Keyboard shortcut: 'E' toggles edit mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "e" || e.key === "E") {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          setMode(mode === "view" ? "edit" : "view");
        }
      }
    },
    [mode, setMode]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleHideWindow = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("hide_canvas");
    } catch {
      useCanvasStore.getState().hide();
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      {/* Canvas Viewport Transform Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Sprint 1 will render freeform widgets here */}
      </div>

      {/* Empty State / Welcome Canvas Notice */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center max-w-lg px-8 py-7 rounded-2xl bg-[#141414]/80 backdrop-blur-md border border-[#262626] text-center shadow-2xl pointer-events-auto transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-medium tracking-tight text-[#f3f4f6] mb-1">
              Desktop Productivity Canvas
            </h1>
            <p className="text-xs text-[#9ca3af] mb-6">
              Open-source, local-first freeform desktop environment
            </p>

            <div className="w-full grid grid-cols-2 gap-2 text-left mb-6 text-xs text-[#d1d5db]">
              <div className="p-2.5 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2a] font-mono text-[10px] text-[#e5e7eb] border border-[#3a3a3a]">
                  Ctrl+Space
                </kbd>
                <span className="text-[#9ca3af]">Toggle overlay</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2a] font-mono text-[10px] text-[#e5e7eb] border border-[#3a3a3a]">
                  E
                </kbd>
                <span className="text-[#9ca3af]">Toggle Edit / View</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2a] font-mono text-[10px] text-[#e5e7eb] border border-[#3a3a3a]">
                  Esc
                </kbd>
                <span className="text-[#9ca3af]">Dismiss canvas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center gap-2">
                <span className="text-indigo-400 font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Sprint 0
                </span>
                <span className="text-[#9ca3af]">Foundation ready</span>
              </div>
            </div>

            {capabilities && (
              <div className="w-full pt-3 border-t border-[#262626] flex items-center justify-between text-[11px] text-[#6b7280]">
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Protocol:{" "}
                    <span className="text-[#9ca3af] capitalize">
                      {capabilities.display_protocol}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    OS:{" "}
                    <span className="text-[#9ca3af] capitalize">
                      {appInfo?.platform ?? "Linux"}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Header Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: App Title and Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414]/70 backdrop-blur-md border border-[#262626] text-xs pointer-events-auto shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#e5e7eb]">Desktop Canvas</span>
          <span className="text-[#6b7280] font-mono text-[10px]">v0.1.0</span>
        </div>

        {/* Right: Mode Switcher & Window Dismiss */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setMode(mode === "view" ? "edit" : "view")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border backdrop-blur-md transition-all shadow-lg ${
              mode === "edit"
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30"
                : "bg-[#141414]/70 text-[#9ca3af] border-[#262626] hover:text-[#e5e7eb] hover:bg-[#1a1a1a]/80"
            }`}
          >
            {mode === "edit" ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Editing Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#9ca3af]" />
                <span>Viewing Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleHideWindow}
            title="Minimize Canvas (Ctrl+Space)"
            className="p-2 rounded-lg bg-[#141414]/70 hover:bg-[#222222]/80 backdrop-blur-md border border-[#262626] text-[#9ca3af] hover:text-[#f3f4f6] transition-all shadow-lg"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Status, Zoom, Coordinates */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#6b7280] pointer-events-none select-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-md bg-[#141414]/80 backdrop-blur-md border border-[#262626] font-mono text-[11px] text-[#9ca3af]">
            Zoom: {Math.round(viewport.zoom * 100)}%
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#141414]/80 backdrop-blur-md border border-[#262626] font-mono text-[11px] text-[#9ca3af]">
            X: {Math.round(viewport.x)} Y: {Math.round(viewport.y)}
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#141414]/80 backdrop-blur-md border border-[#262626] text-[11px] text-[#9ca3af]">
            {widgets.length} {widgets.length === 1 ? "widget" : "widgets"}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141414]/80 backdrop-blur-md border border-[#262626] text-[11px] text-[#9ca3af]">
            <Command className="w-3 h-3 text-indigo-400" />
            <span>Obsidian Theme</span>
          </div>
        </div>
      </div>

      {/* Toast Mode Hint */}
      <ModeHint mode={mode} />
    </div>
  );
}

function ModeHint({ mode }: { mode: string }) {
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [mode]);

  if (!visible) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none select-none transition-all duration-200">
      <div className="px-3.5 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-medium shadow-xl backdrop-blur-sm border border-indigo-400/30 flex items-center gap-1.5">
        {mode === "edit" ? "✏️ Switched to Edit Mode" : "👁️ Switched to View Mode"}
      </div>
    </div>
  );
}
