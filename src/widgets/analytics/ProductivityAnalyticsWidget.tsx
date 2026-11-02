import React from "react";
import { BarChart3, TrendingUp, Award, CheckCircle } from "lucide-react";

export const ProductivityAnalyticsWidget: React.FC = () => {
  const days = [
    { day: "Mon", score: 85 },
    { day: "Tue", score: 92 },
    { day: "Wed", score: 78 },
    { day: "Thu", score: 95 },
    { day: "Fri", score: 88 },
    { day: "Sat", score: 60 },
    { day: "Sun", score: 70 },
  ];

  return (
    <div className="flex flex-col justify-between h-full p-4 select-none text-white/90">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Productivity</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
          <TrendingUp className="w-3 h-3" />
          <span>+14% this week</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="my-auto py-2">
        <div className="flex items-end justify-between h-20 gap-1.5 px-2">
          {days.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  i === 3 ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "bg-white/20 hover:bg-white/30"
                }`}
                style={{ height: `${d.score}%` }}
                title={`${d.day}: ${d.score}%`}
              />
              <span className="text-[9px] font-mono text-white/40">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px]">
        <div className="flex items-center gap-1.5 text-white/60">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>28 tasks completed</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60">
          <Award className="w-3 h-3 text-amber-400" />
          <span>6.2 hrs deep work</span>
        </div>
      </div>
    </div>
  );
};

