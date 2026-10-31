import React, { useState } from "react";
import { FolderGit2, CheckCircle2, Clock } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  progress: number;
  tasksCount: number;
  completedTasks: number;
  dueDate: string;
}

export const ProjectOverviewWidget: React.FC = () => {
  const [projects] = useState<ProjectItem[]>([
    {
      id: "p1",
      name: "DTWallpaper Core Release",
      category: "Engineering",
      progress: 75,
      tasksCount: 12,
      completedTasks: 9,
      dueDate: "Nov 15",
    },
    {
      id: "p2",
      name: "Canvas Widgets System",
      category: "Product",
      progress: 60,
      tasksCount: 8,
      completedTasks: 5,
      dueDate: "Nov 20",
    },
    {
      id: "p3",
      name: "Desktop Portals & Linux Integration",
      category: "Platform",
      progress: 40,
      tasksCount: 10,
      completedTasks: 4,
      dueDate: "Nov 30",
    },
  ]);

  return (
    <div className="flex flex-col h-full p-4 select-none text-white/90">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Active Projects</span>
        </div>
        <span className="text-[10px] text-white/40 font-mono">{projects.length} in progress</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-white/90 leading-tight">{proj.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
                {proj.category}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/40">
                <span>Progress</span>
                <span className="font-mono text-white/70">{proj.progress}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/40 pt-0.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {proj.completedTasks}/{proj.tasksCount} tasks
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                {proj.dueDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
