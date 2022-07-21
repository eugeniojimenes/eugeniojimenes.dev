const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.{md,html}',
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
      },
      typography: ({ theme }) => ({
        custom: {
          css: {
            '--tw-prose-body': theme('colors.stone[700]'),
            '--tw-prose-headings': theme('colors.stone[900]'),
            '--tw-prose-lead': theme('colors.stone[600]'),
            '--tw-prose-links': theme('colors.sky[800]'),
            '--tw-prose-bold': theme('colors.stone[900]'),
            '--tw-prose-counters': theme('colors.stone[500]'),
            '--tw-prose-bullets': theme('colors.stone[300]'),
            '--tw-prose-hr': theme('colors.stone[200]'),
            '--tw-prose-quotes': theme('colors.stone[900]'),
            '--tw-prose-quote-borders': theme('colors.stone[200]'),
            '--tw-prose-captions': theme('colors.stone[500]'),
            '--tw-prose-code': theme('colors.stone[900]'),
            '--tw-prose-pre-code': theme('colors.stone[200]'),
            '--tw-prose-pre-bg': theme('colors.stone[800]'),
            '--tw-prose-th-borders': theme('colors.stone[300]'),
            '--tw-prose-td-borders': theme('colors.stone[200]'),
            '--tw-prose-invert-body': theme('colors.stone[300]'),
            '--tw-prose-invert-headings': theme('colors.white'),
            '--tw-prose-invert-lead': theme('colors.stone[400]'),
            '--tw-prose-invert-links': theme('colors.sky[400]'),
            '--tw-prose-invert-bold': theme('colors.white'),
            '--tw-prose-invert-counters': theme('colors.stone[400]'),
            '--tw-prose-invert-bullets': theme('colors.stone[600]'),
            '--tw-prose-invert-hr': theme('colors.stone[700]'),
            '--tw-prose-invert-quotes': theme('colors.stone[100]'),
            '--tw-prose-invert-quote-borders': theme('colors.stone[700]'),
            '--tw-prose-invert-captions': theme('colors.stone[400]'),
            '--tw-prose-invert-code': theme('colors.white'),
            '--tw-prose-invert-pre-code': theme('colors.stone[300]'),
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': theme('colors.stone[600]'),
            '--tw-prose-invert-td-borders': theme('colors.stone[700]'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')]
}
