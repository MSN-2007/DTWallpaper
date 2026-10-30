import { useEffect } from "react";
import { Canvas } from "@/canvas";
import { useCanvasStore } from "@/stores";
import "./styles/globals.css";

/**
 * Root application component.
 *
 * Responsibilities:
 * - Renders the canvas when visible
 * - Coordinates with Tauri backend for window show/hide
 * - Handles Escape key to dismiss the overlay
 *
 * The app stays mounted in memory for instant warm activation (< 150ms).
 */
export default function App() {
  const isVisible = useCanvasStore((s) => s.isVisible);
  const show = useCanvasStore((s) => s.show);
  const hide = useCanvasStore((s) => s.hide);

  // Synchronize visibility events from the Tauri backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupListener() {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        const unlistenFn = await listen<boolean>("canvas-visibility", (event) => {
          if (event.payload) {
            show();
          } else {
            hide();
          }
        });
        unlisten = unlistenFn;
      } catch {
        // Not running in Tauri (e.g. dev browser)
        console.info("Tauri event listener not available (running in browser)");
      }
    }

    setupListener();
    return () => unlisten?.();
  }, [show, hide]);

  // Global frontend shortcuts: Escape to hide overlay, Ctrl+Space fallback
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("hide_canvas");
        } catch {
          hide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hide]);

  return (
    <div className="w-full h-full select-none">
      {isVisible ? (
        <Canvas />
      ) : (
        // When hidden, maintain a minimal black backdrop ready for instant re-show
        <div className="w-full h-full bg-canvas-bg" />
      )}
    </div>
  );
}

