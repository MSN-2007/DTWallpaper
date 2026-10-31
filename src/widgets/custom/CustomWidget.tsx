import React from "react";
import { Sparkles, Code2 } from "lucide-react";

interface CustomWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({ settings, onUpdateSettings }) => {
  const title = (settings?.title as string) || "Custom Note / Widget";
  const content = (settings?.content as string) || "Write notes, embed markdown, or format links here...";
  const badge = (settings?.badge as string) || "Custom";

  const [isEditing, setIsEditing] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(title);
  const [draftContent, setDraftContent] = React.useState(content);

  const handleSave = () => {
    setIsEditing(false);
    onUpdateSettings?.({
      ...(settings || {}),
      title: draftTitle,
      content: draftContent,
    });
  };

  return (
    <div className="flex flex-col justify-between h-full p-3.5 select-none text-white">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">{badge}</span>
        </div>
        <button
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          <Code2 className="w-3 h-3 text-cyan-400" />
          <span>{isEditing ? "Save" : "Edit"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {isEditing ? (
          <div className="flex flex-col gap-2 h-full">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Widget Title"
              className="px-2 py-1 text-xs rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50"
            />
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Content / notes..."
              rows={4}
              className="flex-1 px-2 py-1 text-xs rounded bg-white/5 border border-white/10 text-white resize-none focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold text-white/90">{title}</h3>
            <p className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        )}
      </div>
    </div>
  );
};
