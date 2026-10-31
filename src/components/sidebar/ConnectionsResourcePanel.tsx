import React from "react";
import { useCanvasStore } from "@/stores";
import { ArrowRight, Zap } from "lucide-react";

export const ConnectionsResourcePanel: React.FC = () => {
  const widgets = useCanvasStore((s) => s.widgets);

  return (
    <div className="flex flex-col h-full select-none text-white/90 space-y-4">
      <div>
        <p className="text-xs text-white/50 leading-relaxed">
          Connect your widgets together so data flows automatically across your productivity canvas.
        </p>
      </div>

      {/* Active Pipeline Preview */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Active Data Pipeline
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Live
          </span>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="flex items-center justify-between gap-1 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]">
          <div className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-medium">
            Projects
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-white/30" />
          <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-medium">
            Tasks
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-white/30" />
          <div className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-medium">
            Analytics
          </div>
        </div>

        <p className="text-[11px] text-white/50 leading-relaxed">
          When you check off a task on any connected list, the Productivity Analytics widget recalculates your daily velocity in real-time.
        </p>
      </div>

      {/* Canvas Elements Summary */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
          Active Canvas Nodes ({widgets.length})
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {widgets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium text-white/80 capitalize">{w.type.replace("-", " ")}</span>
              </div>
              <span className="text-[10px] font-mono text-white/30">Node #{w.id.slice(-4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
