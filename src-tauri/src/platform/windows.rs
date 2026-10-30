//! Windows-specific platform code.

use super::PlatformCapabilities;

/// Detect Windows platform capabilities.
pub fn detect_capabilities() -> PlatformCapabilities {
    PlatformCapabilities {
        global_shortcuts: true,
        transparency: true,
        system_tray: true,
        display_protocol: "win32".to_string(),
        desktop_environment: "windows".to_string(),
    }
}
