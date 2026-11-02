import React, { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi, Activity } from "lucide-react";

export const SystemMonitorWidget: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: 18,
    ram: 42,
    disk: 58,
    netUp: 1.2,
    netDown: 8.4,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics({
        cpu: Math.floor(15 + Math.random() * 12),
        ram: Math.floor(40 + Math.random() * 4),
        disk: 58,
        netUp: parseFloat((0.8 + Math.random() * 1.5).toFixed(1)),
        netDown: parseFloat((6.0 + Math.random() * 5.0).toFixed(1)),
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full p-4 select-none text-white/90">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <Activity className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">System Monitor</span>
        </div>
        <span className="text-[10px] text-white/40 font-mono">Real-time</span>
      </div>

      <div className="space-y-2.5 my-auto py-1">
        {/* CPU */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-white/60">
              <Cpu className="w-3 h-3 text-indigo-400" /> CPU Load
            </span>
            <span className="font-mono text-white/80">{metrics.cpu}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpu}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-white/60">
              <Activity className="w-3 h-3 text-emerald-400" /> Memory
            </span>
            <span className="font-mono text-white/80">{metrics.ram}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.ram}%` }}
            />
          </div>
        </div>

        {/* Disk */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-white/60">
              <HardDrive className="w-3 h-3 text-amber-400" /> SSD Storage
            </span>
            <span className="font-mono text-white/80">{metrics.disk}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.disk}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-white/50">
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-sky-400" /> ↓ {metrics.netDown} MB/s
        </span>
        <span>↑ {metrics.netUp} MB/s</span>
      </div>
    </div>
  );
};

