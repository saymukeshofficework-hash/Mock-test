/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#071426',
          900: '#0b1f3a',
          800: '#0f2a4a',
          700: '#1b3a5c',
          600: '#24466b',
        },
        brand: {
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
        },
        gold: {
          300: '#e9d8a6',
          400: '#ddb84a',
          500: '#d4a72c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(10, 20, 40, 0.06)',
        'card-lg': '0 10px 40px rgba(10, 20, 40, 0.12)',
        glow: '0 0 0 1px rgba(37, 99, 235, 0.08), 0 8px 30px rgba(15, 30, 61, 0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
