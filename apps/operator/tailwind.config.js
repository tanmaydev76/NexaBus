/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D0121C",
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc7c7",
          600: "#D0121C",
          700: "#b30f17",
        },
      },
    },
  },
  plugins: [],
};
