/**
 * Core type definitions for the Desktop Canvas application.
 */

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasWidget {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  settings: Record<string, unknown>;
}

export interface DesktopIconItem {
  name: string;
  path: string;
  is_dir: boolean;
  extension: string;
  icon_base64?: string;
}

export interface WallpaperData {
  mime_type: string;
  data_base64: string;
  file_path?: string;
}

export type CanvasMode = "view" | "edit";

export type NavTabId =
  | "templates"
  | "widgets"
  | "tasks"
  | "schedule"
  | "analytics"
  | "system"
  | "themes"
  | "connections";

export interface CanvasState {
  viewport: CanvasViewport;
  widgets: CanvasWidget[];
  mode: CanvasMode;
  selectedWidgetId: string | null;
  isVisible: boolean;
  // Navigation & Resource Sidebar
  activeNavTab: NavTabId | null;
  isSidebarOpen: boolean;
  activeThemeId: string;
  // Wallpaper & Icon options
  showDesktopIcons: boolean;
  useLiveWallpaper: boolean;
  wallpaperOpacity: number;
  wallpaperData: WallpaperData | null;
  desktopIcons: DesktopIconItem[];
}

export interface CanvasActions {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  setMode: (mode: CanvasMode) => void;
  selectWidget: (id: string | null) => void;
  addWidget: (widget: CanvasWidget) => void;
  updateWidget: (id: string, updates: Partial<CanvasWidget>) => void;
  removeWidget: (id: string) => void;
  setWidgets: (widgets: CanvasWidget[]) => void;
  // Navigation & Sidebar
  setActiveNavTab: (tab: NavTabId | null) => void;
  toggleSidebar: () => void;
  setIsSidebarOpen: (open: boolean) => void;
  setActiveThemeId: (themeId: string) => void;
  // Options
  setShowDesktopIcons: (show: boolean) => void;
  setUseLiveWallpaper: (use: boolean) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setWallpaperData: (data: WallpaperData | null) => void;
  setDesktopIcons: (icons: DesktopIconItem[]) => void;
}
