import type { Config } from 'tailwindcss'

const config: Config = {
  // Dark mode uses class strategy (toggled manually or by system preference)
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — rose/pink for the app's primary color
        brand: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        // Minimum supported width
        'xs': '320px',
      },
    },
  },
  plugins: [],
}

export default config
