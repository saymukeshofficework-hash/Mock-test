/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0b0f2b',
          900: '#0f1440',
          800: '#161c52',
          700: '#212a6e',
        },
        cosmic: {
          500: '#3f4fb0',
          600: '#333fa0',
        },
        royal: {
          500: '#4d5fd1',
          600: '#3d4bb8',
        },
        blush: {
          50: '#fff5f8',
          100: '#ffe8f0',
          200: '#ffd0e1',
        },
        rose: {
          400: '#f472a6',
          500: '#ec4899',
          600: '#db2777',
        },
        lavender: {
          200: '#e3d9f7',
          400: '#c4a9ec',
        },
        champagne: {
          300: '#f0dbb0',
          400: '#e3c184',
          500: '#d1a75a',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Noto Serif Devanagari"', 'serif'],
        sans: ['"Manrope"', '"Noto Sans Devanagari"', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0b0f2b 0%, #212a6e 45%, #7a3f8f 75%, #db2777 100%)',
        'soft-gradient': 'linear-gradient(135deg, #fff5f8 0%, #ffe8f0 50%, #e3d9f7 100%)',
        'twilight-gradient': 'linear-gradient(180deg, #0f1440 0%, #3f4fb0 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(219, 39, 119, 0.25)',
        'glow-blue': '0 0 40px rgba(77, 95, 209, 0.3)',
        card: '0 10px 40px rgba(15, 20, 64, 0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.7s ease-out both',
      },
    },
  },
  plugins: [],
}
