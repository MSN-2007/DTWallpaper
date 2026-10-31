import React, { useState } from "react";
import { WIDGET_REGISTRY, type WidgetDefinition } from "@/widgets/registry";
import { useCanvasStore } from "@/stores";
import type { CanvasWidget } from "@/types";
import {
  Search,
  Plus,
  Clock,
  Timer,
  Flame,
  CheckSquare,
  FolderGit2,
  Calendar,
  BarChart3,
  Activity,
  Sparkles,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  clock: <Clock className="w-5 h-5 text-indigo-400" />,
  timer: <Timer className="w-5 h-5 text-emerald-400" />,
  pomodoro: <Flame className="w-5 h-5 text-rose-400" />,
  "todo-list": <CheckSquare className="w-5 h-5 text-amber-400" />,
  "project-overview": <FolderGit2 className="w-5 h-5 text-purple-400" />,
  schedule: <Calendar className="w-5 h-5 text-teal-400" />,
  analytics: <BarChart3 className="w-5 h-5 text-sky-400" />,
  "system-monitor": <Activity className="w-5 h-5 text-emerald-400" />,
  custom: <Sparkles className="w-5 h-5 text-cyan-400" />,
};

export const WidgetsResourcePanel: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const addWidget = useCanvasStore((s) => s.addWidget);
  const viewport = useCanvasStore((s) => s.viewport);
  const widgets = useCanvasStore((s) => s.widgets);

  const categories = [
    "All",
    "Productivity",
    "Project",
    "Scheduling",
    "Analytics",
    "System",
    "Information",
    "Custom",
  ];

  const handleAdd = (def: WidgetDefinition) => {
    const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom) - def.defaultWidth / 2;
    const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom) - def.defaultHeight / 2;

    const newWidget: CanvasWidget = {
      id: `widget-${def.type}-${Date.now()}`,
      type: def.type,
      x: Math.round(centerX + (Math.random() * 30 - 15)),
      y: Math.round(centerY + (Math.random() * 30 - 15)),
      width: def.defaultWidth,
      height: def.defaultHeight,
      zIndex: widgets.length + 1,
      settings: {},
    };

    addWidget(newWidget);
  };

  const widgetList = Object.values(WIDGET_REGISTRY).filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === "All") return true;
    return w.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="flex flex-col h-full select-none text-white/90">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all widgets & tools..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap font-medium transition-all ${
              activeCategory === cat
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                : "bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06] border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Widget Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {widgetList.map((w) => (
          <div
            key={w.type}
            className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 transition-all flex items-start gap-3"
          >
            {/* Widget Icon Badge */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 group-hover:scale-105 transition-transform flex-shrink-0">
              {CATEGORY_ICONS[w.type] || <Sparkles className="w-5 h-5 text-indigo-400" />}
            </div>

            {/* Widget Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white/90 group-hover:text-white truncate">
                  {w.name}
                </h4>
                <button
                  onClick={() => handleAdd(w)}
                  title="Add to canvas"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 hover:border-transparent text-[10px] font-medium transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 mt-0.5">
                {w.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[9px] text-white/30 font-mono uppercase tracking-wider">
                <span>{w.category}</span>
                <span>•</span>
                <span>{w.defaultWidth}×{w.defaultHeight}px</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
