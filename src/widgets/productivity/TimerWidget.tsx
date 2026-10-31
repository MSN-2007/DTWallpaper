import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

interface TimerWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = () => {
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(initialMinutes * 60);
  };

  const setCustomMinutes = (mins: number) => {
    setIsActive(false);
    setInitialMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress =
    initialMinutes * 60 > 0
      ? ((initialMinutes * 60 - secondsLeft) / (initialMinutes * 60)) * 100
      : 0;

  return (
    <div className="flex flex-col justify-between h-full p-3.5 select-none text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <Timer className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Timer</span>
        </div>
        <div className="flex gap-1 text-[10px]">
          {[1, 5, 10, 15].map((m) => (
            <button
              key={m}
              onClick={() => setCustomMinutes(m)}
              className={`px-1.5 py-0.5 rounded ${
                initialMinutes === m && !isActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/5 hover:bg-white/10 text-white/60"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="my-auto text-center">
        <div className="font-mono text-3xl font-semibold tracking-tight text-white tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="w-full h-1 mt-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full transition-all duration-300 bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/5">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isActive
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              : "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40"
          }`}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isActive ? "Pause" : "Start"}</span>
        </button>
        <button
          onClick={resetTimer}
          title="Reset"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

