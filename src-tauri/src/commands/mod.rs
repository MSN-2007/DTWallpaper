//! Tauri IPC command handlers.
//!
//! These commands are callable from the frontend via `invoke()`.
//! Each command should be lightweight — heavy computation belongs
//! in the core engine modules, not in command handlers.

use serde::Serialize;

/// Toggle the canvas visibility.
///
/// This command is invoked from the frontend when the user
/// triggers a show/hide action from within the WebView.
/// For global shortcuts, the backend handles toggling directly.
#[tauri::command]
pub fn toggle_canvas(window: tauri::Window) -> Result<String, String> {
    let visible = window
        .is_visible()
        .map_err(|e| format!("Failed to check visibility: {}", e))?;

    if visible {
        window
            .hide()
            .map_err(|e| format!("Failed to hide window: {}", e))?;
        Ok("hidden".to_string())
    } else {
        window
            .show()
            .map_err(|e| format!("Failed to show window: {}", e))?;
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus window: {}", e))?;
        Ok("visible".to_string())
    }
}

/// Application metadata exposed to the frontend.
#[derive(Serialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub platform: String,
    pub arch: String,
}

/// Returns application information for the frontend.
#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Desktop Canvas".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}

