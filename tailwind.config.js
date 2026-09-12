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
        // Primary — espresso brown sampled from the Brthrs Café logo.
        primary: {
          DEFAULT: "#6e4430",
          25: "#fdfbf9",
          50: "#f8f1eb",
          100: "#f0e2d7",
          200: "#dfc4b1",
          300: "#c99d7e",
          400: "#ad7453",
          500: "#8c563a",
          600: "#6e4430",
          700: "#58362a",
          800: "#472d25",
          900: "#35271f",
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
