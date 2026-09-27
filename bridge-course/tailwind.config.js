/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b1526',
          900: '#10213a',
          800: '#1a2f4e',
          700: '#2a4266',
          500: '#5b6f8c',
          300: '#a9b6c8',
        },
        paper: {
          50: '#fffdf8',
          100: '#fbf7ee',
          200: '#f3ecdc',
          300: '#e6dcc4',
        },
        saffron: {
          400: '#f4a340',
          500: '#e8871e',
          600: '#c96d0c',
          700: '#a25608',
        },
        leaf: {
          500: '#1f9d63',
          600: '#17804f',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Noto Serif Devanagari', 'serif'],
      },
      boxShadow: {
        sheet: '0 1px 2px rgba(16,33,58,.06), 0 12px 32px -12px rgba(16,33,58,.25)',
        cta: '0 10px 24px -8px rgba(201,109,12,.55)',
      },
    },
  },
  plugins: [],
}
