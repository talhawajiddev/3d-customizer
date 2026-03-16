import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./api/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#ffffff",
        panel: "#f8fafc",
        accent: "#64748b",
        accentMuted: "#cbd5e1"
      },
      boxShadow: {
        soft: "0 18px 40px rgba(148, 163, 184, 0.18)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at center, rgba(148,163,184,0.18) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
