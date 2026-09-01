import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // מיתוג פסגות — סגול/מגנטה
        brand: {
          50: "#faf4f8",
          100: "#f2dced",
          200: "#e6badd",
          300: "#d38fc4",
          400: "#bd60a6",
          500: "#a53d87",
          600: "#87306e",
          700: "#682556",
          800: "#4c2a48",
          900: "#3a2036",
        },
        magenta: {
          500: "#c02781",
          600: "#a81f70",
        },
      },
      fontFamily: {
        sans: ["Rubik", "Assistant", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
