/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Obsidian theme (default dark)
        canvas: {
          bg: "#0a0a0a",
          surface: "#141414",
          elevated: "#1e1e1e",
          border: "#2a2a2a",
          "border-hover": "#3a3a3a",
          text: "#e8e8e8",
          "text-muted": "#888888",
          accent: "#6366f1",
          "accent-hover": "#818cf8",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

