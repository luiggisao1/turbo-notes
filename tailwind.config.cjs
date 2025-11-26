/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FAF1E3',
          50: '#fffdf8',
          100: '#fffaf2',
          200: '#fff4e6',
          300: '#fff0db',
          400: '#fff0d0',
          500: '#FAF1E3',
          600: '#e8d3b8',
          700: '#ccb691',
          800: '#a8926a',
          900: '#876e47'
        }
      }
    }
  },
  plugins: []
}
