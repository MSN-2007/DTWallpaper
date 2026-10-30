//! Platform-specific functionality.
//!
//! This module isolates OS-specific code from the shared application logic.
//! Each platform module provides implementations for capabilities that
//! differ across operating systems.

#[cfg(target_os = "linux")]
pub mod linux;

#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "macos")]
pub mod macos;

/// Platform capability detection.
/// Reports what features the current platform and compositor support.
#[derive(Debug, Clone, serde::Serialize)]
pub struct PlatformCapabilities {
    /// Whether global shortcuts are supported
    pub global_shortcuts: bool,
    /// Whether the window can be made transparent
    pub transparency: bool,
    /// Whether system tray is supported
    pub system_tray: bool,
    /// Current display protocol (x11, wayland, win32, cocoa)
    pub display_protocol: String,
    /// Current desktop environment name
    pub desktop_environment: String,
}

/// Detect capabilities for the current platform.
pub fn detect_capabilities() -> PlatformCapabilities {
    #[cfg(target_os = "linux")]
    return linux::detect_capabilities();

    #[cfg(target_os = "windows")]
    return windows::detect_capabilities();

    #[cfg(target_os = "macos")]
    return macos::detect_capabilities();

    #[cfg(not(any(target_os = "linux", target_os = "windows", target_os = "macos")))]
    return PlatformCapabilities {
        global_shortcuts: false,
        transparency: false,
        system_tray: false,
        display_protocol: "unknown".to_string(),
        desktop_environment: "unknown".to_string(),
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_capabilities_detection() {
        let caps = detect_capabilities();
        assert!(!caps.display_protocol.is_empty(), "display_protocol should not be empty");
        assert!(!caps.desktop_environment.is_empty(), "desktop_environment should not be empty");
    }
}
