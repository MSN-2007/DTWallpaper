import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  tag: string;
  color: string;
}

export const DailyScheduleWidget: React.FC = () => {
  const [events] = useState<ScheduleEvent[]>([
    { id: "e1", time: "09:00 AM", title: "Morning Architecture Sync", tag: "Team", color: "border-indigo-500 text-indigo-400" },
    { id: "e2", time: "11:30 AM", title: "Canvas UI/UX Review", tag: "Design", color: "border-teal-500 text-teal-400" },
    { id: "e3", time: "02:00 PM", title: "Deep Work: Tauri 2 Core", tag: "Coding", color: "border-emerald-500 text-emerald-400" },
    { id: "e4", time: "04:30 PM", title: "Sprint Planning & Wrap-up", tag: "Plan", color: "border-amber-500 text-amber-400" },
  ]);

  const today = new Date().toLocaleDateString([], { month: "short", day: "numeric", weekday: "short" });

  return (
    <div className="flex flex-col h-full p-4 select-none text-white/90">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Daily Schedule</span>
        </div>
        <span className="text-[10px] text-white/50 font-medium">{today}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex flex-col items-start min-w-[62px]">
              <span className="text-[10px] font-mono text-white/60">{ev.time.split(" ")[0]}</span>
              <span className="text-[8px] text-white/30 uppercase">{ev.time.split(" ")[1]}</span>
            </div>
            <div className={`flex-1 border-l-2 pl-2 ${ev.color.split(" ")[0]}`}>
              <div className="text-xs font-medium text-white/90 leading-tight">{ev.title}</div>
              <span className="text-[9px] text-white/40">{ev.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
