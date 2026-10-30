//! macOS-specific platform code (placeholder for future support).

use super::PlatformCapabilities;

/// Detect macOS platform capabilities.
pub fn detect_capabilities() -> PlatformCapabilities {
    PlatformCapabilities {
        global_shortcuts: true,
        transparency: true,
        system_tray: true,
        display_protocol: "cocoa".to_string(),
        desktop_environment: "macos".to_string(),
    }
}
