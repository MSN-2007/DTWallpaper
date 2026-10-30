/**
 * Core type definitions for the Desktop Canvas application.
 *
 * These types form the foundational data model used throughout the
 * frontend application. They are designed to be extended as the
 * canvas engine, widget system, and connection engine are built out.
 */

// ─── Canvas Viewport ─────────────────────────────────────────────

/** Represents the current view into the infinite canvas. */
export interface CanvasViewport {
  /** Horizontal offset of the viewport in canvas coordinates. */
  x: number;
  /** Vertical offset of the viewport in canvas coordinates. */
  y: number;
  /** Zoom level: 1.0 = 100%, 0.5 = 50%, 2.0 = 200%. */
  zoom: number;
}

// ─── Widget ──────────────────────────────────────────────────────

/** Represents a single widget placed on the canvas. */
export interface CanvasWidget {
  /** Unique identifier (UUID v4). */
  id: string;
  /** Widget type identifier (e.g., "todo-list", "clock", "cpu-monitor"). */
  type: string;
  /** X position in canvas coordinates. */
  x: number;
  /** Y position in canvas coordinates. */
  y: number;
  /** Width in canvas units (pixels at zoom=1). */
  width: number;
  /** Height in canvas units (pixels at zoom=1). */
  height: number;
  /** Stacking order for overlapping widgets. */
  zIndex: number;
  /** Widget-specific configuration and data. */
  settings: Record<string, unknown>;
}

// ─── Canvas State ────────────────────────────────────────────────

/** The mode the canvas is currently in. */
export type CanvasMode = "view" | "edit";

/** Root state of the canvas application. */
export interface CanvasState {
  /** Current viewport position and zoom. */
  viewport: CanvasViewport;
  /** All widgets on the current workspace. */
  widgets: CanvasWidget[];
  /** Current canvas interaction mode. */
  mode: CanvasMode;
  /** ID of the currently selected widget, if any. */
  selectedWidgetId: string | null;
  /** Whether the canvas overlay is currently visible. */
  isVisible: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────

/** Actions available on the canvas store. */
export interface CanvasActions {
  /** Show the canvas overlay. */
  show: () => void;
  /** Hide the canvas overlay. */
  hide: () => void;
  /** Toggle canvas visibility. */
  toggle: () => void;
  /** Update the viewport (pan, zoom). */
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  /** Switch between view and edit modes. */
  setMode: (mode: CanvasMode) => void;
  /** Select a widget by ID, or null to deselect. */
  selectWidget: (id: string | null) => void;
  /** Add a widget to the canvas. */
  addWidget: (widget: CanvasWidget) => void;
  /** Update an existing widget's properties. */
  updateWidget: (id: string, updates: Partial<CanvasWidget>) => void;
  /** Remove a widget from the canvas. */
  removeWidget: (id: string) => void;
}

