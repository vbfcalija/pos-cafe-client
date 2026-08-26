/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        // Primary — teal, the app's main brand/action color (used for solid CTAs).
        primary: {
          DEFAULT: "#437dfb",
          25: "#f8faff",
          50: "#f1f5ff",
          100: "#e3ebff",
          200: "#c5d7fe",
          300: "#9ab9fd",
          400: "#6d99fc",
          500: "#437dfb",
          600: "#2f62e5",
          700: "#264dc2",
          800: "#263f9b",
          900: "#243a7a",
        },
      },
      fontSize: {
        xxs: ['10px', '12px'],
      },
      boxShadow: {
        'dropdown': '0 10px 40px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

