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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        backdropIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        modalIn: {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        successIn: {
          "0%":   { opacity: "0", transform: "scale(0.82)" },
          "65%":  { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn:     "fadeIn 0.2s ease-in",
        backdropIn: "backdropIn 0.2s ease-out",
        modalIn:    "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        successIn:  "successIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      },
    },
  },
  plugins: [],
};
export default config;
