use std::sync::Arc;
use tauri::{Manager, State};

mod platform;
mod session;

use session::mouse_hook::MouseShakeDetector;
use session::{DesktopSessionController, controller::SessionState};

#[derive(Clone)]
pub struct AppSessionState {
    pub controller: Arc<DesktopSessionController>,
}

/// Tauri command: get current session state
#[tauri::command]
fn get_session_state(state: State<'_, AppSessionState>) -> SessionState {
    state.controller.get_state()
}

/// Tauri command: start/activate temporary desktop planner session
#[tauri::command]
fn start_planner_session(app: tauri::AppHandle, state: State<'_, AppSessionState>) {
    DesktopSessionController::activate_session(state.controller.clone(), app);
}

/// Tauri command: end/dismiss desktop planner session & restore windows
#[tauri::command]
fn dismiss_planner_session(app: tauri::AppHandle, state: State<'_, AppSessionState>) {
    DesktopSessionController::dismiss_session(state.controller.clone(), app);
}

/// Tauri command: toggle session
#[tauri::command]
fn toggle_planner_session(app: tauri::AppHandle, state: State<'_, AppSessionState>) {
    DesktopSessionController::toggle_session(state.controller.clone(), app);
}

/// Tauri command: set session pin status
#[tauri::command]
fn set_session_pinned(pinned: bool, state: State<'_, AppSessionState>) {
    state.controller.set_pinned(pinned);
}

/// Tauri command: get session pin status
#[tauri::command]
fn is_session_pinned(state: State<'_, AppSessionState>) -> bool {
    state.controller.is_pinned()
}

/// Tauri command: set session duration
#[tauri::command]
fn set_session_duration(seconds: u64, state: State<'_, AppSessionState>) {
    state.controller.set_duration(seconds);
}

/// Tauri command: get session duration
#[tauri::command]
fn get_session_duration(state: State<'_, AppSessionState>) -> u64 {
    state.controller.get_duration()
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

/// Legacy command alias for backward compatibility
#[tauri::command]
fn toggle_canvas(app: tauri::AppHandle, state: State<'_, AppSessionState>) {
    DesktopSessionController::toggle_session(state.controller.clone(), app);
}

/// Legacy command alias for backward compatibility
#[tauri::command]
fn hide_canvas(app: tauri::AppHandle, state: State<'_, AppSessionState>) {
    DesktopSessionController::dismiss_session(state.controller.clone(), app);
}

/// Legacy command alias for backward compatibility
#[tauri::command]
fn show_canvas(app: tauri::AppHandle, state: State<'_, AppSessionState>) {
    DesktopSessionController::activate_session(state.controller.clone(), app);
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

    let session_controller = Arc::new(DesktopSessionController::new());
    let session_controller_for_shortcut = session_controller.clone();
    let session_controller_for_shake = session_controller.clone();

    tauri::Builder::default()
        .manage(AppSessionState {
            controller: session_controller,
        })
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let ctrl_space = "ctrl+space".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();
                        let alt_space = "alt+space".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();
                        let f8 = "f8".parse::<tauri_plugin_global_shortcut::Shortcut>().unwrap();

                        if shortcut == &ctrl_space || shortcut == &alt_space || shortcut == &f8 {
                            log::info!("Global shortcut triggered session toggle");
                            DesktopSessionController::toggle_session(
                                session_controller_for_shortcut.clone(),
                                app.clone(),
                            );
                        }
                    }
                })
                .build(),
        )
        .setup(move |app| {
            use tauri_plugin_global_shortcut::GlobalShortcutExt;

            // Register primary trigger Ctrl+Space
            if let Ok(shortcut) = "ctrl+space".parse::<tauri_plugin_global_shortcut::Shortcut>() {
                if let Err(e) = app.global_shortcut().register(shortcut) {
                    log::warn!("Failed to register Ctrl+Space: {}", e);
                } else {
                    log::info!("Global shortcut Ctrl+Space registered");
                }
            }

            // Register fallback triggers (Alt+Space and F8) in case Ctrl+Space is consumed
            if let Ok(shortcut) = "alt+space".parse::<tauri_plugin_global_shortcut::Shortcut>() {
                let _ = app.global_shortcut().register(shortcut);
            }
            if let Ok(shortcut) = "f8".parse::<tauri_plugin_global_shortcut::Shortcut>() {
                let _ = app.global_shortcut().register(shortcut);
            }

            // Auto-maximize window for full desktop coverage
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.maximize();
            }

            // Start low-level mouse shake detector
            let app_handle_for_shake = app.handle().clone();
            let mut shake_detector = MouseShakeDetector::new();
            shake_detector.start(move || {
                DesktopSessionController::activate_session(
                    session_controller_for_shake.clone(),
                    app_handle_for_shake.clone(),
                );
            });

            log::info!("Desktop Canvas v0.1.0 with Desktop Session Controller active");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_session_state,
            start_planner_session,
            dismiss_planner_session,
            toggle_planner_session,
            set_session_pinned,
            is_session_pinned,
            set_session_duration,
            get_session_duration,
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
