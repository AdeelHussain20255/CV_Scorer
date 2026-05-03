/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        navy: {
          900: "#0a0e1a",
          800: "#0f1629",
          700: "#151e38",
          600: "#1c2847",
        },
        cyan: {
          400: "#00d4ff",
          500: "#00b8e0",
        },
      },
    },
  },
  plugins: [],
};
