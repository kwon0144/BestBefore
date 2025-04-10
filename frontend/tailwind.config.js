/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          foregroud: "#FFFFFF",
          primary: {
            DEFAULT: "#0d9488"
          },
          background: {
            DEFAULT: "#f5f6f2"
          },
          lightgreen: {
            DEFAULT: "#78bba2"
          },
          green: {
            DEFAULT: "#0d9488"
          },
          darkgreen: {
            DEFAULT: "#2d5a4b"
          }
        }
      }
    }
  })]
}