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
        primary: "oklch(55% 0.18 305)",
        "primary-light": "oklch(75% 0.18 305)",
        "primary-dark": "oklch(40% 0.18 305)",
        "page-bg": "#E1C0EE",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
