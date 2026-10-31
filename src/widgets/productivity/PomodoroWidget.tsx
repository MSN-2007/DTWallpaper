import React, { useState, useEffect } from "react";
import { Flame, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";

interface PomodoroWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

type SessionMode = "work" | "shortBreak" | "longBreak";

const DURATIONS: Record<SessionMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = () => {
  const [mode, setMode] = useState<SessionMode>("work");
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === "work") {
        setCompletedSessions((prev) => prev + 1);
        const nextMode = (completedSessions + 1) % 4 === 0 ? "longBreak" : "shortBreak";
        setMode(nextMode);
        setSecondsLeft(DURATIONS[nextMode]);
      } else {
        setMode("work");
        setSecondsLeft(DURATIONS.work);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode, completedSessions]);

  const switchMode = (newMode: SessionMode) => {
    setIsActive(false);
    setMode(newMode);
    setSecondsLeft(DURATIONS[newMode]);
  };

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    setIsActive(false);
    setSecondsLeft(DURATIONS[mode]);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const currentTotal = DURATIONS[mode];
  const progress = ((currentTotal - secondsLeft) / currentTotal) * 100;

  return (
    <div className="flex flex-col justify-between h-full p-3.5 select-none text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
          <Flame className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Pomodoro</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white/50">
          <CheckCircle2 className="w-3 h-3 text-rose-400" />
          <span>{completedSessions}</span>
        </div>
      </div>

      <div className="flex justify-center gap-1 my-1">
        <button
          onClick={() => switchMode("work")}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            mode === "work"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => switchMode("shortBreak")}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            mode === "shortBreak"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
              : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Short (5m)
        </button>
        <button
          onClick={() => switchMode("longBreak")}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            mode === "longBreak"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-white/5 text-white/50 hover:bg-white/10"
          }`}
        >
          Long (15m)
        </button>
      </div>

      <div className="my-auto text-center">
        <div className="font-mono text-3xl font-semibold tracking-tight text-white tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="w-full h-1 mt-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-all duration-300 ${
              mode === "work" ? "bg-rose-500" : mode === "shortBreak" ? "bg-teal-400" : "bg-blue-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/5">
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isActive
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              : "bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600/40"
          }`}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isActive ? "Pause" : "Focus"}</span>
        </button>
        <button
          onClick={reset}
          title="Reset"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
