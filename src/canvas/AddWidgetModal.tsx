import React from "react";
import { WIDGET_REGISTRY } from "@/widgets/registry";
import { Plus, X, Clock, Timer, Flame, CheckSquare, Sparkles } from "lucide-react";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  clock: <Clock className="w-5 h-5 text-indigo-400" />,
  timer: <Timer className="w-5 h-5 text-emerald-400" />,
  pomodoro: <Flame className="w-5 h-5 text-rose-400" />,
  "todo-list": <CheckSquare className="w-5 h-5 text-amber-400" />,
  custom: <Sparkles className="w-5 h-5 text-cyan-400" />,
};

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-5 rounded-2xl bg-[#141417] border border-white/10 shadow-2xl text-white select-none"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">Add Widget to Canvas</h2>
            <p className="text-xs text-white/50">Select a built-in or custom widget to place on your workspace</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(WIDGET_REGISTRY).map((widget) => (
            <button
              key={widget.type}
              onClick={() => {
                onAdd(widget.type);
                onClose();
              }}
              className="flex flex-col items-start p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 transition-all group text-left"
            >
              <div className="p-2 mb-2 rounded-lg bg-white/5 group-hover:scale-105 transition-transform">
                {ICONS[widget.type] || <Plus className="w-5 h-5 text-white/70" />}
              </div>
              <span className="text-xs font-medium text-white/90 group-hover:text-white">
                {widget.name}
              </span>
              <p className="mt-1 text-[11px] text-white/50 line-clamp-2">
                {widget.description || `${widget.name} widget`}
              </p>
              <span className="mt-2 text-[10px] text-white/30 uppercase tracking-wider">
                {widget.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
