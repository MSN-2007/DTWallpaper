import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "@/stores";
import { WidgetContainer } from "./WidgetContainer";
import { AddWidgetModal } from "./AddWidgetModal";
import { WIDGET_REGISTRY } from "@/widgets/registry";
import type { CanvasWidget } from "@/types";
import {
  Edit3,
  Eye,
  Minimize2,
  Command,
  Plus,
  RotateCcw,
} from "lucide-react";

export function Canvas() {
  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const widgets = useCanvasStore((s) => s.widgets);
  const addWidget = useCanvasStore((s) => s.addWidget);
  const updateWidget = useCanvasStore((s) => s.updateWidget);
  const removeWidget = useCanvasStore((s) => s.removeWidget);
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const selectedWidgetId = useCanvasStore((s) => s.selectedWidgetId);
  const selectWidget = useCanvasStore((s) => s.selectWidget);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Canvas Pan State
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const viewportStart = useRef({ x: viewport.x, y: viewport.y });

  // Handle Canvas Background Panning (Middle Click or pointer on canvas background)
  const handlePointerDownBackground = (e: React.PointerEvent) => {
    // Only pan if clicking canvas background directly or middle button
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

    // Zoom towards pointer
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

  const handleAddWidget = (type: string) => {
    const def = WIDGET_REGISTRY[type];
    if (!def) return;

    // Place near center of viewport
    const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom) - def.defaultWidth / 2;
    const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom) - def.defaultHeight / 2;

    const newWidget: CanvasWidget = {
      id: `widget-${Date.now()}`,
      type,
      x: Math.round(centerX + (Math.random() * 40 - 20)),
      y: Math.round(centerY + (Math.random() * 40 - 20)),
      width: def.defaultWidth,
      height: def.defaultHeight,
      zIndex: widgets.length + 1,
      settings: {},
    };

    addWidget(newWidget);
  };

  const resetViewport = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  return (
    <div
      ref={canvasRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDownBackground}
      onPointerMove={handlePointerMoveBackground}
      onPointerUp={handlePointerUpBackground}
      className={`relative w-full h-full overflow-hidden select-none ${
        isPanning ? "cursor-grabbing" : ""
      }`}
      style={{
        backgroundColor: "#0a0a0c",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      {/* Canvas Viewport Transform Layer */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
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

      {/* Top Header Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left: App Title and Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141416]/80 backdrop-blur-md border border-white/10 text-xs pointer-events-auto shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white/90">Desktop Canvas</span>
          <span className="text-white/40 font-mono text-[10px]">v0.1.0</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {mode === "edit" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/40 transition-all shadow-lg backdrop-blur-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Widget</span>
            </button>
          )}

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
                <span>Editing Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-white/50" />
                <span>Viewing Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleHideWindow}
            title="Minimize Canvas (Ctrl+Space)"
            className="p-2 rounded-xl bg-[#141416]/80 hover:bg-[#202025]/90 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-all shadow-lg"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Status, Zoom, Coordinates */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/40 pointer-events-none select-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-lg bg-[#141416]/80 backdrop-blur-md border border-white/10 font-mono text-[11px] text-white/70">
            Zoom: {Math.round(viewport.zoom * 100)}%
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#141416]/80 backdrop-blur-md border border-white/10 font-mono text-[11px] text-white/70">
            X: {Math.round(viewport.x)} Y: {Math.round(viewport.y)}
          </div>
          <button
            onClick={resetViewport}
            title="Reset View"
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
            <Command className="w-3 h-3 text-indigo-400" />
            <span>Obsidian Theme</span>
          </div>
        </div>
      </div>

      {/* Modal to add widgets */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWidget}
      />

      {/* Mode toast hint */}
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
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, [mode]);

  if (!visible) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none select-none transition-all duration-200">
      <div className="px-3.5 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-medium shadow-xl backdrop-blur-sm border border-indigo-400/30 flex items-center gap-1.5">
        {mode === "edit" ? "✏️ Switched to Edit Mode (Drag & Resize enabled)" : "👁️ Switched to View Mode"}
      </div>
    </div>
  );
}
