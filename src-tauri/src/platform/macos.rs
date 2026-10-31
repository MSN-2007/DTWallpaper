//! macOS-specific platform code (stub for future release)

use super::{DesktopIcon, PlatformCapabilities, WallpaperInfo};

pub fn detect_capabilities() -> PlatformCapabilities {
    PlatformCapabilities {
        global_shortcuts: true,
        transparency: true,
        system_tray: true,
        display_protocol: "cocoa".to_string(),
        desktop_environment: "macos".to_string(),
    }
}

pub fn get_wallpaper() -> Result<WallpaperInfo, String> {
    Err("Wallpaper detection not implemented on macOS yet".to_string())
}

pub fn get_desktop_icons() -> Result<Vec<DesktopIcon>, String> {
    Ok(Vec::new())
}

pub fn open_item(_path: &str) -> Result<(), String> {
    Ok(())
}
