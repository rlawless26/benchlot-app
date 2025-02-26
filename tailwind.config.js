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
      },
      fontFamily: {
        serif: ['Spectral', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}