import React, { useRef, useState, useCallback } from "react";
import type { CanvasWidget } from "@/types";
import { WIDGET_REGISTRY } from "@/widgets/registry";
import { GripHorizontal, X } from "lucide-react";

interface WidgetContainerProps {
  widget: CanvasWidget;
  isEditMode: boolean;
  isSelected: boolean;
  zoom: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasWidget>) => void;
  onRemove: (id: string) => void;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isEditMode,
  isSelected,
  zoom,
  onSelect,
  onUpdate,
  onRemove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialWidgetPos = useRef({ x: widget.x, y: widget.y });
  const initialWidgetSize = useRef({ width: widget.width, height: widget.height });

  // Handle Dragging
  const handlePointerDownDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isEditMode) return;
      e.stopPropagation();
      onSelect(widget.id);

      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialWidgetPos.current = { x: widget.x, y: widget.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isEditMode, onSelect, widget.id, widget.x, widget.y]
  );

  const handlePointerMoveDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;

      onUpdate(widget.id, {
        x: Math.round(initialWidgetPos.current.x + dx),
        y: Math.round(initialWidgetPos.current.y + dy),
      });
    },
    [isDragging, onUpdate, widget.id, zoom]
  );

  const handlePointerUpDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    },
    [isDragging]
  );

  // Handle Resizing (Bottom-Right Handle)
  const handlePointerDownResize = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialWidgetSize.current = { width: widget.width, height: widget.height };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [widget.height, widget.width]
  );

  const handlePointerMoveResize = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing) return;
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;

      const newWidth = Math.max(180, Math.round(initialWidgetSize.current.width + dx));
      const newHeight = Math.max(100, Math.round(initialWidgetSize.current.height + dy));

      onUpdate(widget.id, {
        width: newWidth,
        height: newHeight,
      });
    },
    [isResizing, onUpdate, widget.id, zoom]
  );

  const handlePointerUpResize = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing) return;
      setIsResizing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    },
    [isResizing]
  );

  const def = WIDGET_REGISTRY[widget.type];
  const Component = def?.component;

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(widget.id);
      }}
      className={`absolute rounded-xl backdrop-blur-xl transition-shadow select-none ${
        isSelected
          ? "ring-1 ring-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-[#121215]/90 border border-indigo-500/30"
          : "bg-[#141416]/80 hover:bg-[#161619]/85 border border-white/10 shadow-lg"
      }`}
      style={{
        transform: `translate3d(${widget.x}px, ${widget.y}px, 0)`,
        width: `${widget.width}px`,
        height: `${widget.height}px`,
        zIndex: widget.zIndex || 10,
      }}
    >
      {/* Edit Mode Controls (Drag bar & Delete) */}
      {isEditMode && (
        <div
          onPointerDown={handlePointerDownDrag}
          onPointerMove={handlePointerMoveDrag}
          onPointerUp={handlePointerUpDrag}
          className="flex items-center justify-between px-2.5 py-1 cursor-grab active:cursor-grabbing border-b border-white/5 bg-white/[0.02] rounded-t-xl"
        >
          <div className="flex items-center gap-1.5 text-white/40 hover:text-white/70">
            <GripHorizontal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">{def?.name || widget.type}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
            title="Remove widget"
            className="p-0.5 rounded hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Widget Body */}
      <div className={`w-full overflow-hidden ${isEditMode ? "h-[calc(100%-25px)]" : "h-full"}`}>
        {Component ? (
          <Component
            settings={widget.settings}
            onUpdateSettings={(newSettings) => onUpdate(widget.id, { settings: newSettings })}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-white/40">
            Unknown widget: {widget.type}
          </div>
        )}
      </div>

      {/* Resize Handle (Bottom-Right) in Edit Mode */}
      {isEditMode && (
        <div
          onPointerDown={handlePointerDownResize}
          onPointerMove={handlePointerMoveResize}
          onPointerUp={handlePointerUpResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-white/30 hover:text-white/80"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 6 6" fill="currentColor">
            <path d="M5 0L6 0L6 6L0 6L0 5L5 5L5 0Z" />
          </svg>
        </div>
      )}
    </div>
  );
};
