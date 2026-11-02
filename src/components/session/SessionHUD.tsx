import { useEffect, useState, useRef } from "react";
import { Pin, PinOff, X, Timer } from "lucide-react";

type SessionState =
  | "IDLE"
  | "TRIGGER_DETECTED"
  | "CAPTURE_SESSION"
  | "MINIMISE_WINDOWS"
  | "SHOW_DESKTOP"
  | "SHOW_PLANNER"
  | "PLANNER_ACTIVE"
  | "SAVE_CHANGES"
  | "HIDE_PLANNER"
  | "RESTORE_SESSION";

interface SessionHUDProps {
  onDismiss?: () => void;
}

export function SessionHUD({ onDismiss }: SessionHUDProps) {
  const [sessionState, setSessionState] = useState<SessionState>("IDLE");
  const [pinned, setPinned] = useState(false);
  const [duration, setDuration] = useState(45);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen to backend session state events
  useEffect(() => {
    let unlistenFn: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        const { invoke } = await import("@tauri-apps/api/core");

        if (cancelled) return;

        unlistenFn = await listen<SessionState>("desktop-session-state", (event) => {
          const state = event.payload;
          setSessionState(state);
          if (state === "PLANNER_ACTIVE") {
            startTimeRef.current = Date.now();
            setElapsed(0);
          } else if (state === "IDLE" || state === "RESTORE_SESSION") {
            startTimeRef.current = null;
            setElapsed(0);
          }
        });

        // Sync initial state from backend
        try {
          const initialDuration = await invoke<number>("get_session_duration");
          setDuration(initialDuration);
          const initialPinned = await invoke<boolean>("is_session_pinned");
          setPinned(initialPinned);
          const initialState = await invoke<SessionState>("get_session_state");
          setSessionState(initialState);
          if (initialState === "PLANNER_ACTIVE") {
            startTimeRef.current = Date.now();
          }
        } catch {
          // Ignore – commands not registered yet
        }
      } catch {
        // Browser dev mode – simulate active session
        if (!cancelled) {
          setSessionState("PLANNER_ACTIVE");
          startTimeRef.current = Date.now();
        }
      }
    })();

    return () => {
      cancelled = true;
      if (unlistenFn) unlistenFn();
    };
  }, []);

  // Countdown timer tick
  useEffect(() => {
    if (sessionState !== "PLANNER_ACTIVE" || pinned) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(elapsedSec);
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionState, pinned]);

  const handleDismiss = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("dismiss_planner_session");
    } catch {
      onDismiss?.();
    }
  };

  const handleTogglePin = async () => {
    const newPinned = !pinned;
    setPinned(newPinned);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("set_session_pinned", { pinned: newPinned });
    } catch {
      // Browser fallback – state already updated locally
    }
  };

  const handleSetDuration = async (secs: number) => {
    setDuration(secs);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("set_session_duration", { seconds: secs });
    } catch {
      // Browser fallback
    }
  };

  if (sessionState === "IDLE") return null;

  const remaining = Math.max(0, duration - elapsed);
  const progress = pinned ? 1 : Math.max(0, remaining / duration);
  const isExpiring = !pinned && remaining <= 10 && remaining > 0;
  const circumference = 2 * Math.PI * 14;
  const strokeDash = circumference * progress;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-2xl
        bg-[#141416]/90 backdrop-blur-xl border shadow-xl
        transition-all duration-300 pointer-events-auto
        ${isExpiring
          ? "border-red-500/50 shadow-red-900/30"
          : "border-white/10 shadow-black/40"
        }
      `}
    >
      {/* Session timer circle */}
      {sessionState === "PLANNER_ACTIVE" && (
        <div className="relative flex items-center justify-center w-9 h-9">
          <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="16" cy="16" r="14"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Progress ring */}
            <circle
              cx="16" cy="16" r="14"
              stroke={isExpiring ? "#ef4444" : pinned ? "#818cf8" : "#6366f1"}
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s linear, stroke 0.3s ease" }}
            />
          </svg>
          <div
            className={`text-[10px] font-mono font-bold z-10 ${
              isExpiring ? "text-red-400" : pinned ? "text-indigo-300" : "text-white/80"
            }`}
          >
            {pinned ? (
              <Timer className="w-3 h-3 text-indigo-400" />
            ) : remaining > 0 ? (
              remaining < 60 ? `${remaining}s` : `${Math.ceil(remaining / 60)}m`
            ) : (
              "✓"
            )}
          </div>
        </div>
      )}

      {/* State label */}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-semibold text-white/70 leading-tight">
          {sessionState === "PLANNER_ACTIVE"
            ? pinned
              ? "Planner Pinned"
              : "Planner Active"
            : sessionState.replace(/_/g, " ")}
        </span>
        {sessionState === "PLANNER_ACTIVE" && !pinned && (
          <span
            className={`text-[9px] leading-tight ${
              isExpiring ? "text-red-400" : "text-white/40"
            }`}
          >
            {remaining > 0 ? `Restoring in ${remaining}s` : "Restoring…"}
          </span>
        )}
        {pinned && (
          <span className="text-[9px] text-indigo-400 leading-tight">
            Pinned indefinitely
          </span>
        )}
      </div>

      {/* Duration quick-select (only when active & unpinned) */}
      {sessionState === "PLANNER_ACTIVE" && !pinned && (
        <div className="flex items-center gap-1 ml-1">
          {[30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => handleSetDuration(d)}
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                duration === d
                  ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                  : "bg-white/5 text-white/40 hover:text-white/70 border border-white/10"
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      )}

      {/* Pin / Unpin */}
      {sessionState === "PLANNER_ACTIVE" && (
        <button
          onClick={handleTogglePin}
          title={pinned ? "Unpin – resume countdown" : "Pin – keep planner open"}
          className={`p-1.5 rounded-lg border transition-all ${
            pinned
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30"
              : "bg-white/5 text-white/40 hover:text-white border-white/10"
          }`}
        >
          {pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        title="Dismiss planner & restore desktop (Esc)"
        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
