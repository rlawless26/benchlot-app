/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        'base': '#F0EEE6',
        'accent': '#17613F',
        'text-primary': '#44403C',
        'text-secondary': '#57534E',
        'bg-primary': '#F0EEE6',
        'forest': {
          50: '#e6f0eb',
          100: '#c1d9cf',
          200: '#9dc2b3',
          300: '#78ab96',
          400: '#54947a',
          500: '#17613f',
          600: '#145535',
          700: '#114a2e',
          800: '#0e3f27',
          900: '#0a3420',
        }
      },
      backgroundColor: {
        'default': '#F0EEE6',
      },
      fontFamily: {
        serif: ['Spectral', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}