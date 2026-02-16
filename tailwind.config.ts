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
        primary: "oklch(75% 0.18 305)",
        "accent-yellow": "oklch(85% 0.15 145)",
        "accent-green": "oklch(95% 0.05 140)",
        "dark-green": "oklch(20% 0.02 140)",
        "gradient-pink": "#FF9FFC",
        "gradient-purple": "#5227FF",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
        bricolage: ["var(--font-bricolage)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      animation: {
        "slide-up": "slideUp 20s linear infinite",
        "slide-diagonal-left": "slideDiagonalLeft 25s linear infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out both",
        "pulse-scale": "pulseScale 0.3s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(-100%)" },
        },
        slideDiagonalLeft: {
          "0%": { transform: "translate(-100%, 100%)" },
          "100%": { transform: "translate(100%, -100%)" },
        },
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        pulseScale: {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
