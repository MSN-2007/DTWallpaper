import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/stores";
import { WidgetContainer } from "./WidgetContainer";
import { DesktopIconsLayer } from "./DesktopIconsLayer";
import { NavigationRail } from "@/components/navigation/NavigationRail";
import { ResourceSidebar } from "@/components/sidebar/ResourceSidebar";
import { THEMES } from "@/themes/themes";
import type { WallpaperData, DesktopIconItem } from "@/types";
import {
  Edit3,
  Eye,
  Minimize2,
  RotateCcw,
  Sliders,
  X,
  Keyboard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export function Canvas() {
  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const widgets = useCanvasStore((s) => s.widgets);
  const updateWidget = useCanvasStore((s) => s.updateWidget);
  const removeWidget = useCanvasStore((s) => s.removeWidget);
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const selectedWidgetId = useCanvasStore((s) => s.selectedWidgetId);
  const selectWidget = useCanvasStore((s) => s.selectWidget);

  // Navigation & Theme
  const isSidebarOpen = useCanvasStore((s) => s.isSidebarOpen);
  const toggleSidebar = useCanvasStore((s) => s.toggleSidebar);
  const activeThemeId = useCanvasStore((s) => s.activeThemeId);
  const activeTheme = THEMES[activeThemeId] || THEMES.obsidian;

  // Wallpaper & Icons
  const showDesktopIcons = useCanvasStore((s) => s.showDesktopIcons);
  const setShowDesktopIcons = useCanvasStore((s) => s.setShowDesktopIcons);
  const useLiveWallpaper = useCanvasStore((s) => s.useLiveWallpaper);
  const setUseLiveWallpaper = useCanvasStore((s) => s.setUseLiveWallpaper);
  const wallpaperOpacity = useCanvasStore((s) => s.wallpaperOpacity);
  const setWallpaperOpacity = useCanvasStore((s) => s.setWallpaperOpacity);
  const wallpaperData = useCanvasStore((s) => s.wallpaperData);
  const setWallpaperData = useCanvasStore((s) => s.setWallpaperData);
  const desktopIcons = useCanvasStore((s) => s.desktopIcons);
  const setDesktopIcons = useCanvasStore((s) => s.setDesktopIcons);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Canvas Pan State
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const viewportStart = useRef({ x: viewport.x, y: viewport.y });

  // Load Wallpaper and Desktop Icons on mount
  useEffect(() => {
    async function loadDesktopAssets() {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        // Wallpaper
        try {
          const wp = await invoke<WallpaperData>("get_desktop_wallpaper");
          setWallpaperData(wp);
        } catch (e) {
          console.warn("Could not load native wallpaper:", e);
        }

        // Icons
        try {
          const icons = await invoke<DesktopIconItem[]>("get_desktop_icons");
          setDesktopIcons(icons);
        } catch (e) {
          console.warn("Could not load desktop icons:", e);
        }
      } catch {
        // Dev fallback in browser
      }
    }
    loadDesktopAssets();
  }, [setWallpaperData, setDesktopIcons]);

  const handleOpenItem = async (path: string) => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("open_desktop_item", { path });
    } catch (e) {
      console.warn("Could not open desktop item:", e);
    }
  };

  // Handle Canvas Background Panning (Middle Click or pointer on canvas background)
  const handlePointerDownBackground = (e: React.PointerEvent) => {
    if (e.target !== canvasRef.current && e.button !== 1) {
      return;
    }

    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    viewportStart.current = { x: viewport.x, y: viewport.y };
    selectWidget(null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveBackground = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setViewport({
      x: Math.round(viewportStart.current.x + dx),
      y: Math.round(viewportStart.current.y + dy),
    });
  };

  const handlePointerUpBackground = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setIsPanning(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Handle Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!canvasRef.current) return;
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.4), 2.5);

    const rect = canvasRef.current.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    const newX = pointerX - (pointerX - viewport.x) * (newZoom / viewport.zoom);
    const newY = pointerY - (pointerY - viewport.y) * (newZoom / viewport.zoom);

    setViewport({
      zoom: Number(newZoom.toFixed(2)),
      x: Math.round(newX),
      y: Math.round(newY),
    });
  };

  // Keyboard shortcut: 'E' toggles edit mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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

  const resetViewport = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  // Background style based on live wallpaper or active theme
  const wallpaperBackgroundStyle = useLiveWallpaper && wallpaperData?.data_base64
    ? {
        backgroundImage: `url("data:${wallpaperData.mime_type};base64,${wallpaperData.data_base64}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: activeTheme.bgHex,
        backgroundImage: `radial-gradient(circle, ${activeTheme.dotColor} 1px, transparent 1px)`,
        backgroundSize: `${26 * viewport.zoom}px ${26 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      };

  return (
    <div className="relative w-full h-full flex overflow-hidden select-none bg-[#09090b]">
      {/* ── Area A: Left Navigation Rail ────────────────────────────── */}
      <NavigationRail />

      {/* ── Area B: Contextual Resource Sidebar ─────────────────────── */}
      <ResourceSidebar />

      {/* ── Area C: Main Whiteboard Workspace Canvas ────────────────── */}
      <main
        ref={canvasRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDownBackground}
        onPointerMove={handlePointerMoveBackground}
        onPointerUp={handlePointerUpBackground}
        className={`relative flex-1 h-full overflow-hidden ${
          isPanning ? "cursor-grabbing" : ""
        }`}
        style={wallpaperBackgroundStyle}
      >
        {/* Semi-transparent dark overlay if using live wallpaper for contrast */}
        {useLiveWallpaper && wallpaperData?.data_base64 && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              backgroundColor: "#000000",
              opacity: 1 - wallpaperOpacity,
            }}
          />
        )}

        {/* Actual Desktop Icons Layer (Optional) */}
        {showDesktopIcons && desktopIcons.length > 0 && (
          <DesktopIconsLayer icons={desktopIcons} onOpenItem={handleOpenItem} />
        )}

        {/* Freeform Transform Layer for All Widgets */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-auto z-10"
          style={{
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
          }}
        >
          {widgets.map((widget) => (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              isEditMode={mode === "edit"}
              isSelected={selectedWidgetId === widget.id}
              zoom={viewport.zoom}
              onSelect={selectWidget}
              onUpdate={updateWidget}
              onRemove={removeWidget}
            />
          ))}
        </div>

        {/* Top Header Floating Controls Bar */}
        <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
          {/* Left: Sidebar Toggle & Workspace Title */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={toggleSidebar}
              title={isSidebarOpen ? "Collapse Panel" : "Open Resources Panel"}
              className="p-2 rounded-xl bg-[#141416]/80 hover:bg-[#1f1f23]/90 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-all shadow-lg"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141416]/80 backdrop-blur-md border border-white/10 text-xs shadow-lg">
              <span className="font-semibold text-white/90">Main Workspace</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-white/40">
                {activeTheme.name}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Quick Settings (Wallpaper & Icons) */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Display & Wallpaper Settings"
              className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-lg ${
                isSettingsOpen
                  ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                  : "bg-[#141416]/80 text-white/60 hover:text-white border-white/10 hover:bg-[#1a1a1e]/90"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Mode Switcher */}
            <button
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border backdrop-blur-md transition-all shadow-lg ${
                mode === "edit"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-[#141416]/80 text-white/70 border-white/10 hover:text-white hover:bg-[#1a1a1e]/90"
              }`}
            >
              {mode === "edit" ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Mode</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-white/50" />
                  <span>View Mode</span>
                </>
              )}
            </button>

            {/* Minimize / Dismiss Window */}
            <button
              onClick={handleHideWindow}
              title="Minimize Canvas (Ctrl+Space / Alt+Space / F8)"
              className="p-2 rounded-xl bg-[#141416]/80 hover:bg-[#202025]/90 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-all shadow-lg"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop & Wallpaper Settings Flyout */}
        {isSettingsOpen && (
          <div className="absolute top-16 right-4 z-40 w-72 p-4 rounded-2xl bg-[#141417]/95 border border-white/10 shadow-2xl backdrop-blur-xl text-white select-none">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Display & Trigger Options
              </span>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white/90">Show Desktop Icons</div>
                  <div className="text-[10px] text-white/40">Display real desktop icons on canvas</div>
                </div>
                <input
                  type="checkbox"
                  checked={showDesktopIcons}
                  onChange={(e) => setShowDesktopIcons(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white/90">Show My Wallpaper</div>
                  <div className="text-[10px] text-white/40">Use current OS desktop wallpaper</div>
                </div>
                <input
                  type="checkbox"
                  checked={useLiveWallpaper}
                  onChange={(e) => setUseLiveWallpaper(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              {useLiveWallpaper && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-white/70">
                    <span>Wallpaper Visibility</span>
                    <span className="font-mono text-[10px]">{Math.round(wallpaperOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={wallpaperOpacity}
                    onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-[11px] text-white/60">
                <div className="font-medium text-white/80 flex items-center gap-1">
                  <Keyboard className="w-3 h-3 text-indigo-400" /> Summon Hotkeys:
                </div>
                <div className="text-[10px] text-white/50 pl-1 space-y-0.5">
                  <div>• <kbd className="text-white/80 font-mono">Ctrl+Space</kbd></div>
                  <div>• <kbd className="text-white/80 font-mono">Alt+Space</kbd></div>
                  <div>• <kbd className="text-white/80 font-mono">F8</kbd></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Status HUD */}
        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-white/40 pointer-events-none select-none z-30">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="px-2.5 py-1 rounded-lg bg-[#141416]/80 backdrop-blur-md border border-white/10 font-mono text-[11px] text-white/70">
              Zoom: {Math.round(viewport.zoom * 100)}%
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[#141416]/80 backdrop-blur-md border border-white/10 font-mono text-[11px] text-white/70">
              X: {Math.round(viewport.x)} Y: {Math.round(viewport.y)}
            </div>
            <button
              onClick={resetViewport}
              title="Reset View (Center)"
              className="p-1 rounded-lg bg-[#141416]/80 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <div className="px-2.5 py-1 rounded-lg bg-[#141416]/80 backdrop-blur-md border border-white/10 text-[11px] text-white/70">
              {widgets.length} {widgets.length === 1 ? "widget" : "widgets"}
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141416]/80 backdrop-blur-md border border-white/10 text-[11px] text-white/70">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTheme.accentHex }} />
              <span>{activeTheme.name} Theme</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
