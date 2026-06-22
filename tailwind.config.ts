import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#031912",
          900: "#06251b",
          800: "#0b3424",
          700: "#105136",
          500: "#17a05e"
        },
        trophy: {
          400: "#f5cf5b",
          500: "#d7aa27"
        },
        matchred: "#ef3f3f",
        floodlight: "#e8f5ee"
      },
      boxShadow: {
        glow: "0 0 60px rgba(245, 207, 91, 0.16)",
        panel: "0 18px 60px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
