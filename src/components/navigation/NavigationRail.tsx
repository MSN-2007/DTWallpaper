import React from "react";
import { useCanvasStore } from "@/stores";
import type { NavTabId } from "@/types";
import {
  LayoutTemplate,
  Boxes,
  CheckSquare,
  Calendar,
  BarChart3,
  Activity,
  Palette,
  Network,
} from "lucide-react";

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "templates", label: "Templates", icon: LayoutTemplate, tooltip: "Ready-to-use Workspaces" },
  { id: "widgets", label: "Widgets", icon: Boxes, tooltip: "Modular Productivity Blocks" },
  { id: "tasks", label: "Tasks & Projects", icon: CheckSquare, tooltip: "Task Lists & Roadmaps" },
  { id: "schedule", label: "Schedule", icon: Calendar, tooltip: "Timetable & Events" },
  { id: "analytics", label: "Analytics", icon: BarChart3, tooltip: "Charts & Productivity Metrics" },
  { id: "system", label: "System", icon: Activity, tooltip: "Real-time Hardware Monitor" },
  { id: "themes", label: "Themes", icon: Palette, tooltip: "Canvas Aesthetics & Colors" },
  { id: "connections", label: "Connections", icon: Network, tooltip: "Widget Event & Data Wiring" },
];

export const NavigationRail: React.FC = () => {
  const activeNavTab = useCanvasStore((s) => s.activeNavTab);
  const isSidebarOpen = useCanvasStore((s) => s.isSidebarOpen);
  const setActiveNavTab = useCanvasStore((s) => s.setActiveNavTab);

  return (
    <aside className="w-[68px] h-full flex flex-col items-center justify-between py-3.5 bg-[#0e0e11] border-r border-white/[0.08] select-none z-40 flex-shrink-0">
      {/* App Logo / Mark */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-sm tracking-wider">
          DT
        </div>
      </div>

      {/* Main Navigation Stack */}
      <nav className="flex flex-col items-center gap-1.5 w-full px-2 my-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isSidebarOpen && activeNavTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id)}
              title={item.tooltip}
              className={`group relative flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-white/[0.09] text-white shadow-sm font-medium"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
              }`}
            >
              {/* Active Indicator Pill */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-indigo-500" />
              )}
              <Icon className={`w-[19px] h-[19px] mb-1 transition-transform group-hover:scale-105 ${
                isActive ? "text-indigo-400" : ""
              }`} />
              <span className="text-[10px] tracking-tight leading-none text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status / Mode Pin */}
      <div className="text-[9px] font-mono text-white/30 tracking-widest uppercase">
        v0.1.0
      </div>
    </aside>
  );
};

