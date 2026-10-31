/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#183B32', // Primary dark forest green
          800: '#204a3f',
          700: '#276749', // Secondary green
          600: '#347e5b',
          500: '#3B9471', // Renewable green
          400: '#70A58B', // Muted sage
          300: '#9ac1af',
          200: '#c5ded3',
          100: '#E8F0EA', // Pale green
          50:  '#F4F8F5',
        },
        brand: {
          bg: '#F7F9F7',
          surface: '#FFFFFF',
          text: '#26332E',
          muted: '#718078',
          border: '#E2E9E4',
          amber: '#D49B48',
          slate: '#5D8290',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      maxWidth: {
        'dashboard': '1440px',
      },
    },
  },
  plugins: [],
};
