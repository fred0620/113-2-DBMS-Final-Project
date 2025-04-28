/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0B2D5C',   // 深藍
        secondary: '#BBD2FF', // 淺藍（Figma 背景）
      },
    },
  },
  plugins: [],
};