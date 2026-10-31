import React, { useState } from "react";
import { WORKSPACE_TEMPLATES, type WorkspaceTemplate } from "@/templates/templates";
import { useCanvasStore } from "@/stores";
import type { CanvasWidget } from "@/types";
import { Search, Eye, Play, X } from "lucide-react";

export const TemplatesResourcePanel: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<WorkspaceTemplate | null>(null);

  const setWidgets = useCanvasStore((s) => s.setWidgets);
  const currentWidgetCount = useCanvasStore((s) => s.widgets.length);

  const categories = [
    "All",
    "Popular",
    "Personal Productivity",
    "Daily Planner",
    "Project Management",
    "Student Planner",
    "Minimal Workspace",
  ];

  const filtered = WORKSPACE_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Popular") return tpl.badge === "Popular" || tpl.badge === "Recommended";
    return tpl.category === selectedCategory;
  });

  const handleApplyTemplate = (tpl: WorkspaceTemplate) => {
    if (currentWidgetCount > 0) {
      const confirmReplace = window.confirm(
        `Apply "${tpl.name}" template? This will set up ${tpl.widgetCount} widgets on your canvas.`
      );
      if (!confirmReplace) return;
    }

    const newWidgets: CanvasWidget[] = tpl.widgets.map((w, idx) => ({
      ...w,
      id: `w-${tpl.id}-${Date.now()}-${idx}`,
    }));

    setWidgets(newWidgets);
    setPreviewTemplate(null);
  };

  return (
    <div className="flex flex-col h-full select-none text-white/90">
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates & planners..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Category Pills Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap font-medium transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                : "bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06] border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/15 transition-all space-y-2.5"
          >
            {/* Visual Canvas Mockup Card */}
            <div
              onClick={() => setPreviewTemplate(tpl)}
              className="relative w-full h-24 rounded-xl bg-gradient-to-br from-zinc-900 to-[#121216] border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer group-hover:border-indigo-500/30 transition-all"
            >
              {/* Whiteboard dots pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
              />

              {/* Mini mockup widgets representation */}
              <div className="relative flex items-center gap-1.5 z-10 scale-90">
                <div className="w-14 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex flex-col p-1 justify-between">
                  <div className="w-4 h-1 bg-indigo-400 rounded-full" />
                  <div className="space-y-0.5">
                    <div className="w-full h-1 bg-white/20 rounded" />
                    <div className="w-2/3 h-1 bg-white/20 rounded" />
                  </div>
                </div>
                <div className="w-16 h-14 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex flex-col p-1 justify-between">
                  <div className="w-5 h-1 bg-emerald-400 rounded-full" />
                  <div className="space-y-0.5">
                    <div className="w-full h-1 bg-white/20 rounded" />
                    <div className="w-3/4 h-1 bg-white/20 rounded" />
                  </div>
                </div>
                <div className="w-12 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex flex-col p-1 justify-between">
                  <div className="w-3 h-1 bg-amber-400 rounded-full" />
                  <div className="w-full h-1 bg-white/20 rounded" />
                </div>
              </div>

              {/* Badge */}
              {tpl.badge && (
                <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold tracking-wide">
                  {tpl.badge}
                </span>
              )}
            </div>

            {/* Template Info & Action */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white/90 group-hover:text-white">
                  {tpl.name}
                </h4>
                <span className="text-[10px] font-mono text-white/40">
                  {tpl.widgetCount} widgets
                </span>
              </div>
              <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5 leading-relaxed">
                {tpl.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleApplyTemplate(tpl)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Use Template</span>
              </button>
              <button
                onClick={() => setPreviewTemplate(tpl)}
                title="Preview Template Details"
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors border border-white/5"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Larger Template Preview Modal */}
      {previewTemplate && (
        <div
          onClick={() => setPreviewTemplate(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg p-6 rounded-2xl bg-[#141417] border border-white/10 shadow-2xl text-white space-y-4"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{previewTemplate.name}</h3>
                  {previewTemplate.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {previewTemplate.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-0.5">{previewTemplate.category}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {previewTemplate.description}
            </p>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                Included Widgets ({previewTemplate.widgetCount})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {previewTemplate.widgets.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="capitalize text-white/80">{w.type.replace("-", " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyTemplate(previewTemplate)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Apply To Canvas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
