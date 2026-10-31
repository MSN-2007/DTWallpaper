import React from "react";
import { Clock } from "lucide-react";

interface ClockWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateStr = time.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center select-none">
      <div className="flex items-center gap-2 mb-1.5 text-xs font-medium text-indigo-400">
        <Clock className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider text-[10px]">Local Time</span>
      </div>
      <div className="font-mono text-3xl font-semibold tracking-tight text-white/95 tabular-nums">
        {hours}
      </div>
      <div className="mt-1 text-xs text-white/50">{dateStr}</div>
    </div>
  );
};

