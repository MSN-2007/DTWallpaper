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

pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let ctrl_space = "ctrl+space".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();
                        if shortcut == &ctrl_space {
                            toggle_window_visibility(app);
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Register global shortcut on startup
            use tauri_plugin_global_shortcut::GlobalShortcutExt;
            let shortcut = "ctrl+space".parse::<tauri_plugin_global_shortcut::Shortcut>()?;
            app.global_shortcut().register(shortcut)?;
            log::info!("Global shortcut Ctrl+Space registered");
            log::info!("Desktop Canvas v0.1.0 started");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            toggle_canvas,
            hide_canvas,
            show_canvas,
            get_platform_capabilities,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Desktop Canvas");
}
