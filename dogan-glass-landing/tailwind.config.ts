import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
        },
        glass: "rgba(255,255,255,0.08)"
      },
      backdropBlur: {
        xs: "2px"
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.35)",
      }
    },
  },
  plugins: [],
};
export default config;
