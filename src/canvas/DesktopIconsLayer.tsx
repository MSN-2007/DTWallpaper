import React from "react";
import type { DesktopIconItem } from "@/types";
import { Folder, FileCode, FileText, File, ExternalLink } from "lucide-react";

interface DesktopIconsLayerProps {
  icons: DesktopIconItem[];
  onOpenItem: (path: string) => void;
}

export const DesktopIconsLayer: React.FC<DesktopIconsLayerProps> = ({ icons, onOpenItem }) => {
  const getFileIcon = (icon: DesktopIconItem) => {
    if (icon.is_dir) {
      return <Folder className="w-8 h-8 text-amber-400 drop-shadow-md" />;
    }
    const ext = icon.extension.toLowerCase();
    if (["ts", "tsx", "js", "jsx", "html", "css", "py", "rs", "json"].includes(ext)) {
      return <FileCode className="w-8 h-8 text-indigo-400 drop-shadow-md" />;
    }
    if (["txt", "md", "pdf", "docx", "doc"].includes(ext)) {
      return <FileText className="w-8 h-8 text-blue-400 drop-shadow-md" />;
    }
    return <File className="w-8 h-8 text-emerald-400 drop-shadow-md" />;
  };

  return (
    <div className="absolute top-16 left-6 bottom-16 pointer-events-auto flex flex-col flex-wrap gap-3 content-start max-w-[280px] z-0 select-none">
      {icons.map((item) => (
        <div
          key={item.path}
          onDoubleClick={() => onOpenItem(item.path)}
          title={`Double click to open ${item.name}\n${item.path}`}
          className="group flex flex-col items-center justify-center w-[84px] p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer backdrop-blur-[2px] border border-transparent hover:border-white/10"
        >
          <div className="relative mb-1 flex items-center justify-center">
            {getFileIcon(item)}
            {!item.is_dir && (
              <ExternalLink className="w-2.5 h-2.5 absolute bottom-0 right-0 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <span className="text-[11px] font-medium text-white/90 group-hover:text-white text-center line-clamp-2 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

