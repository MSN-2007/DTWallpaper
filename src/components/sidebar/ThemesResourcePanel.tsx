import React from "react";
import { THEMES } from "@/themes/themes";
import { useCanvasStore } from "@/stores";
import { Check } from "lucide-react";

export const ThemesResourcePanel: React.FC = () => {
  const activeThemeId = useCanvasStore((s) => s.activeThemeId);
  const setActiveThemeId = useCanvasStore((s) => s.setActiveThemeId);

  return (
    <div className="flex flex-col h-full select-none text-white/90">
      <div className="mb-3">
        <p className="text-xs text-white/50 leading-relaxed">
          Select an aesthetic for your whiteboard canvas. Each theme customizes backgrounds, grid dots, widget surfaces, and accents.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {Object.values(THEMES).map((theme) => {
          const isSelected = activeThemeId === theme.id;

          return (
            <div
              key={theme.id}
              onClick={() => setActiveThemeId(theme.id)}
              className={`group p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-white/[0.08] border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50"
                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/15"
              }`}
            >
              {/* Color Swatch Preview */}
              <div
                className={`w-full h-16 rounded-xl bg-gradient-to-r ${theme.previewGradient} border border-white/10 relative overflow-hidden flex items-center justify-between px-3.5 mb-2.5`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.accentHex }}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.surfaceHex }}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.bgHex }}
                  />
                </div>

                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-black shadow">
                    <Check className="w-3 h-3 stroke-[3]" /> Active
                  </span>
                )}
              </div>

              {/* Theme Details */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white/95">{theme.name}</h4>
                  <p className="text-[11px] text-white/50 mt-0.5">{theme.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
