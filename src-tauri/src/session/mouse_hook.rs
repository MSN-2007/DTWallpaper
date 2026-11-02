use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Instant;

#[cfg(windows)]
use windows::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, GetMessageW, SetWindowsHookExW, UnhookWindowsHookEx, HHOOK, MSLLHOOKSTRUCT,
    WH_MOUSE_LL, WM_MOUSEMOVE,
};

static mut HOOK_HANDLE: HHOOK = HHOOK(std::ptr::null_mut());
static mut CONTROLLER_CALLBACK: Option<Box<dyn Fn() + Send + Sync>> = None;

// Mouse shake tracking state
static mut LAST_POS_X: i32 = 0;
static mut LAST_DIRECTION: i32 = 0; // -1 for left, 1 for right, 0 for still
static mut REVERSAL_COUNT: u32 = 0;
static mut LAST_REVERSAL_TIME: Option<Instant> = None;
static mut LAST_TRIGGER_TIME: Option<Instant> = None;

#[cfg(windows)]
unsafe extern "system" fn low_level_mouse_proc(
    n_code: i32,
    w_param: WPARAM,
    l_param: LPARAM,
) -> LRESULT {
    if n_code >= 0 && w_param.0 == WM_MOUSEMOVE as usize {
        let ms = *(l_param.0 as *const MSLLHOOKSTRUCT);
        let current_x = ms.pt.x;
        let now = Instant::now();

        // Cooldown: at least 2.5s between shake trigger activations
        if let Some(last_trig) = LAST_TRIGGER_TIME {
            if now.duration_since(last_trig).as_millis() < 2500 {
                return CallNextHookEx(Some(HOOK_HANDLE), n_code, w_param, l_param);
            }
        }

        let delta_x = current_x - LAST_POS_X;
        LAST_POS_X = current_x;

        // Threshold for rapid horizontal motion
        let threshold = 35; // px displacement
        if delta_x.abs() > threshold {
            let current_dir = if delta_x > 0 { 1 } else { -1 };

            if LAST_DIRECTION != 0 && current_dir != LAST_DIRECTION {
                // Direction reversal detected!
                if let Some(last_rev) = LAST_REVERSAL_TIME {
                    if now.duration_since(last_rev).as_millis() < 400 {
                        REVERSAL_COUNT += 1;
                    } else {
                        REVERSAL_COUNT = 1;
                    }
                } else {
                    REVERSAL_COUNT = 1;
                }
                LAST_REVERSAL_TIME = Some(now);

                // If user reversed mouse shake 4 times within quick window, fire trigger!
                if REVERSAL_COUNT >= 4 {
                    REVERSAL_COUNT = 0;
                    LAST_TRIGGER_TIME = Some(now);
                    log::info!("Mouse shake gesture detected!");
                    if let Some(ref cb) = CONTROLLER_CALLBACK {
                        cb();
                    }
                }
            }
            LAST_DIRECTION = current_dir;
        }
    }

    CallNextHookEx(Some(HOOK_HANDLE), n_code, w_param, l_param)
}

pub struct MouseShakeDetector {
    running: Arc<AtomicBool>,
}

impl MouseShakeDetector {
    pub fn new() -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn start<F>(&mut self, on_shake: F)
    where
        F: Fn() + Send + Sync + 'static,
    {
        if self.running.load(Ordering::SeqCst) {
            return;
        }

        self.running.store(true, Ordering::SeqCst);
        let running_clone = self.running.clone();

        #[cfg(windows)]
        {
            unsafe {
                CONTROLLER_CALLBACK = Some(Box::new(on_shake));
            }

            thread::spawn(move || unsafe {
                let hook = SetWindowsHookExW(
                    WH_MOUSE_LL,
                    Some(low_level_mouse_proc),
                    None,
                    0,
                );

                match hook {
                    Ok(h) => {
                        HOOK_HANDLE = h;
                        log::info!("Low-level mouse shake hook successfully installed");

                        let mut msg = windows::Win32::UI::WindowsAndMessaging::MSG::default();
                        while running_clone.load(Ordering::SeqCst)
                            && GetMessageW(&mut msg, None, 0, 0).as_bool()
                        {
                            let _ = windows::Win32::UI::WindowsAndMessaging::TranslateMessage(&msg);
                            windows::Win32::UI::WindowsAndMessaging::DispatchMessageW(&msg);
                        }

                        let _ = UnhookWindowsHookEx(HOOK_HANDLE);
                        HOOK_HANDLE = HHOOK(std::ptr::null_mut());
                        log::info!("Low-level mouse shake hook uninstalled");
                    }
                    Err(e) => {
                        log::error!("Failed to install mouse shake hook: {:?}", e);
                    }
                }
            });
        }

        #[cfg(not(windows))]
        {
            log::info!("Mouse shake detection is currently supported on Windows");
        }
    }

    pub fn stop(&mut self) {
        self.running.store(false, Ordering::SeqCst);
    }
}
