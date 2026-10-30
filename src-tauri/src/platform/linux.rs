//! Linux-specific platform code.
//!
//! Handles Wayland/X11 detection, compositor identification,
//! and capability reporting for Linux desktop environments.

use super::PlatformCapabilities;

/// Detect the current display protocol.
fn detect_display_protocol() -> String {
    // Check XDG_SESSION_TYPE first (most reliable)
    if let Ok(session_type) = std::env::var("XDG_SESSION_TYPE") {
        return session_type.to_lowercase();
    }

    // Check WAYLAND_DISPLAY
    if std::env::var("WAYLAND_DISPLAY").is_ok() {
        return "wayland".to_string();
    }

    // Check DISPLAY for X11
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
        global_shortcuts: true, // Supported via Tauri plugin
        transparency: true,     // Generally supported
        system_tray: display_protocol != "wayland" || {
            // Some Wayland compositors support tray via StatusNotifierItem
            let de = detect_desktop_environment().to_lowercase();
            de.contains("kde") || de.contains("plasma") || de.contains("hyprland")
        },
        display_protocol,
        desktop_environment: detect_desktop_environment(),
    }
}
