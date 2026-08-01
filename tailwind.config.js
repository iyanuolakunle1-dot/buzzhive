/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // BuzzHive brand palette (matches the mockup)
        hive: {
          yellow: '#F5B400',
          dark: '#0D0D0D',
          panel: '#161616',
          border: '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
