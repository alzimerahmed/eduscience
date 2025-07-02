/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'tamil': ['Noto Sans Tamil', 'sans-serif'],
        'sinhala': ['Noto Sans Sinhala', 'sans-serif'],
      },
    },
  },
  plugins: [],
};