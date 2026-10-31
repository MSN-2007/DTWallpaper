import React from "react";
import { useCanvasStore } from "@/stores";
import { CheckSquare, FolderGit2, Plus } from "lucide-react";
import type { CanvasWidget } from "@/types";

export const TasksProjectsResourcePanel: React.FC = () => {
  const addWidget = useCanvasStore((s) => s.addWidget);
  const viewport = useCanvasStore((s) => s.viewport);
  const widgets = useCanvasStore((s) => s.widgets);

  const handleAddTodo = () => {
    const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom) - 160;
    const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom) - 160;

    const newWidget: CanvasWidget = {
      id: `widget-todo-${Date.now()}`,
      type: "todo-list",
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: 320,
      height: 320,
      zIndex: widgets.length + 1,
      settings: {},
    };
    addWidget(newWidget);
  };

  const handleAddProject = () => {
    const centerX = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom) - 160;
    const centerY = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom) - 130;

    const newWidget: CanvasWidget = {
      id: `widget-project-${Date.now()}`,
      type: "project-overview",
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: 320,
      height: 260,
      zIndex: widgets.length + 1,
      settings: {},
    };
    addWidget(newWidget);
  };

  return (
    <div className="flex flex-col h-full select-none text-white/90 space-y-4">
      <div>
        <p className="text-xs text-white/50 leading-relaxed">
          Centralize your task backlogs and project roadmaps. Place boards directly on your freeform canvas.
        </p>
      </div>

      <div className="space-y-3">
        {/* Action card: To-do List */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white/90">Task Checklist</h4>
                <span className="text-[10px] text-white/40">Daily & priority items</span>
              </div>
            </div>
            <button
              onClick={handleAddTodo}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            Drag-and-drop task items, mark completed items, and link completion stats to analytics.
          </p>
        </div>

        {/* Action card: Project Roadmaps */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white/90">Project Roadmaps</h4>
                <span className="text-[10px] text-white/40">Sprint & milestone milestones</span>
              </div>
            </div>
            <button
              onClick={handleAddProject}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            Organize complex initiatives into actionable milestones with visual progress indicators.
          </p>
        </div>
      </div>
    </div>
  );
};
