import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Scale
        "primary-50": "oklch(95% 0.035 314deg)",
        "primary-100": "oklch(88% 0.07 314deg)",
        "primary-200": "oklch(80% 0.11 314deg)",
        "primary-300": "oklch(74% 0.14 314deg)",
        "primary-400": "oklch(68% 0.175 314deg)", // ブランドカラー
        "primary-500": "oklch(57% 0.175 314deg)",
        "primary-600": "oklch(47% 0.165 314deg)",
        "primary-700": "oklch(37% 0.14 314deg)",
        "primary-900": "oklch(18% 0.075 314deg)",

        // Secondary Brand Color
        secondary: "oklch(72% 0.13 314deg)", // やや濃い紫

        // Neutral Scale
        "gray-50": "oklch(97% 0 0deg)",
        "gray-100": "oklch(93% 0 0deg)",
        "gray-200": "oklch(86% 0 0deg)",
        "gray-400": "oklch(65% 0 0deg)",
        "gray-600": "oklch(45% 0 0deg)",
        "gray-700": "oklch(35% 0 0deg)",
        "gray-900": "oklch(13% 0 0deg)",

        // Semantic Colors (Tailwind用)
        "bg-base": "var(--color-bg)",
        "text-base": "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "border-default": "var(--color-border)",
        accent: "var(--color-accent)",

        // Alias（後方互換性）
        primary: "var(--color-primary-400)",
        "primary-light": "var(--color-primary-300)",
        "primary-dark": "var(--color-primary-600)",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
        heading: ["var(--font-kaisei-opti)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
