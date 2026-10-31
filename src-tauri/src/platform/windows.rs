//! Windows-specific platform code.

use super::{DesktopIcon, PlatformCapabilities, WallpaperInfo};
use base64::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

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

/// Retrieve current Windows wallpaper and encode it for instant frontend render
pub fn get_wallpaper() -> Result<WallpaperInfo, String> {
    // 1. First try reading the TranscodedWallpaper cache in AppData
    if let Ok(appdata) = std::env::var("APPDATA") {
        let transcoded = Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Themes")
            .join("TranscodedWallpaper");

        if transcoded.exists() {
            if let Ok(bytes) = fs::read(&transcoded) {
                if !bytes.is_empty() {
                    // Detect mime by magic bytes
                    let mime = if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
                        "image/jpeg"
                    } else if bytes.starts_with(b"RIFF") && bytes.len() > 12 && &bytes[8..12] == b"WEBP" {
                        "image/webp"
                    } else if bytes.starts_with(&[0x89, 0x50, 0x4E, 0x47]) {
                        "image/png"
                    } else {
                        "image/jpeg"
                    };

                    let encoded = BASE64_STANDARD.encode(&bytes);
                    return Ok(WallpaperInfo {
                        mime_type: mime.to_string(),
                        data_base64: encoded,
                        file_path: Some(transcoded.to_string_lossy().to_string()),
                    });
                }
            }
        }
    }

    // 2. Query registry via powershell if TranscodedWallpaper wasn't accessible
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            "[Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Control Panel\\Desktop').GetValue('Wallpaper')",
        ])
        .output()
        .map_err(|e| format!("Failed to query wallpaper registry: {}", e))?;

    let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if !path_str.is_empty() {
        let path = Path::new(&path_str);
        if path.exists() {
            let bytes = fs::read(path).map_err(|e| format!("Failed to read wallpaper: {}", e))?;
            let ext = path
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_lowercase();
            let mime = match ext.as_str() {
                "png" => "image/png",
                "webp" => "image/webp",
                "bmp" => "image/bmp",
                _ => "image/jpeg",
            };

            let encoded = BASE64_STANDARD.encode(&bytes);
            return Ok(WallpaperInfo {
                mime_type: mime.to_string(),
                data_base64: encoded,
                file_path: Some(path_str),
            });
        }
    }

    Err("Could not locate desktop wallpaper".to_string())
}

/// Retrieve the user's actual desktop icons and shortcuts
pub fn get_desktop_icons() -> Result<Vec<DesktopIcon>, String> {
    let mut desktop_paths = Vec::new();

    // User Desktop (handles OneDrive synced desktop if applicable)
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        let onedrive_desktop = PathBuf::from(&user_profile)
            .join("OneDrive")
            .join("Desktop");
        if onedrive_desktop.exists() {
            desktop_paths.push(onedrive_desktop);
        }

        let normal_desktop = PathBuf::from(&user_profile).join("Desktop");
        if normal_desktop.exists() && !desktop_paths.contains(&normal_desktop) {
            desktop_paths.push(normal_desktop);
        }
    }

    // Public Desktop
    if let Ok(public) = std::env::var("PUBLIC") {
        let public_desktop = PathBuf::from(public).join("Desktop");
        if public_desktop.exists() {
            desktop_paths.push(public_desktop);
        }
    }

    let mut results = Vec::new();
    let mut seen_names = std::collections::HashSet::new();

    for dir in desktop_paths {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = path
                    .file_name()
                    .and_then(|s| s.to_str())
                    .unwrap_or("")
                    .to_string();

                if file_name.is_empty()
                    || file_name.starts_with('.')
                    || file_name.eq_ignore_ascii_case("desktop.ini")
                {
                    continue;
                }

                // Clean display name (strip .lnk extension for desktop shortcuts)
                let is_dir = path.is_dir();
                let is_lnk = file_name.ends_with(".lnk");
                let display_name = if is_lnk {
                    file_name.trim_end_matches(".lnk").to_string()
                } else {
                    file_name.clone()
                };

                if seen_names.contains(&display_name.to_lowercase()) {
                    continue;
                }
                seen_names.insert(display_name.to_lowercase());

                let ext = path
                    .extension()
                    .and_then(|s| s.to_str())
                    .unwrap_or("")
                    .to_lowercase();

                results.push(DesktopIcon {
                    name: display_name,
                    path: path.to_string_lossy().to_string(),
                    is_dir,
                    extension: ext,
                    icon_base64: None,
                });
            }
        }
    }

    // Sort alphabetically: directories first, then files
    results.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(results)
}

/// Open a desktop file or folder using the default OS shell
pub fn open_item(path: &str) -> Result<(), String> {
    Command::new("explorer")
        .arg(path)
        .spawn()
        .map_err(|e| format!("Failed to open item {}: {}", path, e))?;
    Ok(())
}
