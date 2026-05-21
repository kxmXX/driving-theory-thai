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
        background: "#F8F9FA",
        surface: "#FFFFFF",
        accent: {
          blue: "#003F87",
          gold: "#C9A84C",
        },
        muted: {
          DEFAULT: "#6C757D",
          light: "#ADB5BD",
        },
      },
      fontFamily: {
        sans: ["var(--font-sarabun)", "system-ui", "sans-serif"],
        heading: ["var(--font-kanit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "card": "12px",
      },
    },
  },
  plugins: [],
};

export default config;
