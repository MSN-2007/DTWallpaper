import { create } from "zustand";
import type { CanvasState, CanvasActions, CanvasViewport, CanvasMode, CanvasWidget } from "@/types";

/**
 * Primary Zustand store for the canvas application.
 *
 * This store manages:
 * - Viewport state (position, zoom)
 * - Widget collection
 * - Canvas mode (view / edit)
 * - Selection state
 * - Visibility (show/hide overlay)
 *
 * Performance notes:
 * - Selectors should be used to avoid unnecessary re-renders.
 * - Widget updates are immutable but targeted (only the changed widget).
 * - Viewport changes use partial updates to minimize object creation.
 */
export const useCanvasStore = create<CanvasState & CanvasActions>()((set) => ({
  // ── Initial State ────────────────────────────────────────────
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  widgets: [],
  mode: "view" as CanvasMode,
  selectedWidgetId: null,
  isVisible: true, // Start visible for Sprint 0 development

  // ── Visibility ───────────────────────────────────────────────
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
  toggle: () => set((state) => ({ isVisible: !state.isVisible })),

  // ── Viewport ─────────────────────────────────────────────────
  setViewport: (partial: Partial<CanvasViewport>) =>
    set((state) => ({
      viewport: { ...state.viewport, ...partial },
    })),

  // ── Mode ─────────────────────────────────────────────────────
  setMode: (mode: CanvasMode) => set({ mode }),

  // ── Selection ────────────────────────────────────────────────
  selectWidget: (id: string | null) => set({ selectedWidgetId: id }),

  // ── Widget CRUD ──────────────────────────────────────────────
  addWidget: (widget: CanvasWidget) =>
    set((state) => ({
      widgets: [...state.widgets, widget],
    })),

  updateWidget: (id: string, updates: Partial<CanvasWidget>) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  removeWidget: (id: string) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
      // Clear selection if the removed widget was selected
      selectedWidgetId:
        state.selectedWidgetId === id ? null : state.selectedWidgetId,
    })),
}));

