const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './_drafts/**/*.html',
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_pages/**/.{md,html}',
    './_posts/**/.md',
    './*.{md,html}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '448px',
      ...defaultTheme.screens,
    },
    extend: {
      spacing: {
      '112': '28rem',
      },
      colors: {
        'beige' : { // source: https://www.colorhexa.com/f1ece4
          100: '#f8f5f1',
          200: '#f1eae4',
          300: '#eae3d7',
          400: '#e4daca',
          500: '#ddd1bd',
          600: '#d6c8b0',
          700: '#d0bfa3',
          800: '#c9b596',
          900: '#c2ac8a',
        }
      },
      fontFamily: {
        'marker': ['Permanent Marker', 'cursive'],
        'codepro': ['Source Code Pro', 'monospace'],
      }
    },
  },
  plugins: [require('@tailwindcss/typography')]
}
