use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

#[cfg(windows)]
use windows::Win32::Foundation::HWND;
#[cfg(windows)]
use windows::Win32::UI::Input::KeyboardAndMouse::{
    keybd_event, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, VK_D, VK_LWIN,
};
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, SetForegroundWindow,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SessionState {
    Idle,
    TriggerDetected,
    CaptureSession,
    MinimiseWindows,
    ShowDesktop,
    ShowPlanner,
    PlannerActive,
    SaveChanges,
    HidePlanner,
    RestoreSession,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSnapshot {
    pub previous_window_handle: usize,
    pub activated_at: u64,
}

pub struct DesktopSessionController {
    state: Arc<Mutex<SessionState>>,
    saved_foreground_hwnd: Arc<Mutex<Option<usize>>>,
    session_pinned: Arc<AtomicBool>,
    session_duration_secs: Arc<Mutex<u64>>,
    session_generation: Arc<Mutex<u64>>,
}

impl DesktopSessionController {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(SessionState::Idle)),
            saved_foreground_hwnd: Arc::new(Mutex::new(None)),
            session_pinned: Arc::new(AtomicBool::new(false)),
            session_duration_secs: Arc::new(Mutex::new(45)),
            session_generation: Arc::new(Mutex::new(0)),
        }
    }

    pub fn get_state(&self) -> SessionState {
        *self.state.lock().unwrap()
    }

    pub fn set_pinned(&self, pinned: bool) {
        self.session_pinned.store(pinned, Ordering::SeqCst);
    }

    pub fn is_pinned(&self) -> bool {
        self.session_pinned.load(Ordering::SeqCst)
    }

    pub fn set_duration(&self, secs: u64) {
        let mut d = self.session_duration_secs.lock().unwrap();
        *d = secs;
    }

    pub fn get_duration(&self) -> u64 {
        *self.session_duration_secs.lock().unwrap()
    }

    fn emit_state(app: &AppHandle, state: SessionState) {
        let _ = app.emit("desktop-session-state", state);
    }

    /// Trigger activation: Transitions IDLE -> PLANNER_ACTIVE through all stages
    pub fn activate_session(self_arc: Arc<Self>, app: AppHandle) {
        let mut state_guard = self_arc.state.lock().unwrap();
        if *state_guard != SessionState::Idle {
            log::info!("Session activation ignored; currently in state: {:?}", *state_guard);
            return;
        }

        log::info!("=== STARTING TEMPORARY DESKTOP PLANNER SESSION ===");
        *state_guard = SessionState::TriggerDetected;
        Self::emit_state(&app, SessionState::TriggerDetected);

        // 1. CAPTURE SESSION
        *state_guard = SessionState::CaptureSession;
        Self::emit_state(&app, SessionState::CaptureSession);

        #[cfg(windows)]
        unsafe {
            let fg = GetForegroundWindow();
            let mut saved = self_arc.saved_foreground_hwnd.lock().unwrap();
            *saved = Some(fg.0 as usize);
            log::info!("Captured previous foreground window handle: 0x{:x}", fg.0 as usize);
        }

        // 2. MINIMISE WINDOWS & SHOW REAL DESKTOP
        *state_guard = SessionState::MinimiseWindows;
        Self::emit_state(&app, SessionState::MinimiseWindows);

        #[cfg(windows)]
        unsafe {
            // Trigger native Windows "Show Desktop" (Win + D)
            // This cleanly minimizes all active user windows to reveal the actual OS wallpaper and desktop icons
            // without closing any apps, losing unsaved editor work, or killing browser tabs.
            keybd_event(VK_LWIN.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
            keybd_event(VK_D.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
            keybd_event(VK_D.0 as u8, 0, KEYEVENTF_KEYUP, 0);
            keybd_event(VK_LWIN.0 as u8, 0, KEYEVENTF_KEYUP, 0);
            log::info!("Invoked native Windows Show Desktop toggle");
        }

        // 3. SHOW PLANNER
        *state_guard = SessionState::ShowPlanner;
        Self::emit_state(&app, SessionState::ShowPlanner);

        let app_clone = app.clone();
        std::thread::sleep(Duration::from_millis(150)); // Allow shell animation to settle

        if let Some(window) = app_clone.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }

        // 4. PLANNER ACTIVE
        *state_guard = SessionState::PlannerActive;
        Self::emit_state(&app, SessionState::PlannerActive);
        drop(state_guard);

        // Increment generation to cancel any prior pending timers
        let current_gen = {
            let mut gen_guard = self_arc.session_generation.lock().unwrap();
            *gen_guard += 1;
            *gen_guard
        };

        // Spawn timer thread for automatic expiration
        let controller_clone = self_arc.clone();
        let app_timer = app.clone();
        let duration = self_arc.get_duration();

        std::thread::spawn(move || {
            let start = std::time::Instant::now();
            let total_duration = Duration::from_secs(duration);

            loop {
                std::thread::sleep(Duration::from_millis(500));

                // If generation changed or dismissed manually, terminate thread
                {
                    let gen_guard = controller_clone.session_generation.lock().unwrap();
                    if *gen_guard != current_gen {
                        return;
                    }
                }

                if controller_clone.get_state() != SessionState::PlannerActive {
                    return;
                }

                if controller_clone.is_pinned() {
                    continue; // Skip countdown while pinned
                }

                if start.elapsed() >= total_duration {
                    log::info!("Session timer expired ({}s). Dismissing planner...", duration);
                    Self::dismiss_session(controller_clone, app_timer);
                    break;
                }
            }
        });
    }

    /// Dismissal: PLANNER_ACTIVE -> RESTORE_SESSION -> IDLE
    pub fn dismiss_session(self_arc: Arc<Self>, app: AppHandle) {
        let mut state_guard = self_arc.state.lock().unwrap();
        if *state_guard != SessionState::PlannerActive {
            return;
        }

        log::info!("=== DISMISSING DESKTOP PLANNER SESSION & RESTORING WINDOWS ===");

        // Invalidate current timer generation
        {
            let mut gen_guard = self_arc.session_generation.lock().unwrap();
            *gen_guard += 1;
        }

        // 1. SAVE CHANGES
        *state_guard = SessionState::SaveChanges;
        Self::emit_state(&app, SessionState::SaveChanges);
        let _ = app.emit("desktop-session-save", ());

        std::thread::sleep(Duration::from_millis(50));

        // 2. HIDE PLANNER
        *state_guard = SessionState::HidePlanner;
        Self::emit_state(&app, SessionState::HidePlanner);

        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }

        // 3. RESTORE SESSION
        *state_guard = SessionState::RestoreSession;
        Self::emit_state(&app, SessionState::RestoreSession);

        #[cfg(windows)]
        unsafe {
            // Restore Windows desktop layout (second Win+D restores the previous layout cleanly)
            keybd_event(VK_LWIN.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
            keybd_event(VK_D.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
            keybd_event(VK_D.0 as u8, 0, KEYEVENTF_KEYUP, 0);
            keybd_event(VK_LWIN.0 as u8, 0, KEYEVENTF_KEYUP, 0);

            // Restore previous foreground window
            let mut saved = self_arc.saved_foreground_hwnd.lock().unwrap();
            if let Some(prev_raw) = *saved {
                let prev_hwnd = HWND(prev_raw as *mut _);
                if !prev_hwnd.0.is_null() {
                    let _ = SetForegroundWindow(prev_hwnd);
                }
            }
            *saved = None;
            log::info!("Restored previous desktop window session and focus");
        }

        // 4. RETURN TO IDLE
        *state_guard = SessionState::Idle;
        Self::emit_state(&app, SessionState::Idle);
    }

    /// Toggle session between Active and Idle
    pub fn toggle_session(self_arc: Arc<Self>, app: AppHandle) {
        let current = self_arc.get_state();
        if current == SessionState::PlannerActive {
            Self::dismiss_session(self_arc, app);
        } else if current == SessionState::Idle {
            Self::activate_session(self_arc, app);
        }
    }
}
