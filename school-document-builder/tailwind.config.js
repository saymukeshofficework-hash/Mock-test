/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        devanagari: ['"Noto Sans Devanagari"', '"Mangal"', '"Kokila"', 'sans-serif'],
        serifdev: ['"Noto Serif Devanagari"', '"Mangal"', 'serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#1e3a8a',
          600: '#1a3272',
          700: '#152a5c',
          900: '#0d1a3a',
        },
      },
    },
  },
  plugins: [],
}
