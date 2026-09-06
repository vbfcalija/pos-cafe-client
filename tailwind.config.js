/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        cafe: {
          ink: '#2b1b14',
          brown: '#6e4430',
          cream: '#f7f0e5',
          paper: '#fffaf2',
          clay: '#c87948',
          gold: '#d89b4b',
          forest: '#17261e',
          bean: '#5b2e1c',
          sun: '#f5d295',
          foam: '#f8f0e3',
          latte: '#d9c4a9',
          handle: '#e2d1ba',
          saucer: '#e6d5bd',
          iced: '#d9e9e9',
          icedText: '#28484c',
          hot: '#6c3e2a',
          addOn: '#d9b269',
          addOnText: '#382517',
        },
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
      fontFamily: {
        cafe: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
