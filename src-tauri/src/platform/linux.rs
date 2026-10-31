//! Linux-specific platform code.
//!
//! Handles Wayland/X11 detection, compositor identification,
//! and capability reporting for Linux desktop environments.

use super::{DesktopIcon, PlatformCapabilities, WallpaperInfo};

/// Detect the current display protocol.
fn detect_display_protocol() -> String {
    if let Ok(session_type) = std::env::var("XDG_SESSION_TYPE") {
        return session_type.to_lowercase();
    }
    if std::env::var("WAYLAND_DISPLAY").is_ok() {
        return "wayland".to_string();
    }
    if std::env::var("DISPLAY").is_ok() {
        return "x11".to_string();
    }
    "unknown".to_string()
}

/// Detect the current desktop environment.
fn detect_desktop_environment() -> String {
    if let Ok(desktop) = std::env::var("XDG_CURRENT_DESKTOP") {
        return desktop;
    }
    if let Ok(desktop) = std::env::var("DESKTOP_SESSION") {
        return desktop;
    }
    "unknown".to_string()
}

/// Detect Linux platform capabilities.
pub fn detect_capabilities() -> PlatformCapabilities {
    let display_protocol = detect_display_protocol();

    PlatformCapabilities {
        global_shortcuts: true,
        transparency: true,
        system_tray: display_protocol != "wayland" || {
            let de = detect_desktop_environment().to_lowercase();
            de.contains("kde") || de.contains("plasma") || de.contains("hyprland")
        },
        display_protocol,
        desktop_environment: detect_desktop_environment(),
    }
}

pub fn get_wallpaper() -> Result<WallpaperInfo, String> {
    Err("Wallpaper detection on Linux depends on active compositor".to_string())
}

pub fn get_desktop_icons() -> Result<Vec<DesktopIcon>, String> {
    let mut results = Vec::new();
    if let Ok(home) = std::env::var("HOME") {
        let desktop = std::path::PathBuf::from(home).join("Desktop");
        if let Ok(entries) = std::fs::read_dir(desktop) {
            for entry in entries.flatten() {
                let path = entry.path();
                let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("").to_string();
                if name.is_empty() || name.starts_with('.') {
                    continue;
                }
                let is_dir = path.is_dir();
                let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("").to_string();
                results.push(DesktopIcon {
                    name,
                    path: path.to_string_lossy().to_string(),
                    is_dir,
                    extension: ext,
                    icon_base64: None,
                });
            }
        }
    }
    Ok(results)
}

pub fn open_item(path: &str) -> Result<(), String> {
    std::process::Command::new("xdg-open")
        .arg(path)
        .spawn()
        .map_err(|e| format!("Failed to open item: {}", e))?;
    Ok(())
}
