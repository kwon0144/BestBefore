/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import { green, amber, grey, teal, lightGreen } from "@mui/material/colors";

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
    extend: {
      animation: {
        gradient: 'gradient 8s linear infinite'
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      colors: {
        primary: {
          main: green[900],
        },
        green: green,
        teal: teal,
        lightGreen: lightGreen,
        amber: amber,
        grey: grey,
        background: '#f5f6f2',
      },
      background: {
        default: '#f5f6f2',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
        }
      }
    }
  })]
}