import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d4af37", // Primary luxury gold
          600: "#b89226",
          700: "#926f1a",
          800: "#785816",
          900: "#634716",
          950: "#392608",
        },
        obsidian: {
          50: "#f6f7f9",
          100: "#ebedf0",
          200: "#d4d8e0",
          300: "#b0b8c6",
          400: "#8491a7",
          500: "#62708a",
          600: "#4d5870",
          700: "#3e475b",
          800: "#1e2536",
          900: "#131826",
          950: "#0b0f17", // Primary luxury dark obsidian
        },
        emerald: {
          500: "#10b981",
        },
        rose: {
          500: "#f43f5e",
        },
        amber: {
          500: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        serif: ["Playfair Display", "Cinzel", "serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(212, 175, 55, 0.25)",
        "gold-glow": "0 0 25px rgba(212, 175, 55, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
