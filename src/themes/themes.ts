export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  bgHex: string;
  dotColor: string;
  surfaceHex: string;
  borderHex: string;
  accentHex: string;
  accentText: string;
  previewGradient: string;
}

export const THEMES: Record<string, ThemeDefinition> = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian",
    description: "Deep black and charcoal minimalism (Default)",
    bgHex: "#09090b",
    dotColor: "rgba(255, 255, 255, 0.07)",
    surfaceHex: "#141417",
    borderHex: "rgba(255, 255, 255, 0.08)",
    accentHex: "#6366f1",
    accentText: "#a5b4fc",
    previewGradient: "from-zinc-950 via-zinc-900 to-black",
  },
  jade: {
    id: "jade",
    name: "Jade",
    description: "Deep forest greens and emerald accents",
    bgHex: "#06130d",
    dotColor: "rgba(52, 211, 153, 0.09)",
    surfaceHex: "#0b2017",
    borderHex: "rgba(52, 211, 153, 0.12)",
    accentHex: "#10b981",
    accentText: "#6ee7b7",
    previewGradient: "from-[#04120b] via-[#062417] to-[#0a3522]",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy oceanic blue atmosphere",
    bgHex: "#060b17",
    dotColor: "rgba(96, 165, 250, 0.09)",
    surfaceHex: "#0d1629",
    borderHex: "rgba(96, 165, 250, 0.12)",
    accentHex: "#3b82f6",
    accentText: "#93c5fd",
    previewGradient: "from-[#030712] via-[#07132e] to-[#0f2452]",
  },
  amber: {
    id: "amber",
    name: "Amber",
    description: "Warm espresso, dark bronze, and gold",
    bgHex: "#140e06",
    dotColor: "rgba(251, 191, 36, 0.09)",
    surfaceHex: "#22170b",
    borderHex: "rgba(251, 191, 36, 0.12)",
    accentHex: "#f59e0b",
    accentText: "#fcd34d",
    previewGradient: "from-[#100b04] via-[#241707] to-[#3d270c]",
  },
  amethyst: {
    id: "amethyst",
    name: "Amethyst",
    description: "Mystic midnight violet and rich purple",
    bgHex: "#0f0817",
    dotColor: "rgba(192, 132, 252, 0.09)",
    surfaceHex: "#1a0f29",
    borderHex: "rgba(192, 132, 252, 0.12)",
    accentHex: "#a855f7",
    accentText: "#d8b4fe",
    previewGradient: "from-[#09040f] via-[#1b0a2e] to-[#2f1250]",
  },
  paper: {
    id: "paper",
    name: "Paper",
    description: "Clean, ultra-minimal light architect canvas",
    bgHex: "#f4f4f5",
    dotColor: "rgba(0, 0, 0, 0.12)",
    surfaceHex: "#ffffff",
    borderHex: "rgba(0, 0, 0, 0.09)",
    accentHex: "#4f46e5",
    accentText: "#312e81",
    previewGradient: "from-zinc-100 via-stone-100 to-zinc-200",
  },
};
