use tauri::{Emitter, Manager};

mod platform;

/// Toggle the main window visibility.
/// Shows the window if hidden, hides if visible.
fn toggle_window_visibility(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
            let _ = app.emit("canvas-visibility", false);
            log::info!("Canvas hidden");
        } else {
            let _ = window.show();
            let _ = window.set_focus();
            let _ = app.emit("canvas-visibility", true);
            log::info!("Canvas shown");
        }
    }
}

/// Tauri command: get basic application info
#[tauri::command]
fn get_app_info() -> serde_json::Value {
    serde_json::json!({
        "name": "Desktop Canvas",
        "version": "0.1.0",
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
    })
}

/// Tauri command: toggle the canvas window
#[tauri::command]
fn toggle_canvas(app: tauri::AppHandle) {
    toggle_window_visibility(&app);
}

/// Tauri command: hide the canvas window
#[tauri::command]
fn hide_canvas(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
        let _ = app.emit("canvas-visibility", false);
        log::info!("Canvas hidden via command");
    }
}

/// Tauri command: show the canvas window
#[tauri::command]
fn show_canvas(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = app.emit("canvas-visibility", true);
        log::info!("Canvas shown via command");
    }
}

/// Tauri command: get platform capabilities
#[tauri::command]
fn get_platform_capabilities() -> platform::PlatformCapabilities {
    platform::detect_capabilities()
}

/// Tauri command: retrieve current desktop wallpaper
#[tauri::command]
fn get_desktop_wallpaper() -> Result<platform::WallpaperInfo, String> {
    platform::get_desktop_wallpaper()
}

/// Tauri command: retrieve user desktop icons and shortcuts
#[tauri::command]
fn get_desktop_icons() -> Result<Vec<platform::DesktopIcon>, String> {
    platform::get_desktop_icons()
}

/// Tauri command: open a desktop icon or shortcut
#[tauri::command]
fn open_desktop_item(path: String) -> Result<(), String> {
    platform::open_desktop_item(&path)
}

pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let ctrl_space = "ctrl+space".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();
                        let alt_space = "alt+space".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();
                        let f8 = "f8".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();

                        if shortcut == &ctrl_space || shortcut == &alt_space || shortcut == &f8 {
                            toggle_window_visibility(app);
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            use tauri_plugin_global_shortcut::GlobalShortcutExt;

            // Register primary trigger Ctrl+Space
            if let Ok(shortcut) = "ctrl+space".parse::<tauri_plugin_global_shortcut::Shortcut>() {
                if let Err(e) = app.global_shortcut().register(shortcut) {
                    log::warn!("Failed to register Ctrl+Space: {}", e);
                } else {
                    log::info!("Global shortcut Ctrl+Space registered");
                }
            }

            // Register fallback triggers (Alt+Space and F8) in case Ctrl+Space is consumed by another tool
            if let Ok(shortcut) = "alt+space".parse::<tauri_plugin_global_shortcut::Shortcut>() {
                let _ = app.global_shortcut().register(shortcut);
            }
            if let Ok(shortcut) = "f8".parse::<tauri_plugin_global_shortcut::Shortcut>() {
                let _ = app.global_shortcut().register(shortcut);
            }

            // Auto-maximize window to cover full screen like a native wallpaper layer
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.maximize();
            }

            log::info!("Desktop Canvas v0.1.0 started");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            toggle_canvas,
            hide_canvas,
            show_canvas,
            get_platform_capabilities,
            get_desktop_wallpaper,
            get_desktop_icons,
            open_desktop_item,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Desktop Canvas");
}
