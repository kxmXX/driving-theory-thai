import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F0",
        surface: "#FFFFFF",
        gov: {
          blue: "#1a237e",
          red: "#b71c1c",
          gold: "#C9A84C",
          cream: "#FAFAF5",
          dark: "#0d1b3e",
        },
        muted: {
          DEFAULT: "#5C5C5C",
          light: "#9E9E9E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sarabun)", "system-ui", "sans-serif"],
        heading: ["var(--font-kanit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "card": "4px",
      },
    },
  },
  plugins: [],
};

export default config;
