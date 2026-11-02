import React from "react";
import { useCanvasStore } from "@/stores";
import type { NavTabId } from "@/types";
import { TemplatesResourcePanel } from "./TemplatesResourcePanel";
import { WidgetsResourcePanel } from "./WidgetsResourcePanel";
import { TasksProjectsResourcePanel } from "./TasksProjectsResourcePanel";
import { ThemesResourcePanel } from "./ThemesResourcePanel";
import { ConnectionsResourcePanel } from "./ConnectionsResourcePanel";
import { DailyScheduleWidget } from "@/widgets/scheduling/DailyScheduleWidget";
import { ProductivityAnalyticsWidget } from "@/widgets/analytics/ProductivityAnalyticsWidget";
import { SystemMonitorWidget } from "@/widgets/system/SystemMonitorWidget";
import { ChevronLeft, Plus, Calendar, BarChart3, Activity } from "lucide-react";
import type { CanvasWidget } from "@/types";

const HEADINGS: Record<NavTabId, { title: string; subtitle: string }> = {
  templates: { title: "Templates", subtitle: "Curated Whiteboard Workspaces" },
  widgets: { title: "Widgets", subtitle: "Modular Productivity Blocks" },
  tasks: { title: "Tasks & Projects", subtitle: "Work Management & Milestones" },
  schedule: { title: "Schedule", subtitle: "Timetable, Calendar & Events" },
  analytics: { title: "Analytics", subtitle: "Productivity Velocity & Charts" },
  system: { title: "System Monitor", subtitle: "Hardware & Resource Utilization" },
  themes: { title: "Themes", subtitle: "Aesthetics, Canvas Grids & Colors" },
  connections: { title: "Connections", subtitle: "Widget Pipeline & Event Wiring" },
};

export const ResourceSidebar: React.FC = () => {
  const activeNavTab = useCanvasStore((s) => s.activeNavTab);
  const isSidebarOpen = useCanvasStore((s) => s.isSidebarOpen);
  const toggleSidebar = useCanvasStore((s) => s.toggleSidebar);
  const addWidget = useCanvasStore((s) => s.addWidget);
  const viewport = useCanvasStore((s) => s.viewport);
  const widgets = useCanvasStore((s) => s.widgets);

  if (!isSidebarOpen || !activeNavTab) {
    return null;
  }

  const { title, subtitle } = HEADINGS[activeNavTab] || { title: "Resources", subtitle: "" };

  const handleAddDirect = (type: string, width: number, height: number) => {
    const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom) - width / 2;
    const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom) - height / 2;

    const newWidget: CanvasWidget = {
      id: `widget-${type}-${Date.now()}`,
      type,
      x: Math.round(centerX),
      y: Math.round(centerY),
      width,
      height,
      zIndex: widgets.length + 1,
      settings: {},
    };
    addWidget(newWidget);
  };

  const renderContent = () => {
    switch (activeNavTab) {
      case "templates":
        return <TemplatesResourcePanel />;
      case "widgets":
        return <WidgetsResourcePanel />;
      case "tasks":
        return <TasksProjectsResourcePanel />;
      case "themes":
        return <ThemesResourcePanel />;
      case "connections":
        return <ConnectionsResourcePanel />;
      case "schedule":
        return (
          <div className="flex flex-col h-full space-y-4">
            <p className="text-xs text-white/50 leading-relaxed">
              Track your day with time-blocked schedules, meetings, and milestone deadlines.
            </p>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  Daily Timetable
                </span>
                <button
                  onClick={() => handleAddDirect("schedule", 300, 240)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Canvas
                </button>
              </div>
              <div className="h-44 rounded-xl overflow-hidden border border-white/5 bg-black/30">
                <DailyScheduleWidget />
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="flex flex-col h-full space-y-4">
            <p className="text-xs text-white/50 leading-relaxed">
              Live visualization of your daily output, focus bursts, and completed tasks.
            </p>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  Velocity Chart
                </span>
                <button
                  onClick={() => handleAddDirect("analytics", 320, 220)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Canvas
                </button>
              </div>
              <div className="h-48 rounded-xl overflow-hidden border border-white/5 bg-black/30">
                <ProductivityAnalyticsWidget />
              </div>
            </div>
          </div>
        );
      case "system":
        return (
          <div className="flex flex-col h-full space-y-4">
            <p className="text-xs text-white/50 leading-relaxed">
              Display live CPU, RAM, disk usage, and network activity directly on your canvas.
            </p>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Hardware Activity
                </span>
                <button
                  onClick={() => handleAddDirect("system-monitor", 280, 210)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Canvas
                </button>
              </div>
              <div className="h-48 rounded-xl overflow-hidden border border-white/5 bg-black/30">
                <SystemMonitorWidget />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-[330px] h-full flex flex-col bg-[#121215]/95 backdrop-blur-xl border-r border-white/[0.08] p-4 select-none z-30 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Sidebar Header */}
      <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>
          <p className="text-[11px] text-white/45 mt-0.5 leading-tight">{subtitle}</p>
        </div>
        <button
          onClick={toggleSidebar}
          title="Collapse Resource Sidebar"
          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </aside>
  );
};

