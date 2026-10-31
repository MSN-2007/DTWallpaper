import { create } from "zustand";
import type {
  CanvasState,
  CanvasActions,
  CanvasViewport,
  CanvasMode,
  CanvasWidget,
  DesktopIconItem,
  WallpaperData,
  NavTabId,
} from "@/types";

const STORAGE_KEY = "dtwallpaper_canvas_state_v1";
const SETTINGS_KEY = "dtwallpaper_settings_v1";

const DEFAULT_WIDGETS: CanvasWidget[] = [
  {
    id: "default-clock",
    type: "clock",
    x: 180,
    y: 80,
    width: 260,
    height: 140,
    zIndex: 1,
    settings: {},
  },
  {
    id: "default-todo",
    type: "todo-list",
    x: 470,
    y: 80,
    width: 320,
    height: 330,
    zIndex: 2,
    settings: {},
  },
  {
    id: "default-pomodoro",
    type: "pomodoro",
    x: 820,
    y: 80,
    width: 300,
    height: 210,
    zIndex: 3,
    settings: {},
  },
  {
    id: "default-timer",
    type: "timer",
    x: 180,
    y: 245,
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

const loadSavedSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return {
    showDesktopIcons: false,
    useLiveWallpaper: false,
    wallpaperOpacity: 0.95,
    activeThemeId: "obsidian",
  };
};

const savedSettings = loadSavedSettings();

const saveWidgets = (widgets: CanvasWidget[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch {
    // Ignore storage errors
  }
};

const saveSettings = (settings: Record<string, unknown>) => {
  try {
    const current = loadSavedSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
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
  mode: "edit" as CanvasMode,
  selectedWidgetId: null,
  isVisible: true,

  // Navigation & Resource Sidebar
  activeNavTab: "templates",
  isSidebarOpen: true,
  activeThemeId: savedSettings.activeThemeId || "obsidian",

  showDesktopIcons: savedSettings.showDesktopIcons ?? false,
  useLiveWallpaper: savedSettings.useLiveWallpaper ?? false,
  wallpaperOpacity: savedSettings.wallpaperOpacity ?? 0.95,
  wallpaperData: null,
  desktopIcons: [],

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

  setWidgets: (widgets: CanvasWidget[]) => {
    saveWidgets(widgets);
    set({ widgets, selectedWidgetId: null });
  },

  setActiveNavTab: (tab: NavTabId | null) =>
    set((state) => {
      if (tab === null) {
        return { activeNavTab: null, isSidebarOpen: false };
      }
      if (state.activeNavTab === tab && state.isSidebarOpen) {
        return { isSidebarOpen: false };
      }
      return { activeNavTab: tab, isSidebarOpen: true };
    }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  setActiveThemeId: (themeId: string) => {
    saveSettings({ activeThemeId: themeId });
    set({ activeThemeId: themeId });
  },

  setShowDesktopIcons: (show: boolean) =>
    set(() => {
      saveSettings({ showDesktopIcons: show });
      return { showDesktopIcons: show };
    }),

  setUseLiveWallpaper: (use: boolean) =>
    set(() => {
      saveSettings({ useLiveWallpaper: use });
      return { useLiveWallpaper: use };
    }),

  setWallpaperOpacity: (opacity: number) =>
    set(() => {
      saveSettings({ wallpaperOpacity: opacity });
      return { wallpaperOpacity: opacity };
    }),

  setWallpaperData: (data: WallpaperData | null) => set({ wallpaperData: data }),

  setDesktopIcons: (icons: DesktopIconItem[]) => set({ desktopIcons: icons }),
}));
