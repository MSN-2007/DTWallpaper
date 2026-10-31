import { create } from "zustand";
import type { CanvasState, CanvasActions, CanvasViewport, CanvasMode, CanvasWidget } from "@/types";

const STORAGE_KEY = "dtwallpaper_canvas_state_v1";

const DEFAULT_WIDGETS: CanvasWidget[] = [
  {
    id: "default-clock",
    type: "clock",
    x: 80,
    y: 100,
    width: 260,
    height: 140,
    zIndex: 1,
    settings: {},
  },
  {
    id: "default-todo",
    type: "todo-list",
    x: 370,
    y: 100,
    width: 320,
    height: 330,
    zIndex: 2,
    settings: {},
  },
  {
    id: "default-pomodoro",
    type: "pomodoro",
    x: 720,
    y: 100,
    width: 300,
    height: 210,
    zIndex: 3,
    settings: {},
  },
  {
    id: "default-timer",
    type: "timer",
    x: 80,
    y: 265,
    width: 260,
    height: 165,
    zIndex: 4,
    settings: {},
  },
];

const loadSavedWidgets = (): CanvasWidget[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_WIDGETS;
};

const saveWidgets = (widgets: CanvasWidget[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch {
    // Ignore storage errors
  }
};

export const useCanvasStore = create<CanvasState & CanvasActions>()((set) => ({
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  widgets: loadSavedWidgets(),
  mode: "view" as CanvasMode,
  selectedWidgetId: null,
  isVisible: true,

  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
  toggle: () => set((state) => ({ isVisible: !state.isVisible })),

  setViewport: (partial: Partial<CanvasViewport>) =>
    set((state) => ({
      viewport: { ...state.viewport, ...partial },
    })),

  setMode: (mode: CanvasMode) => set({ mode }),

  selectWidget: (id: string | null) => set({ selectedWidgetId: id }),

  addWidget: (widget: CanvasWidget) =>
    set((state) => {
      const updated = [...state.widgets, widget];
      saveWidgets(updated);
      return { widgets: updated, selectedWidgetId: widget.id };
    }),

  updateWidget: (id: string, updates: Partial<CanvasWidget>) =>
    set((state) => {
      const updated = state.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      );
      saveWidgets(updated);
      return { widgets: updated };
    }),

  removeWidget: (id: string) =>
    set((state) => {
      const updated = state.widgets.filter((w) => w.id !== id);
      saveWidgets(updated);
      return {
        widgets: updated,
        selectedWidgetId:
          state.selectedWidgetId === id ? null : state.selectedWidgetId,
      };
    }),
}));
